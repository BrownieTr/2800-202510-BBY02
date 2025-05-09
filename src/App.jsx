import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './styles/App.css'
import Landing from './pages/landing';
import Location from './services/locationService';  

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/location" element={<Location/>} />
    </Routes>
  );
}

export default App
