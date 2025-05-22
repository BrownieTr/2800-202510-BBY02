import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassButton from "../components/ui/glassButton";
import GlassBettingCard from "../components/ui/glassBettingCard";

export default function Index() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [user, setUser] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

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
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      
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
          
          {/* Featured match card */}
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
