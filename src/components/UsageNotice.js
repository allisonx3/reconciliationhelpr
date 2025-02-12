import React, { useState } from 'react';

// UsageNotice component for displaying important usage notes
// Can be collapsed to hide the notes by the end user

function UsageNotice() {
  // State variable for managing collapsed/expanded state
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="usage-notice">
      {/* Header with collapsible toggle */}
      <div className="notice-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>📝 Important Usage Notes</h3>
        <button className="collapse-button">
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>
      
      {/* Display the notes when not collapsed */}
      {!isCollapsed && (
        <div className="notice-content">
          <div className="notice-item">
            <h4>🔍 About Split Transactions</h4>
            <p>
              When you export from YNAB, split transactions appear as separate entries. 
              This means they'll show as "unmatched" compared to your bank statement, 
              which shows the total amount. Look for transactions on the same date to 
              identify these splits.
            </p>
          </div>

          <div className="notice-item">
            <h4>📅 Date Mismatches Are Common</h4>
            <p>
              If you manually enter transactions or schedule them in advance, dates in YNAB 
              might not match your bank statement. Recommended workflow:
            </p>
            <ol>
              <li>Use this tool first to identify date mismatches</li>
              <li>Update the dates in YNAB to match your bank statement</li>
              <li>Re-upload both files to check for actual missing transactions</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsageNotice;