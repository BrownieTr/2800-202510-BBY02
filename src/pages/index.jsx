import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassButton from "../components/ui/glassButton";
import GlassBettingCard from "../components/ui/glassBettingCard";
import GlassEventCard from "../components/ui/glassEventCard";
import { getUserMatches } from "../services/matchMaking";

export default function Index() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [user, setUser] = useState([]);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
      fetchUserMatches();
    }
  }, [isAuthenticated]);

  // Fetch user's matches
  const fetchUserMatches = async () => {
    try {
      setIsLoadingMatches(true);
      const userMatches = await getUserMatches(getAccessTokenSilently);
      console.log("User matches:", userMatches);
      setMatches(userMatches || []);
    } catch (error) {
      console.error("Error fetching user matches:", error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data || {});
      console.log(data.setUp);
      if (data.setUp === false) {
        navigate("/setUpProfile");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(error.message);
    }
  };

  // Profile icon SVG
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
  
  // Message icon SVG
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

  return (
    <div>
      {/* Background decoration */}
      <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none"></div>

      
      <GlassNavbar
        title="PlayPal"
        rightIcon={profileIcon}
        rightIcon2={messageIcon}
        onRightIconClick={() => navigate("/profile")}
        onRightIcon2Click={() => navigate("/messages")}
      />
      
      <div className="app-container">
        <main className="main-content">
          <h1 className="text-2xl font-bold text-center text-white mb-6">
            Welcome {user.name || "Player"}
          </h1>
          
          {/* Upcoming Matches */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Matches</h2>
            
            {isLoadingMatches ? (
              <div className="text-center text-white p-4">
                <div className="w-8 h-8 mx-auto mb-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <p>Loading matches...</p>
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match, index) => {
                  // Determine if the current user is player1 or player2
                  const isPlayer1 = user && match.player1 && user.sub === match.player1;
                  
                  // Get the partner's name based on whether the current user is player1 or player2
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
                          // Save the match data to localStorage before navigating
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
          
          {/* Featured betting card */}
          <h2 className="text-xl font-bold text-white mb-4">Featured Game</h2>
          <GlassBettingCard
            setting="Today, 8:00 PM • Local Arena"
            team1="Lakers"
            team2="Warriors"
            odds1="1.85"
            odds2="2.50"
            odds3="1.95"
          />
          
          {/* Main features */}
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
          
          {/* Find Match button */}
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
