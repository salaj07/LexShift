/**
 * @file src/main.jsx
 * @description Final production entry point for LexShift.
 * 
 * Imports our 'Cinematic Architect' styles and handles global rendering.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Using StrictMode as a production best-practice for catching side-effects early.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
