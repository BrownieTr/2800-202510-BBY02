import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css'
import App from './App.jsx'
import FavSport from './pages/favSport.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FavSport />
    </BrowserRouter>
  </StrictMode>
);