import Papa from 'papaparse';
import _ from 'lodash';


// Helper function to round numbers to 2 decimal places - used for currency calculations, just in case...
// This helps avoid floating point math issues when comparing currency values
export const round = (num) => Math.round(num * 100) / 100;


// Converts a currency string (like "$1,234.56") to a number
// Removes dollar signs and commas, then converts to float
export const parseCurrency = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, ''));
};

// Finds the relevant columns in the CSV data
// Takes a list of headers and a mapping of column names to search for
// Examples: date could be "date", "transaction date", "posted date", etc.
export const findRelevantColumns = (headers, mappings) => {
  const result = {};
  
  // Iterate over the mappings and find the first matching header
  Object.entries(mappings).forEach(([key, possibleNames]) => {
    const foundHeader = headers.find(header => 
      possibleNames.some(name => 
        header.toLowerCase().includes(name.toLowerCase())
      )
    );
    result[key] = foundHeader;
  });

  return result;
};

// Standardizes date format to MM/DD/YYYY
// This ensures dates can be compared regardless of input format
export const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr; // Return original if parsing fails
  }
};


// Main function to process bank and YNAB transaction data
// Takes raw CSV strings and returns an array of standardized transactions
export const processTransactions = (bankData, ynabData) => {
  const parsedTransactions = [];


  // Process bank transactions
  // 1. Parse CSV data using PapaParse  
  const bankParsed = Papa.parse(bankData, { header: true });
  const bankHeaders = bankParsed.meta.fields;
  
  // 2. Find the relevant columns in the bank CSV
  // Different banks have different column names for the same thing
  // It is a little jank, but if your bank doesn't use one of these, you can just add it to the mappings
  const bankMapping = findRelevantColumns(bankHeaders, {
    date: ['date', 'transaction date', 'posted date'],
    withdrawal: ['withdrawal', 'debit', 'amount', 'payment', 'charge'],
    deposit: ['deposit', 'credit', 'amount'],
    description: ['description', 'payee', 'memo', 'details', 'transaction', 'name']
  });

  // 3. Process each bank transaction
  bankParsed.data.forEach(row => {
    // Skip rows without dates (usually headers or footers)
    if (!row[bankMapping.date]) return;
    

    // Handle both withdrawal and deposit columns
    // Some banks use separate columns, others use positive/negative amounts    
    const withdrawal = parseCurrency(row[bankMapping.withdrawal]);
    const deposit = parseCurrency(row[bankMapping.deposit]);
    const amount = withdrawal ? -withdrawal : deposit;

    // Only add valid transactions (has amount and it's not zero)
    if (!isNaN(amount) && amount !== 0) {
      parsedTransactions.push({
        date: formatDate(row[bankMapping.date]),
        amount: round(amount),
        description: row[bankMapping.description] || '',
        source: 'bank',
        type: withdrawal ? 'withdrawal' : 'deposit',
        matched: false
      });
    }
  });

  // Process YNAB transactions
  // 1. Parse YNAB CSV data  
  const ynabParsed = Papa.parse(ynabData, { header: true });
  const ynabHeaders = ynabParsed.meta.fields;

  // 2. Find the relevant columns in the YNAB CSV
  // A little less jank because YNAB is YNAB lol
  const ynabMapping = findRelevantColumns(ynabHeaders, {
    date: ['date'],
    outflow: ['outflow'],
    inflow: ['inflow'],
    description: ['payee', 'memo', 'description']
  });

  // 3. Process each YNAB transaction
  ynabParsed.data.forEach(row => {
    if (!row[ynabMapping.date]) return;
    
    const outflow = parseCurrency(row[ynabMapping.outflow]);
    const inflow = parseCurrency(row[ynabMapping.inflow]);
    const amount = outflow ? -outflow : inflow;

    // Only add valid transactions (has amount and it's not zero)
    if (!isNaN(amount) && amount !== 0) {
      parsedTransactions.push({
        date: formatDate(row[ynabMapping.date]),
        amount: round(amount),
        description: row[ynabMapping.description] || '',
        source: 'ynab',
        type: outflow ? 'outflow' : 'inflow',
        matched: false
      });
    }
  });

  return parsedTransactions;
};

// Process transactions to find matches & calculate daily totals
// This is the main reconciliation logic/janky magic
export const processDailyTransactions = (transactions) => {
  // 1. Group transactions by date
  const groupedByDate = _.groupBy(transactions, 'date');

  // 2. Process each date group
  return Object.entries(groupedByDate).map(([date, dayTransactions]) => {
    // Separate transactions by source (bank & ynab)
    const bankTxs = dayTransactions.filter(t => t.source === 'bank');
    const ynabTxs = dayTransactions.filter(t => t.source === 'ynab');

    // Group transactions by amount for each source
    // This helps match transactions - amounts must match 
    // (& this is where it kinda sucks with split transactions if you are using those)
    // if you're smart enough to figure this part out, you probz don't need this tool & plz submit a pull request LOL
    const bankByAmount = _.groupBy(bankTxs, tx => round(tx.amount));
    const ynabByAmount = _.groupBy(ynabTxs, tx => round(tx.amount));

    // Initialize arrays to track matched & unmatched transactions
    const matchedPairs = [];
    const unmatchedBank = [...bankTxs];
    const unmatchedYnab = [...ynabTxs];

    //3. Match transactions with same amount 
    // Two transactions match if they have the same amount on the same date
    Object.entries(bankByAmount).forEach(([amount, bankTransactions]) => {
      const ynabTransactions = ynabByAmount[amount] || [];
      const matchCount = Math.min(bankTransactions.length, ynabTransactions.length);

      for (let i = 0; i < matchCount; i++) {
        // Record the matched pair
        matchedPairs.push({
          bank: bankTransactions[i],
          ynab: ynabTransactions[i]
        });

        // Remove matched transactions from the unmatched arrays
        const bankIndex = unmatchedBank.indexOf(bankTransactions[i]);
        const ynabIndex = unmatchedYnab.indexOf(ynabTransactions[i]);
        
        if (bankIndex !== -1) unmatchedBank.splice(bankIndex, 1);
        if (ynabIndex !== -1) unmatchedYnab.splice(ynabIndex, 1);
      }
    });

    //4. Return all that info
    return {
      date,
      matchedPairs, // Array of matched pairs
      unmatchedBank, // Array of unmatched bank transactions
      unmatchedYnab, // Array of unmatched ynab transactions
      totalBank: round(_.sumBy(bankTxs, 'amount')), // Total of all bank transactions
      totalYnab: round(_.sumBy(ynabTxs, 'amount')), // Total of all ynab transactions
      matchedCount: matchedPairs.length, // Number of matched transactions
      unmatchedBankCount: unmatchedBank.length, // Number of unmatched bank transactions
      unmatchedYnabCount: unmatchedYnab.length
    };
  //sort days by newest to oldest
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};