import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './styles/App.css'
import Landing from './pages/landing';
import Chat from './pages/chat.jsx';
import ChatBubble from './components/ui/chatBubble.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/chat" element={<Chat/>} />
    </Routes>
  );
}

export default App
