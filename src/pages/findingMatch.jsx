import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassButton from "../components/ui/glassButton";
import { startLookingForMatch, cancelMatchmaking } from "../services/matchMaking";
import { getLoadingQuote } from "../services/ai"

export default function FindingMatch() {
  const location = useLocation();
  // Get preferences from location state or use defaults
  const {
    sport = "Sport",
    distance = 5,
    skillLevel = "Beginner",
    mode = "Casual",
    matchType = "1v1"
  } = location.state || {};

  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [searching, setSearching] = useState(true);
  const [matchSearchControl, setMatchSearchControl] = useState(null);
  const [searchTime, setSearchTime] = useState(0);
  const [quote, setQuote] = useState("Focus on consistency over perfection—small, steady improvements lead to long-term success in any sport.")

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  // Start looking for a match when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      const controller = startLookingForMatch(
        getAccessTokenSilently,
        (matchData) => {
          // When a match is found
          console.log("Match found!", matchData);
          // Save match data to use in the next screen
          localStorage.setItem("matchData", JSON.stringify(matchData));
          // Navigate to the match screen
          // Force a slight delay to ensure state is saved before navigation
          setTimeout(() => {
            navigate("/match");
          }, 300);
        }
      );

      setMatchSearchControl(controller);

      // Start a timer to show how long the search has been going
      const timer = setInterval(() => {
        setSearchTime((prevTime) => prevTime + 1);
      }, 1000);

      const quoter = setInterval(async () => {
        try {
          setQuote(await getLoadingQuote(sport, 'tip'))
        } catch {
          // Handle error silently
        }
      }, 10000)


      // Clean up when component unmounts
      return () => {
        if (controller) {
          controller.cancelSearch();
        }
        clearInterval(timer);
        clearInterval(quoter);
      };
    }
  }, [isAuthenticated, getAccessTokenSilently, navigate, sport, distance, skillLevel, mode, matchType]);

  // Format the search time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle canceling the search
  const handleCancel = async () => {
    setSearching(false);
    
    if (matchSearchControl) {
      matchSearchControl.cancelSearch();
    }
    
    try {
      await cancelMatchmaking(getAccessTokenSilently);
      navigate("/home");
    } catch (error) {
      console.error("Error canceling matchmaking:", error);
      navigate("/home");
    }
  };


  // Back icon
  const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  return (
    <div>
      {/* Background decoration */}
      <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
      bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px]
      bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
      </div>
      
      <GlassNavbar
        title="Find Match"
        leftIcon={backIcon}
        onLeftIconClick={handleCancel}
      />
      
      <div className="app-container">
        <main className="main-content">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">Finding a Match</h1>
            <div className="text-5xl text-white font-bold">{formatTime(searchTime)}</div>
            <div className="flex justify-center mt-4">
              <div className="w-12 h-12 relative">
                <div className="absolute inset-0 rounded-full bg-white opacity-25 animate-ping"></div>
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Match preferences */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Match Preferences</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-4">
              <div>
                <p className="font-semibold text-white opacity-80">Sport</p>
                <p className="text-white">{sport}</p>
              </div>
              <div>
                <p className="font-semibold text-white opacity-80">Distance</p>
                <p className="text-white">{distance} km</p>
              </div>
              <div>
                <p className="font-semibold text-white opacity-80">Skill Level</p>
                <p className="text-white">{skillLevel}</p>
              </div>
              <div>
                <p className="font-semibold text-white opacity-80">Mode</p>
                <p className="text-white">{mode}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold text-white opacity-80">Match Type</p>
                <p className="text-white">{matchType}</p>
              </div>
            </div>
          </div>
          
          {/* Quote */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-2">Tip</h2>
            <p className="italic">{quote}</p>
          </div>
          
          {/* Action buttons */}
          {/* Cancel button */}
          <GlassButton
            className="w-full bg-red-500 bg-opacity-30 mt-6 py-4"
            onClick={handleCancel}
          >
            Cancel Search
          </GlassButton>
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}