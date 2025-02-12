import React from 'react';

// ErrorBoundary component for catching errors in the application
// Displays an error message and allows the user to try again instead of just crashing entirely

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // Initialize the state with a flag indicating if an error has occurred & the error details
    this.state = { 
        hasError: false, 
        error: null, 
        errorType: null
     }; 
  }

  // This lifecycle method is called when an error occurs in a child component
  static getDerivedStateFromError(error) {
    // figure out what type of error occurred (these are defined in FileUpload.js)
    let errorType = 'unknown';

    if (error.message.includes('no file')) {
        errorType = 'noFile';
    } else if (error.message?.includes('not csv')) {
        errorType = 'notCsv';
    } else if (error.message?.includes('empty file')) {
        errorType = 'emptyFile';
    } else if (error.message?.includes('invalid csv')) {
        errorType = 'invalidCsv';
    } else if (error.message?.includes('error reading')) {
        errorType = 'readError';
    } else if (error.message?.includes('invalid data format')) {
        errorType = 'wrongFormat'; 
    }

    return { 
        hasError: true, 
        error, 
        errorType
    };
  }

  // when an error occurs in a child component, this method is called & logs to the console
   componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    // Only show error UI if there's an error & it's an app-related error
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Oops! Something went wrong. Please try again.</h2>
          
          {/* Show specific error messages based on what happened */}
          {this.state.errorType === 'noFile' && (
            <div>
              <p>No file was selected.</p>
              <p>Please choose a CSV file to upload.</p>
            </div>
          )}

          {this.state.errorType === 'notCsv' && (
            <div>
              <p>The file you selected isn't a CSV file.</p>
              <p>Please make sure you're uploading a CSV file.</p>
              <ul>
                <li>For bank statements: Export your transactions as CSV</li>
                <li>For YNAB: Use the "Export" function to get a CSV file</li>
              </ul>
            </div>
          )}

          {this.state.errorType === 'emptyFile' && (
            <div>
              <p>The file you uploaded is empty.</p>
              <p>Please check that your file was exported correctly.</p>
              <p>If the problem persists, please try a different file.</p>
            </div>
          )}

          {this.state.errorType === 'invalidCsv' && (
            <div>
              <p>The CSV file appears to be invalid.</p>
              <p>Please make sure:</p>
              <ul>
                <li>Your file is a valid CSV file</li>
                <li>You're using the correct export option from your bank/YNAB</li>
              </ul>
            </div>
          )}

          {this.state.errorType === 'readError' && (
            <div>
              <p>There was a problem reading your file.</p>
              <p>Try these steps:</p>
              <ul>
                <li>Close and reopen the file in your spreadsheet program</li>
                <li>Export it again as a CSV</li>
                <li>Make sure the file isn't open in another program</li>
              </ul>
            </div>
          )}

          {/* For any other errors I didn't specifically handle here */}
          {this.state.errorType === 'unknown' && (
            <div>
              <p>An unexpected error occurred while processing your file.</p>
              <p>Please try:</p>
              <ul>
                <li>Re-exporting your data as a fresh CSV file</li>
                <li>Making sure your file has all required columns</li>
                <li>Checking that your file is a valid CSV file</li>
              </ul>
            </div>
          )}
          {this.state.errorType === 'wrongFormat' && (
            <div>
                <p>The CSV files don't contain the expected data format.</p>
                <p>Please make sure you're uploading:</p>
                <ul>
                <li>A bank statement CSV with transaction data</li>
                <li>A YNAB account register CSV export</li>
                <li>Files that contain transaction dates, amounts, and descriptions</li>
                </ul>
                <p>Common mistakes:</p>
                <ul>
                <li>Uploading the wrong type of CSV file</li>
                <li>Using a CSV that's not a transaction export</li>
                <li>Files missing required transaction columns</li>
                </ul>
            </div>
            )}

          {/* Button to try again */}
          <button
            onClick={() => {
              // Reset error state
              this.setState({ hasError: false, error: null });
              // Reload the page fresh
              window.location.reload();
            }}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    // If there's no error (or it's not an app error), render the app normally
    return this.props.children;
  }
}
export default ErrorBoundary;