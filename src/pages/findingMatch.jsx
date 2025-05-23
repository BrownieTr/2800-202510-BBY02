import { useState, useEffect } from "react";
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
  const [quote, setQuote] = useState("Focus on consistency over perfection—small, steady improvements lead to long-term success in any sport.");
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  // Start looking for a match when component mounts
  useEffect(() => {
    if (isAuthenticated && !isNavigating) {
      console.log("Starting match search with preferences:", { sport, distance, skillLevel, mode, matchType });
      
      const controller = startLookingForMatch(
        getAccessTokenSilently,
        (matchData) => {
          // When a match is found
          console.log("🎉 Match found in FindingMatch component!", matchData);
          
          if (isNavigating) {
            console.log("Already navigating, ignoring duplicate match callback");
            return;
          }
          
          setIsNavigating(true);
          setSearching(false);
          
          // Validate match data before saving
          if (!matchData || (!matchData.matchId && !matchData.matchID && !matchData._id)) {
            console.error("Invalid match data received:", matchData);
            setError("Invalid match data received. Please try again.");
            setIsNavigating(false);
            return;
          }
          
          // Save match data to use in the next screen
          try {
            localStorage.setItem("matchData", JSON.stringify(matchData));
            console.log("Match data saved to localStorage");
          } catch (storageError) {
            console.error("Error saving match data to localStorage:", storageError);
            setError("Error saving match data. Please try again.");
            setIsNavigating(false);
            return;
          }
          
          // Navigate to the match details screen
          console.log("Navigating to match details...");
          setTimeout(() => {
            navigate("/match");
          }, 500);
        }
      );

      setMatchSearchControl(controller);

      // Start a timer to show how long the search has been going
      const timer = setInterval(() => {
        if (searching && !isNavigating) {
          setSearchTime((prevTime) => prevTime + 1);
        }
      }, 1000);

      // Update quotes periodically
      const quoter = setInterval(async () => {
        if (searching && !isNavigating) {
          try {
            const newQuote = await getLoadingQuote(sport, 'tip', import.meta.env.VITE_AI_URI);
            setQuote(newQuote);
          } catch(error) {
            console.log("Error getting quote:", error);
            // Keep the current quote on error
          }
        }
      }, 10000);

      // Clean up when component unmounts
      return () => {
        console.log("Cleaning up match search...");
        if (controller) {
          controller.cancelSearch();
        }
        clearInterval(timer);
        clearInterval(quoter);
      };
    }
  }, [isAuthenticated, getAccessTokenSilently, navigate, sport, distance, skillLevel, mode, matchType, isNavigating]);

  // Format the search time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle canceling the search
  const handleCancel = async () => {
    if (isNavigating) {
      console.log("Already navigating, ignoring cancel request");
      return;
    }
    
    console.log("User cancelled match search");
    setSearching(false);
    setIsNavigating(true);
    
    if (matchSearchControl) {
      matchSearchControl.cancelSearch();
    }
    
    try {
      const cancelled = await cancelMatchmaking(getAccessTokenSilently);
      if (cancelled) {
        console.log("Successfully left matchmaking queue");
      } else {
        console.warn("Failed to leave queue, but continuing with navigation");
      }
    } catch (error) {
      console.error("Error canceling matchmaking:", error);
      // Continue with navigation even if cancel fails
    }
    
    navigate("/home");
  };

  // Back icon
  const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );

  // Show error state
  if (error) {
    return (
      <div>
        <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
        bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
        </div>
        <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px]
        bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
        </div>
        
        <GlassNavbar
          title="Error"
          leftIcon={backIcon}
          onLeftIconClick={() => navigate("/home")}
        />
        
        <div className="app-container">
          <main className="main-content">
            <div className="glass-card bg-red-500 bg-opacity-25 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Error</h2>
              <p className="text-white mb-4">{error}</p>
              <div className="space-y-2">
                <GlassButton
                  onClick={() => {
                    setError(null);
                    setIsNavigating(false);
                    setSearching(true);
                    setSearchTime(0);
                  }}
                  className="w-full bg-blue-500 bg-opacity-30 py-3"
                >
                  Try Again
                </GlassButton>
                <GlassButton
                  onClick={() => navigate("/match-preferences")}
                  className="w-full bg-gray-500 bg-opacity-30 py-3"
                >
                  Change Preferences
                </GlassButton>
              </div>
            </div>
          </main>
        </div>
        
        <GlassTabBar />
      </div>
    );
  }

  // Show navigating state
  if (isNavigating) {
    return (
      <div>
        <div className="fixed top-[-100px] left-[-100px] w-[300px] h-[300px] 
        bg-pink-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
        </div>
        <div className="fixed bottom-[-100px] right-[-100px] w-[300px] h-[300px]
        bg-blue-400 rounded-full blur-3xl opacity-40 -z-10 pointer-events-none">
        </div>
        
        <GlassNavbar title="Match Found!" />
        
        <div className="app-container">
          <main className="main-content">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Match Found! 🎉</h1>
              <div className="flex justify-center mt-4">
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 rounded-full bg-green-500 opacity-25 animate-ping"></div>
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-green-500 bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-white mt-4">Preparing your match details...</p>
            </div>
          </main>
        </div>
        
        <GlassTabBar />
      </div>
    );
  }

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
            <p className="text-white text-sm mt-2 opacity-80">
              {searchTime < 30 ? "Searching for players nearby..." : 
               searchTime < 60 ? "Expanding search area..." : 
               "Finding the perfect match for you..."}
            </p>
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
            <p className="italic text-white opacity-90">{quote}</p>
          </div>
          
          {/* Cancel button */}
          <GlassButton
            className="w-full bg-red-500 bg-opacity-30 mt-6 py-4"
            onClick={handleCancel}
            disabled={isNavigating}
          >
            {isNavigating ? "Cancelling..." : "Cancel Search"}
          </GlassButton>
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}