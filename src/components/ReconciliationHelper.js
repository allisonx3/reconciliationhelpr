import React, { useState, useEffect } from 'react';
import { processTransactions, processDailyTransactions } from '../utils/csvProcessor';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { IoChevronDown, IoSearchOutline } from 'react-icons/io5';

// ReconciliationHelper component for displaying and managing reconciliation results
// Accepts bankData and ynabData as CSV strings 

function ReconciliationHelper({ bankData, ynabData, onStartOver }) {
  // State variables for managing transactions and selected date
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResultsCount, setSearchResultsCount] = useState(0);

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

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle scroll visibility for back-to-top button
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Get unique dates from transactions for the date picker
  const availableDates = [...new Set(transactions.map(t => new Date(t.date)))];

  // Search functionality helpers
  const matchAmount = (amount) => {
    const amountStr = Math.abs(amount).toFixed(2);
    return amountStr.includes(searchTerm) || 
           amountStr.replace('.', '').includes(searchTerm); // Match without decimal
  };

  const transactionMatches = (tx) => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matchAmount(tx.amount) ||
    tx.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase());

  // Filter transactions based on selected date and filter type, including search
  const filterBySearch = (transaction) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in matched pairs
    const matchedPairsMatch = transaction.matchedPairs.some(pair => 
      transactionMatches(pair.bank) || transactionMatches(pair.ynab)
    );
    
    // Search in unmatched transactions
    const unmatchedBankMatch = transaction.unmatchedBank.some(transactionMatches);
    const unmatchedYnabMatch = transaction.unmatchedYnab.some(transactionMatches);
    
    // Return true if any section has a match
    return matchedPairsMatch || unmatchedBankMatch || unmatchedYnabMatch;
  };

  // Filtered transactions based on selected date and filter type, including search
  const filteredTransactions = transactions
    .filter(t => {
      if (!selectedDate) return true;
      
      // Convert the transaction date string to a Date object for comparison
      const txDate = new Date(t.date);
      const selected = new Date(selectedDate);
      
      // Compare year, month, and day
      return txDate.getFullYear() === selected.getFullYear() &&
             txDate.getMonth() === selected.getMonth() &&
             txDate.getDate() === selected.getDate();
    })
    .filter(day => {
      switch (filterType) {
        case 'unmatched':
          return day.unmatchedBankCount > 0 || day.unmatchedYnabCount > 0;
        case 'matched':
          return day.unmatchedBankCount === 0 && day.unmatchedYnabCount === 0;
        default:
          return true;
      }
    })
    .filter(filterBySearch);

  // Update search results count when filtered transactions change
  useEffect(() => {
    if (searchTerm) {
      const totalMatches = filteredTransactions.reduce((acc, day) => {
        let matches = 0;
        
        // Count matches in matched pairs (each pair counts as 1)
        matches += day.matchedPairs.filter(pair => 
          transactionMatches(pair.bank) || transactionMatches(pair.ynab)
        ).length;
        
        // Count matches in unmatched transactions
        matches += day.unmatchedBank.filter(transactionMatches).length;
        matches += day.unmatchedYnab.filter(transactionMatches).length;
        
        return acc + matches;
      }, 0);
      
      setSearchResultsCount(totalMatches);
    } else {
      setSearchResultsCount(0);
    }
  }, [filteredTransactions, searchTerm]);

  // helper function to highlight matched text
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="search-highlight">
          {text.slice(index, index + searchTerm.length)}
        </span>
        {text.slice(index + searchTerm.length)}
      </>
    );
  };

  //show loading state while processing transactions
  if (loading) {
    return <div>Loading transactions...</div>;
  }

  // Render the reconciliation helper component
  return (
    <div className="reconciliation-helper">
      <div className="controls">
        <div className="search-container">
          <IoSearchOutline className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <>
              <span className="results-count">{searchResultsCount}</span>
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            </>
          )}
        </div>
        
        <div className="filters">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setIsDatePickerOpen(false);
            }}
            customInput={
              <button className="date-picker-button">
                <span>{selectedDate ? selectedDate.toLocaleDateString() : 'Select Date'}</span>
                <IoChevronDown />
              </button>
            }
            includeDates={availableDates}
            onClickOutside={() => setIsDatePickerOpen(false)}
            open={isDatePickerOpen}
            onInputClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            popperClassName="datepicker-popper"
          />
          {selectedDate && (
            <button
              className="clear-filter"
              onClick={() => setSelectedDate(null)}
              aria-label="Clear date filter"
            >
              ×
            </button>
          )}
          <div className="select-wrapper">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Filter</option>
              <option value="matched">Matched Only</option>
              <option value="unmatched">Unmatched Only</option>
            </select>
            <IoChevronDown style={{ 
              position: 'absolute', 
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'white'
            }} />
          </div>
          {filterType !== 'all' && (
            <button
              className="clear-filter"
              onClick={() => setFilterType('all')}
              aria-label="Clear filter"
            >
              ×
            </button>
          )}
        </div>
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
              className={`day-transactions ${hasDiscrepancy ? 'has-discrepancy' : ''} ${
                day.unmatchedBankCount === 0 && day.unmatchedYnabCount === 0 ? 'all-matched' : ''
              }`}
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
                        ${Math.abs(pair.bank.amount).toFixed(2)} {pair.bank.type} - {highlightMatch(pair.bank.description, searchTerm)}
                      </div>
                      <div className="ynab-tx">
                        ${Math.abs(pair.ynab.amount).toFixed(2)} {pair.ynab.type} - {highlightMatch(pair.ynab.description, searchTerm)}
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
                        ${Math.abs(tx.amount).toFixed(2)} {tx.type} - {highlightMatch(tx.description, searchTerm)}
                      </div>
                    ))}
                  </div>

                  {/* Display unmatched YNAB transactions */}
                  <div className="unmatched-ynab">
                    <h5>YNAB Only: ({day.unmatchedYnabCount})</h5>
                    {day.unmatchedYnab.map((tx, i) => (
                      <div key={i} className="unmatched">
                        ${Math.abs(tx.amount).toFixed(2)} {tx.type} - {highlightMatch(tx.description, searchTerm)}
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

      {/* back to home essentially */}
      <button onClick={onStartOver} className="secondary-gradient-button">
        <span>↑</span> Upload Different Files
      </button>

      {/* back to top button */}
      <button 
        className={`back-to-top ${isVisible ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  );
}

export default ReconciliationHelper;