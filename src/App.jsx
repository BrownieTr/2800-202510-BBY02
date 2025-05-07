import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './styles/App.css'
import Landing from './pages/landing';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
    </Routes>
  );
}

export default App
