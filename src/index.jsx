import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChordProvider } from './context/ChordContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <ChordProvider>
      <App />
    </ChordProvider>
  </React.StrictMode>
);
