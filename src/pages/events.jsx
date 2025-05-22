import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassEventCard from "../components/ui/glassEventCard";
import GlassButton from "../components/ui/glassButton";

export default function Events() {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Get Auth0 token
        const token = await getAccessTokenSilently();
        
        // Fetch events from API
        const response = await fetch('http://localhost:3000/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data.events || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Handle joining an event
  const handleJoinEvent = async (eventId) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to join event');
      }
      
      // Refresh the events list
      const updatedEvents = await fetch('http://localhost:3000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await updatedEvents.json();
      setEvents(data.events || []);
      
      alert("You've joined the event!");
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Failed to join event. Please try again.");
    }
  };

  // Back icon
  const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );
  
  // Profile icon
  const profileIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
  
  // Message icon
  const messageIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 relative mb-4">
            <div className="absolute inset-0 rounded-full bg-white opacity-25 animate-ping"></div>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white text-xl font-semibold">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Background decoration */}
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      
      <GlassNavbar
        title="Events"
        leftIcon={backIcon}
        rightIcon={profileIcon}
        rightIcon2={messageIcon}
        onLeftIconClick={() => navigate("/home")}
        onRightIconClick={() => navigate("/profile")}
        onRightIcon2Click={() => navigate("/messages")}
      />
      
      <div className="app-container">
        <main className="main-content">
          {error && (
            <div className="glass-card bg-red-500 bg-opacity-25">
              <p className="text-white">{error}</p>
            </div>
          )}
          
          {events.length > 0 ? (
            events.map((event) => (
              <GlassEventCard
                key={event._id}
                title={event.name}
                description={event.description}
                date={event.date}
                time={event.time}
                location={event.location}
                participants={`${event.participants?.length || 0} participants`}
                onJoin={() => handleJoinEvent(event._id)}
              />
            ))
          ) : (
            <div className="glass-card text-center">
              <p>No events found. Create a new event!</p>
            </div>
          )}
          
          <GlassButton
            className="fixed bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            onClick={() => navigate("/createEvent")}
            style={{zIndex: 99}}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </GlassButton>
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}