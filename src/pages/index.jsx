import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassButton from "../components/ui/glassButton";
import GlassEventCard from "../components/ui/glassEventCard";
import { getUserMatches } from "../services/matchMaking";
import ChatIcon from "../components/ui/chatIcon";

export default function Index() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
      fetchUserMatches();
      fetchLatestEvent();
    }
  }, [isAuthenticated]);

  const fetchUser = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:10000/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data || {});
      
      if (data.setUp === false) {
        navigate("/setUpProfile");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError(error.message);
    }
  };

  const fetchUserMatches = async () => {
    try {
      setIsLoadingMatches(true);
      const userMatches = await getUserMatches(getAccessTokenSilently);
      setMatches(userMatches || []);
    } catch (error) {
      console.error("Error fetching user matches:", error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const fetchLatestEvent = async () => {
    try {
      setIsLoadingEvent(true);
      const token = await getAccessTokenSilently();
      
      const response = await fetch('/api/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      const allEvents = data.events || [];
      
      if (allEvents.length > 0) {
        // Sort events by creation date (newest first)
        const sortedEvents = allEvents.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date);
          const dateB = new Date(b.createdAt || b.date);
          return dateB - dateA;
        });
        
        const latest = sortedEvents[0];
        const currentUserId = userData?.auth0Id || user?.sub;
        
        // Add participation status
        const eventWithStatus = {
          ...latest,
          isUserParticipating: latest.participants && latest.participants.includes(currentUserId)
        };
        
        setLatestEvent(eventWithStatus);
      }
    } catch (error) {
      console.error("Error fetching latest event:", error);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to join event');
      }
      
      // Update the event's participation status
      setLatestEvent(prev => ({
        ...prev,
        isUserParticipating: true,
        participants: [...(prev.participants || []), userData?.auth0Id || user?.sub]
      }));
      
      alert("You've joined the event!");
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Failed to join event. Please try again.");
    }
  };

  const handleViewEventDetails = (eventId) => {
    if (latestEvent) {
      alert(`Event Details:\n\n${latestEvent.name}\n${latestEvent.description}\n\nDate: ${latestEvent.date}\nTime: ${latestEvent.time || 'TBD'}\nLocation: ${latestEvent.location}\nParticipants: ${latestEvent.participants?.length || 0}`);
    }
  };

  return (
    <div>
      {/* Background decoration */}
      <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none"></div>

      <GlassNavbar
        title="PlayPal"
        rightIcon2={<ChatIcon/>}
        onRightIcon2Click={() => navigate("/messages")}
      />
      
      <div className="app-container">
        <main className="main-content">
          <h1 className="text-2xl font-bold text-center text-white mb-6">
            Welcome {userData?.name || "Player"}
          </h1>
          
          {/* Your Matches Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Matches</h2>
            
            {isLoadingMatches ? (
              <div className="text-center text-white p-4">
                <div className="w-8 h-8 mx-auto mb-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <p>Loading matches...</p>
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-4">
                {matches.slice(0, 2).map((match, index) => {
                  const isPlayer1 = userData && match.player1 && userData.sub === match.player1;
                  const partnerName = isPlayer1 ? match.player2Name : match.player1Name;
                  
                  return (
                    <div key={match._id || match.matchID || index} className="glass-card p-4">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {`Match with ${partnerName || 'Player'}`}
                      </h3>
                      <p className="text-white opacity-80 text-sm mb-2">
                        {`${match.sport} - ${match.matchType} - ${match.mode}`}
                      </p>
                      <div className="flex justify-between items-center text-sm text-white opacity-70 mb-3">
                        <span>{match.timestamp || 'Upcoming'}</span>
                        <span className="capitalize">{match.status || 'pending'}</span>
                      </div>
                      <GlassButton
                        className="w-full py-2 text-sm"
                        onClick={() => {
                          localStorage.setItem("matchData", JSON.stringify(match));
                          navigate(`/match`);
                        }}
                      >
                        View Match Details
                      </GlassButton>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card text-center p-4 mb-6">
                <p className="text-white mb-2">No matches found</p>
                <p className="text-white opacity-70 text-sm mb-4">
                  Find opponents and play together!
                </p>
                <GlassButton
                  className="w-full py-3"
                  onClick={() => navigate("/match-preferences")}
                >
                  Find Match
                </GlassButton>
              </div>
            )}
          </div>
          
          {/* Latest Event Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Latest Event</h2>
            
            {isLoadingEvent ? (
              <div className="text-center text-white p-4">
                <div className="w-8 h-8 mx-auto mb-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <p>Loading latest event...</p>
              </div>
            ) : latestEvent ? (
              <div className="space-y-4">
                <GlassEventCard
                  eventId={latestEvent._id}
                  title={latestEvent.name}
                  description={latestEvent.description}
                  date={latestEvent.date}
                  time={latestEvent.time}
                  location={latestEvent.location}
                  participants={`${latestEvent.participants?.length || 0} participants`}
                  isUserParticipating={latestEvent.isUserParticipating}
                  onJoin={handleJoinEvent}
                  onViewDetails={handleViewEventDetails}
                />
              </div>
            ) : (
              <div className="glass-card text-center p-4">
                <p className="text-white mb-2">No events available</p>
                <p className="text-white opacity-70 text-sm mb-4">
                  Be the first to create an event in your community!
                </p>
                <GlassButton
                  className="w-full py-3"
                  onClick={() => navigate("/createEvent")}
                >
                  Create Event
                </GlassButton>
              </div>
            )}
          </div>
          
          {/* Main Features */}
          <div className="feature-grid">
            <GlassButton
              isFeature={true}
              onClick={() => navigate("/events")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Events
            </GlassButton>
            
            <GlassButton
              isFeature={true}
              onClick={() => navigate("/sportsBetting")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                <line x1="3" y1="22" x2="21" y2="22"></line>
              </svg>
              Sports Betting
            </GlassButton>
          </div>
          
          {/* Find Match Button */}
          <GlassButton
            className="w-full text-lg py-4 mt-4"
            onClick={() => navigate("/match-preferences")}
          >
            Find Match
          </GlassButton>
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}