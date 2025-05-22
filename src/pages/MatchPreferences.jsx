import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
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

  return (
    <>
      <Navbar header="PlayPal" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-bold text-3xl mb-6 text-center">Find a Match</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          {/* Sport Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sport
            </label>
            <select
              name="sport"
              value={preferences.sport}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Basketball">Basketball</option>
              <option value="Soccer">Soccer</option>
              <option value="Tennis">Tennis</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Badminton">Badminton</option>
            </select>
          </div>
          
          {/* Distance Slider */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Maximum Distance: {preferences.distance} km
            </label>
            <input
              type="range"
              name="distance"
              min="1"
              max="20"
              value={preferences.distance}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          
          {/* Skill Level */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Skill Level
            </label>
            <select
              name="skillLevel"
              value={preferences.skillLevel}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          {/* Game Mode */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Game Mode
            </label>
            <select
              name="mode"
              value={preferences.mode}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Casual">Casual</option>
              <option value="Competitive">Competitive</option>
            </select>
          </div>
          
          {/* Match Type */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Match Type
            </label>
            <select
              name="matchType"
              value={preferences.matchType}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="1v1">1v1</option>
              <option value="2v2">2v2</option>
              <option value="3v3">3v3</option>
            </select>
          </div>
          
          {/* Submit Button */}
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              disabled={isLoading}
              className={`${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Finding...' : 'Find Match'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}