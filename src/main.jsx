import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import collisions from './data/sample.csv';
import './index.css';
import { useState } from 'react';


function Main() {
  const [loading, setLoading] = useState(true);
  
  
  const handleLoadingComplete = () => {
    setLoading(false);
  };
  return(
    <React.StrictMode>
      {loading && <div className="loader-overlay">
                    <h1>Loading data...</h1>
                    <div className="loader"></div>
                  </div>}
      <App onLoadingComplete={handleLoadingComplete}/>
     
    </React.StrictMode>
  )
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
