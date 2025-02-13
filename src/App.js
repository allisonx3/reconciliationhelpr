import React, { useState } from 'react';
import ReconciliationHelper from './components/ReconciliationHelper';
import AboutModal from './components/AboutModal';
import ErrorBoundary from './components/ErrorBoundary';
import FileUpload from './components/FileUpload';
import UsageNotice from './components/UsageNotice';
import './styles/index.css';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

// Main application component for ReconciliationHelpr
// Handles file uploads and coordinates the reconciliation process

function App() {
// State variables for managing file uploads and reconciliation process
  const [bankData, setBankData] = useState(null);
  const [ynabData, setYnabData] = useState(null);
  const [bankFileName, setBankFileName] = useState('');
  const [ynabFileName, setYnabFileName] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [error, setError] = useState(null);

  // Resets the application state to allow for a fresh start
  const startOver = () => {
    setBankData(null);
    setYnabData(null);
    setBankFileName('');
    setYnabFileName('');
    setError(null);
  };

  // Main render method
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="app-wrapper">
          <ThemeToggle />
          {/* Header with App Title*/}
          <header className="app-header">
            <div className="header-content">
              <h1 className="app-title">ReconciliationHelpr</h1>
            </div>
          </header>

          <main className="container">
            <h1>Bank Reconciliation Helper</h1>
            
            {/* Error message display - shows only when there's an error */}
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError(null)} className="error-dismiss">×</button>
              </div>
            )}
            
            {/* Main content - shows either reconciliation view or file upload view */}
            {bankData && ynabData ? (
              // Show reconciliation view when files are uploaded
              <ErrorBoundary>
                {/* Start Over button - allows user to reset the application state */}
                <button onClick={startOver} className="secondary-gradient-button">
                  <span>↑</span> Upload Different Files
                </button>
                <ReconciliationHelper 
                  bankData={bankData} 
                  ynabData={ynabData}
                  onError={(error) => setError(error.message)}
                  onStartOver={startOver}
                />
              </ErrorBoundary>
            ) : (
              // Show file upload interface when files are needed
              <>             
               <div className="upload-container">
                  {/* Bank file upload section */}
                  <div className="upload-section">
                    <div className="upload-box">
                      <h2>1. Upload Bank Statement CSV</h2>
                      <FileUpload 
                        onFileLoaded={(content) => {
                          setBankData(content);
                          setBankFileName('Bank statement uploaded');
                        }}
                        label="bank"
                      />
                      {bankFileName && (
                        <p className="file-name">
                          <span>✓</span> {bankFileName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="upload-divider">then</div>

                   {/* YNAB export upload section */}
                   <div className="upload-section">
                    <div className="upload-box">
                      <h2>2. Upload YNAB Export CSV</h2>
                      <FileUpload 
                        onFileLoaded={(content) => {
                          setYnabData(content);
                          setYnabFileName('YNAB export uploaded');
                        }}
                        label="ynab"
                      />
                      {ynabFileName && (
                        <p className="file-name">
                          <span>✓</span> {ynabFileName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Upload status display - shows which files are needed */}
                {(bankData || ynabData) && (
                  <div className="upload-status">
                    <h3>Files Needed:</h3>
                    <ul>
                      <li className={bankData ? 'uploaded' : ''}>
                        Bank Statement {bankData && '✓'}
                      </li>
                      <li className={ynabData ? 'uploaded' : ''}>
                        YNAB Export {ynabData && '✓'}
                      </li>
                    </ul>
                  </div>
                )}
                
                <UsageNotice />
              </>
            )}
          </main>

          {/* Footer with About modal */}
          <footer className="app-footer">
            <div className="footer-content">
              <span>ReconciliationHelpr - an AX3 application</span>
              <span>|</span>
              <a className="footer-link" onClick={() => setIsAboutOpen(true)}>About</a>
            </div>
            <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
          </footer>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;