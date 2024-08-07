import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/App.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router} from "react-router-dom";

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <Router>
          <App />
      </Router>,
  </React.StrictMode>
);

reportWebVitals();
