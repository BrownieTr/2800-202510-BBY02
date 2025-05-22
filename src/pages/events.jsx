import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/layout/navbar";
import EventCard from "../components/ui/eventCard";
import Footer from "../components/layout/stickyFooter";
import ClickableIcons from "../components/ui/clickableIcons";
import BackButton from "../components/ui/backButton";

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

  if (isLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      <Navbar
        iconLeft={<BackButton />}
        header="PlayPal"
        iconRight={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
          </svg>
        }
        iconRightTo={() => navigate('/profile')}
        iconRight2={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#000000"
          >
            <path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
          </svg>
        }
        iconRight2To={() => navigate('/messages')}
      />
      <div className="mt-5 mb-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] p-4">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard 
              key={event._id}
              title={event.name}
              description={event.description}
              date={event.date}
              time={event.time}
              location={event.location}
              participants={event.participants?.length || 0}
              onJoin={() => handleJoinEvent(event._id)}
            />
          ))
        ) : (
          <div className="text-center p-4">
            <p>No events found. Create a new event using the + button below!</p>
          </div>
        )}
      </div>
      <Footer
        iconLeft={
          <ClickableIcons
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
              </svg>
            }
          />
        }
        iconMiddle={
          <ClickableIcons
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
              </svg>
            }
            to={"/createEvent"}
          />
        }
        iconRight={
          <ClickableIcons
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
              </svg>
            }
          />
        }
      />
    </>
  );
}