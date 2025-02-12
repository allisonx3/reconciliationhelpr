import React, { useState } from 'react';

// Component for handling CSV file uploads with drag-and-drop support
// Accepts a callback function to handle the file data

function FileUpload({ onFileLoaded, label}) {
  // Track if user is currently dragging a file over the upload area
  const [isDragging, setIsDragging] = useState(false);

  // Process & validate the uploaded file
  // Errors are thrown/yeeted to ErrorBoundary.js
  const handleFile = async (file) => {
    try {
      // See if the file exists at all
      if (!file) {
        throw new Error('no file');
      }

      // Check if the file is a CSV file
      const isCSV = file.type === 'text/csv';

      // Check if the file is a CSV file
      if (!isCSV) {
        throw new Error('not csv');
      }

      // Read the file content
      const text = await file.text();
      // Check if the file is empty
      if (!text) {
        throw new Error('empty file');
      }

      // Validate CSV format by checking if the first line contains a comma
      // This is a simple (but not foolproof) check to ensure the file is a valid CSV 
      // A more robust check would involve parsing the CSV and checking for valid headers - but this is a locally run application so we're keeping it simple
      const firstLine = text.split('\n')[0];
      if (!firstLine.includes(',')) {
        throw new Error('invalid csv');
      }

      // Pass content to the parent component
      onFileLoaded(text);
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('error reading');
    }
  };

  // Handle dropping a file onto the upload area
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle drag leave events
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`upload-area ${isDragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      aria-label="File upload area"
    >
      <p>{label}</p>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => handleFile(e.target.files[0])}
        id="file-upload"
        aria-label="Choose CSV file"
      />
    </div>
  );
}


export default FileUpload;