import React from 'react';

// AboutModal component for displaying information about the application

function AboutModal({ isOpen, onClose }) {
  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  // If the modal is open, return the modal content
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>About ReconciliationHelpr</h2>
        
        {/* About section - The Origin Story */}
        <div className="about-section">
          <h3>Why Use This?</h3>
          <p>
            Don't have the attention span to remember to reconcile every day/week?<br />
            Tired of squinting at spreadsheets or bank UIs trying to find that one missing transaction?
          </p>

          <p>Same!</p>
         
          <p>
            Born from the classic developer mindset of "I'd rather spend 5 hours 
            automating a 1-hour task than do it manually" - ReconciliationHelpr 
            exists because I was frustrated trying to figure out why my YNAB balance 
            didn't match my bank account.
          </p>

          <p>
            So I built this tool to help me reconcile my bank statements with YNAB for when I forget to reconcile often enough.
          </p>
            
        </div>

        {/* What It Does section */}
        <div className="about-section">
          <h3>What It Does</h3>
          <p>
            This app helps you identify discrepancies between your bank statement and YNAB 
            by comparing transactions side by side. It's not magic - it won't automatically 
            fix your reconciliation issues, but it will make it much easier to spot where 
            things don't match up.
          </p>
        </div>

        {/* Important Notes for Use section */}
        <div className="about-section">
          <h3>Important Notes for Use</h3>
          <div className="usage-notes">
            <h4>Split Transactions</h4>
            <p>
              YNAB's export shows split transactions as separate entries, so these will 
              always appear as "unmatched" compared to your bank statement. Look for 
              transactions on the same date to identify splits.
            </p>

            <h4>Date Mismatches</h4>
            <p>
              If you manually enter transactions or schedule them in advance, YNAB's dates 
              might not match your bank statement. Pro tip: First use this tool to identify 
              date mismatches, update them in YNAB, then re-run the comparison for a more 
              accurate reconciliation.
            </p>
          </div>
        </div>

        {/* How to Use It section */}
        <div className="about-section">
          <h3>How to Use It</h3>
          <ol>
            <li>Export your bank statement as CSV</li>
            <li>Export your YNAB account register as CSV</li>
            <li>Upload both files</li>
            <li>First check for date mismatches and fix those in YNAB</li>
            <li>Re-upload files to check for actual missing transactions</li>
            <li>Remember that split transactions will show as unmatched</li>
            <li>Update YNAB as needed</li>
          </ol>
        </div>

        {/* Creator Note section */}
        <div className="about-section creator-note">
          <p>
          🎀Another janky application by AX3🎀
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;