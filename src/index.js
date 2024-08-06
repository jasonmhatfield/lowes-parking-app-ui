import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/App.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
