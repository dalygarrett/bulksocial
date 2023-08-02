// DataProcessor.js
import React, { useState } from 'react';
import './DataProcessor.css'; // Import the CSS file for DataProcessor component


const DataProcessor = () => {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [apiCallResults, setApiCallResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);


  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const makeApiCall = async (data) => {
    const corsProxy = 'https://corsproxy.io/?'; // Replace with the actual CORS proxy URL
    const apiUrl = `${corsProxy}https://api.yextapis.com/v2/accounts/me/posts?api_key=${apiKey}&v=${data.v}`;
  
    // Filter out properties with empty or undefined values (empty cells)
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) =>
          value !== undefined &&
          value !== '' &&
          key !== 'apiKey' &&
          key !== 'v' &&
          key !== 'entityIds' &&
          key !== 'photoUrls'
      )
    );
  
    // Format entityIds and photoUrls as arrays with brackets
    filteredData.entityIds = data.entityIds ? [data.entityIds] : undefined;
    filteredData.photoUrls = data.photoUrls ? [data.photoUrls] : undefined;
  
    console.log('API Request:', apiUrl);
    console.log('API Request Body:', JSON.stringify(filteredData, null, 2));
  
    // Make the API call using fetch or your preferred HTTP library
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filteredData),
    });
  
    if (!response.ok) {
      throw await response.json(); // Throw the API error response
    }
  
    return response.json();
  };
            
  const handleSubmit = async () => {
    if (!apiKey) {
      console.error('API key is required.');
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();
  
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n').slice(1); // Skip the header row
  
      const results = [];
  
      for (const row of rows) {
        const rowData = row.split(',');
  
        // Trim whitespace from cell values
        const trimmedRowData = rowData.map((cell) => cell.trim());
  
        if (trimmedRowData.length === 16) {
          const data = {
            apiKey,
            v: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            entityIds: trimmedRowData[0] || undefined,
            publisher: trimmedRowData[1] || undefined,
            requiresApproval: trimmedRowData[2] || undefined,
            text: trimmedRowData[3] || undefined,
            clickthroughUrl: trimmedRowData[4] || undefined,
            photoUrls: trimmedRowData[5] || undefined, // Remove the brackets here
            postDate: trimmedRowData[6] || undefined,
            topicType: trimmedRowData[7] || undefined,
            alertType: trimmedRowData[8] || undefined,
          };
  
          if (trimmedRowData[9] || trimmedRowData[10] || trimmedRowData[11]) {
            data.offer = {
              couponCode: trimmedRowData[9] || undefined,
              redeemOnlineUrl: trimmedRowData[10] || undefined,
              termsConditions: trimmedRowData[11] || undefined,
            };
          }
  
          if (trimmedRowData[13] || trimmedRowData[14] || trimmedRowData[15]) {
            data.eventInfo = {
              title: trimmedRowData[13] || undefined,
              startTime: trimmedRowData[14] || undefined,
              endTime: trimmedRowData[15] || undefined,
            };
          }
  
          try {
            // Make the API call here and wait for it to complete before moving to the next row
            const response = await makeApiCall(data);
            results.push({ success: true, response });
          } catch (error) {
            results.push({ success: false, response: error });
          }
        }
      }
  
      setApiCallResults(results);
      setIsLoading(false);
      const successCalls = results.filter((result) => result.success);
      setSuccessCount(successCalls.length);
      setErrorCount(results.length - successCalls.length);
  
    };
  
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
  
    reader.readAsText(file);
  };
              


  return (
    <div className="container">
      <h2 className="title">Bulk Social Posting</h2>
      <p>
        Please fill out the bulk social post spreadsheet template available{' '}
        <a
          href="https://docs.google.com/spreadsheets/d/1MTcZ5hbNIje7YvAMBEr7wxnhmEVqL9H1BUlKjUlHRWc/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        .
      </p>

      <div className="input-box">
        <label htmlFor="apiKey">API Key:</label>
        <input type="text" id="apiKey" onChange={handleApiKeyChange} value={apiKey} />
      </div>
      <div className="input-box">
        <label htmlFor="file">Upload Spreadsheet:</label>
        <input type="file" id="file" accept=".csv" onChange={handleFileChange} />
      </div>
      <button className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>

      {file && <p>File Uploaded: {file.name}</p>}
      {isLoading && <p>Please wait a few seconds...</p>}


      <div className="api-call-results">
      <h3>API Call Results:</h3>
      
      <ul>
        {apiCallResults.map((result, index) => (
          <li key={index}>
            {result.success ? (
              <span className="success">
                {index + 1}. Success - API call successful
              </span>
          ) : (
            <span className="error">
            {index + 1}. Error -{' '}
            {result.response.message || 'Unknown error'}
          </span>
            )}
          </li>
        ))}
      </ul>
    </div>
          {/* Summary of successful and failed calls */}
          <p>
        Successful API Calls: {successCount} | Failed API Calls: {errorCount}
      </p>

    </div>
  );
};

export default DataProcessor;
