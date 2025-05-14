import { Routes, Route } from "react-router-dom";
import "./styles/App.css";
import Landing from "./pages/landing";
import Profile from "./pages/profile";
import Location from "./services/locationService";
import Event from "./pages/events";
import Chat from "./pages/chat";
import Messages from "./pages/messages";
import Index from "./pages/index";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing/>} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/location" element={<Location/>} />
      <Route path="/events" element={<Event/>} />
      <Route path="/chat" element={<Chat/>} />
      <Route path="/messages" element={<Messages/>} />
      <Route path="/home" element={<Index/>}/>
    </Routes>
  );
}

export default App;
