import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/layout/navbar";
import { startLookingForMatch, cancelMatchmaking } from "../services/matchMaking";
import { getLoadingQuote } from "../services/ai"

export default function FindingMatch() {
  const location = useLocation();
  // Get preferences from location state or use defaults
  console.log(location.state);
  // if (location.state) {

  // }
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
          navigate("/match");
        }
      );

      setMatchSearchControl(controller);

      // Start a timer to show how long the search has been going
      const timer = setInterval(() => {
        setSearchTime((prevTime) => prevTime + 1);
      }, 1000);

      const quoter = setInterval(async () => {
        try {
          setQuote(await getLoadingQuote(sport, 'tip', import.meta.env.VITE_AI_URI))
        } catch {

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
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

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

  return (
    <>
      <Navbar header="PlayPal" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-bold text-4xl mt-10 text-center">Finding a Match...</h1>
        
        {/* Search time display */}
        <div className="mt-4 text-center text-2xl">
          {formatTime(searchTime)}
        </div>
        
        {/* Match preferences */}
        <div className="mt-10 bg-gray-100 p-6 rounded-lg shadow-md mx-auto max-w-md">
          <h2 className="font-bold text-xl mb-4">Match Preferences</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Sport:</p>
              <p>{sport}</p>
            </div>
            <div>
              <p className="font-semibold">Distance:</p>
              <p>{distance} km</p>
            </div>
            <div>
              <p className="font-semibold">Skill Level:</p>
              <p>{skillLevel}</p>
            </div>
            <div>
              <p className="font-semibold">Mode:</p>
              <p>{mode}</p>
            </div>
            <div>
              <p className="font-semibold">Match Type:</p>
              <p>{matchType}</p>
            </div>
          </div>
          <div>
            <p className='font-semibold'>Loading Quote:</p>
            <p>{quote}</p>
          </div>
        </div>
        
        {/* Cancel button */}
        <div className="flex justify-center mt-10">
          <button 
            onClick={handleCancel}
            className="rounded-xl w-36 h-20 bg-red-500 text-white font-bold text-lg hover:bg-red-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}