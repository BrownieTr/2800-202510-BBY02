import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./styles/App.css";
import Landing from "./pages/landing";
import Profile from "./pages/profile";
import Event from "./pages/events";
import Chat from "./pages/chat";
import ProtectedRoute from "./services/protectedRoutes";
import Messages from "./pages/messages";
import CreateEvent from "./pages/createEvent";
import FindingMatch from "./pages/findingMatch";
import MatchDetails from "./pages/MatchDetails";
import MatchPreferences from "./pages/MatchPreferences";
import SportsBetting from "./pages/sportsBetting";
import Index from "./pages/index";
import NewChat from "./pages/newChat";
import SetUpProfile from "./pages/setUpProfile";
import { Navigate } from "react-router-dom";

function App() {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
      <Routes>
        {/* Public routes */}
        <Route path="/" 
          element={
            isAuthenticated ? <Navigate to="/home" /> : <Landing />
          }
        />
        
        {/* Protected routes - require authentication */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* REMOVED: Broken location route that referenced non-existent component */}
        
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Event />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationID"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createEvent"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match-preferences"
          element={
            <ProtectedRoute>
              <MatchPreferences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finding-match"
          element={
            <ProtectedRoute>
              <FindingMatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match"
          element={
            <ProtectedRoute>
              <MatchDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sportsBetting"
          element={
            <ProtectedRoute>
              <SportsBetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-chat"
          element={
            <ProtectedRoute>
              <NewChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setUpProfile"
          element={
            <ProtectedRoute>
              <SetUpProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;