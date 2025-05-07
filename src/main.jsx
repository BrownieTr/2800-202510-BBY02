import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css'
import App from './App.jsx'
import Menu from './pages/landing.jsx' //remove this when finish


ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Menu />  {/*Remove this when finish */}
    </BrowserRouter>
  </StrictMode>
);