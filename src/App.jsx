import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './styles/App.css'
import Landing from './pages/about-us';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
    </Routes>
  );
}

export default App
