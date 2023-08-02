// App.js
import React from 'react';
import './App.css'; // Import the CSS file for App component
import DataProcessor from './DataProcessor';

const App = () => {
  return (
    <div className="app-container">
      {/* <h1 className="app-title">Bulk Social Posting</h1> */}
      <DataProcessor />
    </div>
  );
};

export default App;
