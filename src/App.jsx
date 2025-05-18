import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./styles/App.css";
import Landing from "./pages/landing";
import Profile from "./pages/profile";
import Location from "./services/locationService";
import Event from "./pages/events";
import Chat from "./pages/chat";
import ProtectedRoute from "./services/protectedRoutes";
import Messages from "./pages/messages";
import CreateEvent from "./pages/createEvent";
import FavSport from "./pages/favSport";
import FindingMatch from "./pages/findingMatch";
import SportsBetting from "./pages/sportsBetting";
import Index from "./pages/index";
import { DarkModeProvider } from "./components/ui/DarkModeContext";
import NewChat from "./pages/newChat";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DarkModeProvider>
      <Routes>
        {/* Public routes */}``
        <Route path="/" element={<Landing />} />
        {/* Protected routes - require authentication */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/location"
          element={
            <ProtectedRoute>
              <Location />
            </ProtectedRoute>
          }
        />
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
          path="/favSport"
          element={
            <ProtectedRoute>
              <FavSport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/findingMatch"
          element={
            <ProtectedRoute>
              <FindingMatch />
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
      </Routes>
    </DarkModeProvider>
  );
}

export default App;
