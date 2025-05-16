
import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './styles/App.css';
import Landing from './pages/landing';
import Profile from './pages/profile';
// import Location from './services/locationService';  
import Event from './pages/events';
import Chat from './pages/chat';
import ProtectedRoute from './services/protectedRoutes';
import Messages from "./pages/messages";
import Index from "./pages/index";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Protected routes - require authentication */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/location" element={
        <ProtectedRoute>
          <Location />
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute>
          <Event />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      <Route path="/home" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;