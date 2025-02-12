import React, { useState, useEffect } from 'react';
import { processTransactions, processDailyTransactions } from '../utils/csvProcessor';

// ReconciliationHelper component for displaying and managing reconciliation results
// Accepts bankData and ynabData as CSV strings 

function ReconciliationHelper({ bankData, ynabData }) {
  // State variables for managing transactions and selected date
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);

  // Process transaction data when component mounts or data changes
  useEffect(() => {
    const processData = () => {
      try {
        // Parse and process all transactions from both sources
        const parsedTransactions = processTransactions(bankData, ynabData);
        
        // Group transactions by date & find matches
        const processedData = processDailyTransactions(parsedTransactions);
        
        // Update state with processed transactions
        setTransactions(processedData);
        setLoading(false);
      } catch (error) {
        throw new Error('invalid data format - please make sure your CSV files contain expected bank statement & YNAB columns');
      }
    };

    // Process data only if both bank and YNAB data are available
    if (bankData && ynabData) {
      processData();
    }
  }, [bankData, ynabData]);

  // Filter transactions based on selected date
  const filteredTransactions = selectedDate === 'all' 
    ? transactions 
    : transactions.filter(t => t.date === selectedDate);

  // Get unique dates for the dropdown
  const dates = ['all', ...new Set(transactions.map(t => t.date))];


  //show loading state while processing transactions
  if (loading) {
    return <div>Loading transactions...</div>;
  }

  // Render the reconciliation helper component
  return (
    <div className="reconciliation-helper">
      {/* Dropdown for selecting a specific date */}
      <div className="controls">
        <select 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-select"
        >
          <option value="all">All Dates</option>
          {dates.filter(d => d !== 'all').map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>

        {/* Transaction list grouped by date */}
        <div className="transactions">
          {filteredTransactions.map((day, index) => {
            // Calculate the difference between bank and YNAB totals
            const difference = Math.abs(day.totalBank - day.totalYnab);
            // Determine if there is a discrepancy
            const hasDiscrepancy = difference > 0.01;

            return (
              <div 
                key={day.date} 
                className={`day-transactions ${hasDiscrepancy ? 'has-discrepancy' : ''}`}
              >
                {/* Display the date and total amounts */}
                <h3>
                  {day.date} 
                  {hasDiscrepancy && 
                    <span className="difference">
                      Difference: ${difference.toFixed(2)}
                    </span>
                  }
                </h3>

                {/* Display matched and unmatched transactions */}
                <div className="transactions-grid">
                    {/* Display matched transactions */}
                  <div className="transaction-column">
                    <h4>Matched Transactions ({day.matchedCount})</h4>
                    {day.matchedPairs.map((pair, i) => (
                      <div key={i} className="matched-pair">
                        <div className="bank-tx">
                          ${Math.abs(pair.bank.amount).toFixed(2)} {pair.bank.type} - {pair.bank.description}
                        </div>
                        <div className="ynab-tx">
                          ${Math.abs(pair.ynab.amount).toFixed(2)} {pair.ynab.type} - {pair.ynab.description}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Display unmatched transactions */}
                  <div className="transaction-column">
                    <h4>Unmatched Transactions</h4>

                    {/* Display unmatched bank transactions */}
                    <div className="unmatched-bank">
                      <h5>Bank Only: ({day.unmatchedBankCount})</h5>
                      {day.unmatchedBank.map((tx, i) => (
                        <div key={i} className="unmatched">
                          ${Math.abs(tx.amount).toFixed(2)} {tx.type} - {tx.description}
                        </div>
                      ))}
                    </div>

                    {/* Display unmatched YNAB transactions */}
                    <div className="unmatched-ynab">
                      <h5>YNAB Only: ({day.unmatchedYnabCount})</h5>
                      {day.unmatchedYnab.map((tx, i) => (
                        <div key={i} className="unmatched">
                          ${Math.abs(tx.amount).toFixed(2)} {tx.type} - {tx.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Display totals for the date */}
                <div className="totals">
                  <div>Bank Total: ${day.totalBank.toFixed(2)}</div>
                  <div>YNAB Total: ${day.totalYnab.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}

export default ReconciliationHelper;