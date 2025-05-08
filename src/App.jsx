import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './styles/profile.css'
import Landing from './pages/landing';
import Profile from './pages/profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/profile" element={<Profile/>} />
    </Routes>
  );
}

export default App
