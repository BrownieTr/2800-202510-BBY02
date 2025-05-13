import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css'
import App from './App.jsx'
import Index from './pages/index.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Index/>
    </BrowserRouter>
  </StrictMode>
);