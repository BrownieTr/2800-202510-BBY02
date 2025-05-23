import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import GlassNavbar from "../components/layout/glassNavbar";
import GlassTabBar from "../components/layout/glassTabBar";
import GlassButton from "../components/ui/glassButton";
import { saveMatchPreferences } from "../services/matchMaking";
import { currentLocation } from "../services/locationService.jsx"

export default function MatchPreferences() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [preferences, setPreferences] = useState({
    sport: "Basketball",
    distance: 5,
    skillLevel: "Beginner",
    mode: "Casual",
    matchType: "1v1"
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        await loginWithRedirect();
        return;
      }
      
      // Get current location
      let latitude, longitude;
      try {
        [latitude, longitude] = await currentLocation();
        console.log("Location obtained:", latitude, longitude);
      } catch (locationError) {
        console.error("Location error:", locationError);
        setError("Unable to get your location. Please check your browser permissions.");
        setIsLoading(false);
        return;
      }
      
      // Save preferences
      const success = await saveMatchPreferences(
        preferences.sport,
        parseInt(preferences.distance),
        latitude,
        longitude,
        preferences.skillLevel,
        preferences.mode,
        preferences.matchType,
        getAccessTokenSilently
      );
      
      if (success) {
        // Navigate to FindingMatch with preferences
        navigate("/finding-match", { state: preferences });
      } else {
        setError("Failed to save preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
        onLeftIconClick={() => navigate("/home")}
      />
      
      <div className="app-container">
        <main className="main-content">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">Match Preferences</h1>
          
          {error && (
            <div className="glass-card bg-red-500 bg-opacity-25 mb-4">
              <p className="text-white">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="glass-card">
              {/* Sport Selection */}
              <div className="mb-6">
                <label className="block text-white text-sm font-bold mb-2">
                  Sport
                </label>
                <select
                  name="sport"
                  value={preferences.sport}
                  onChange={handleChange}
                  className="w-full bg-white bg-opacity-10 text-white border border-white border-opacity-20 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="Basketball">Basketball</option>
                  <option value="Soccer">Soccer</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Badminton">Badminton</option>
                </select>
              </div>
              
              {/* Distance Slider */}
              <div className="mb-6">
                <label className="block text-white text-sm font-bold mb-2">
                  Maximum Distance: {preferences.distance} km
                </label>
                <input
                  type="range"
                  name="distance"
                  min="1"
                  max="20"
                  value={preferences.distance}
                  onChange={handleChange}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-xs text-white text-opacity-70">
                  <span>1 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>
              
              {/* Skill Level */}
              <div className="mb-6">
                <label className="block text-white text-sm font-bold mb-2">
                  Skill Level
                </label>
                <select
                  name="skillLevel"
                  value={preferences.skillLevel}
                  onChange={handleChange}
                  className="w-full bg-white bg-opacity-10 text-white border border-white border-opacity-20 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              
              {/* Game Mode */}
              <div className="mb-6">
                <label className="block text-white text-sm font-bold mb-2">
                  Game Mode
                </label>
                <select
                  name="mode"
                  value={preferences.mode}
                  onChange={handleChange}
                  className="w-full bg-white bg-opacity-10 text-white border border-white border-opacity-20 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="Casual">Casual</option>
                  <option value="Competitive">Competitive</option>
                </select>
              </div>
              
              {/* Match Type */}
              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  Match Type
                </label>
                <select
                  name="matchType"
                  value={preferences.matchType}
                  onChange={handleChange}
                  className="w-full bg-white bg-opacity-10 text-white border border-white border-opacity-20 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="1v1">1v1</option>
                  <option value="2v2">2v2</option>
                  <option value="3v3">3v3</option>
                </select>
              </div>
            </div>
            
            {/* Submit Button */}
            <GlassButton
              type="submit"
              className="w-full py-4 mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Finding...' : 'Find Match'}
            </GlassButton>
          </form>
        </main>
      </div>
      
      <GlassTabBar />
    </div>
  );
}