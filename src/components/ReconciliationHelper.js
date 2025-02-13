import React, { useState, useEffect } from 'react';
import { processTransactions, processDailyTransactions } from '../utils/csvProcessor';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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

  useEffect(() => {
    // Function to handle scroll
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Function to scroll to top
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // get available dates from datepicker
  const availableDates = [...new Set(transactions.map(t => new Date(t.date)))];


  // Filter transactions based on selected date and filter type
  const filteredTransactions = transactions
    .filter(t => !selectedDate || t.date === selectedDate.toLocaleDateString('en-US'))
    .filter(day => {
      switch (filterType) {
        case 'unmatched':
          return day.unmatchedBankCount > 0 || day.unmatchedYnabCount > 0;
        case 'matched':
          return day.unmatchedBankCount === 0 && day.unmatchedYnabCount === 0;
        default:
          return true;
      }
    });

  // Custom date input for nicer formatting
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <button 
      className="date-picker-button"
      onClick={(e) => {
        e.preventDefault();
        setIsDatePickerOpen(!isDatePickerOpen);
      }}
      ref={ref}
    >
      {value || 'All Dates'}
    </button>
  ));
  //show loading state while processing transactions
  if (loading) {
    return <div>Loading transactions...</div>;
  }

  // handle the click on scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Render the reconciliation helper component
  return (
    <div className="reconciliation-helper">
      {/* Dropdown for selecting a specific date */}
      <div className="controls">
      {/* Date filter with DatePicker */}
        <DatePicker
            selected={selectedDate}
            onChange={(date) => {
                setSelectedDate(date);
                setIsDatePickerOpen(false);  // Close after selection
            }}
            customInput={<CustomDateInput />}
            includeDates={availableDates}
            isClearable={true}
            placeholderText="All Dates"
            dateFormat="MM/dd/yyyy"
            open={isDatePickerOpen}
            onClickOutside={() => setIsDatePickerOpen(false)}  // Close when clicking outside
            />
        {/* filter for matched/unmatched */}
        <div className="select-wrapper">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Matched/Unmatched</option>
            <option value="unmatched">Only Days with Mismatches</option>
            <option value="matched">Only Fully Matched Days</option>
          </select>
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