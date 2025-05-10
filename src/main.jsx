import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css'
import App from './App.jsx'
import Chat from './pages/chat.jsx';
import ChatBubble from './components/ui/chatBubble.jsx';import Menu from './pages/about-us.jsx' //remove this when finish


ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Chat/>
    </BrowserRouter>
  </StrictMode>
);