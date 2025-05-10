import { Routes, Route } from 'react-router-dom';
import './styles/profile.css'
import Landing from './pages/landing';
import Profile from './pages/profile';
import Location from './services/locationService';  
import Event from './pages/events';
import Chat from './pages/chat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing/>} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/location" element={<Location/>} />
      <Route path="/events" element={<Event/>} />
      <Route path="/chat" element={<Chat/>} />
    </Routes>
  );
}

export default App
