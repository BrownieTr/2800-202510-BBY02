/**
 * Sports Matchmaking Service
 * Handles finding matches, creating games, and managing the matchmaking queue
 */

/**
 * Save a user's matchmaking preferences to the database
 * @param {string} sport - Which sport they want to play
 * @param {number} distance - How far they're willing to travel for a match in km
 * @param {string} skillLevel - Their skill level
 * @param {string} mode - Game mode
 * @param {string} matchType - Type of match
 * @param {function} getAccessTokenSilently - Auth0 function to get token
 */
export async function saveMatchPreferences(sport, distance, latitude, longitude, skillLevel, mode, matchType, getAccessTokenSilently) {
  try {
    console.log("Saving preferences:", { sport, distance, latitude, longitude, skillLevel, mode, matchType });
    
    const token = await getAccessTokenSilently();
    console.log("Got token (first 20 chars):", token.substring(0, 20) + "...");
    
    console.log("Sending request to:", '/api/matchmaking/save-preferences');
    const response = await fetch('/api/matchmaking/save-preferences', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sport: sport,
        distance: distance,
        latitude: latitude, 
        longitude: longitude, 
        skillLevel: skillLevel,
        mode: mode,
        matchType: matchType
      })
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Response data:", data);
    
    return data.success;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    throw error;
  }
}

/**
 * FIXED: Start looking for a player to match with - prevents race conditions
 * @param {function} getAccessTokenSilently - Auth0 function to get token
 * @param {function} onMatchFound - Callback for when a match is found
 * @returns {Object} - Contains the cancel function
 */
export function startLookingForMatch(getAccessTokenSilently, onMatchFound) {
  let searchTimer = null;
  let isSearching = true; // FIXED: Add flag to prevent race conditions
  
  // Function to check for a match
  const checkForMatch = async () => {
    if (!isSearching) return; // FIXED: Check if still searching
    
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch('/api/matchmaking/check-for-match', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check for match');
      }
      
      const data = await response.json();
      
      // If we found a match
      if (data.matchFound && isSearching) { // FIXED: Double-check still searching
        console.log('Match found in matchmaking service!', data.match);
        
        isSearching = false; // FIXED: Stop searching immediately
        
        // Stop checking immediately
        if (searchTimer) {
          clearInterval(searchTimer);
          searchTimer = null;
        }
        
        // Ensure the match data has all required fields
        const matchData = {
          ...data.match,
          matchId: data.match.matchId || data.match.matchID || `match_${Date.now()}`
        };
        
        // FIXED: Call the callback with match data after a short delay
        // This helps ensure all async operations have completed
        setTimeout(() => {
          if (onMatchFound && isSearching !== false) { // Double check
            onMatchFound(matchData);
          }
        }, 50); // Reduced delay for faster response
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for match:', error);
      return false;
    }
  };
  
  // Start checking immediately and then every 3 seconds
  checkForMatch();
  searchTimer = setInterval(checkForMatch, 3000);
  
  // Return an object with functions to control the search
  return {
    cancelSearch: () => {
      isSearching = false; // FIXED: Set flag
      if (searchTimer) {
        clearInterval(searchTimer);
        searchTimer = null;
      }
    }
  };
}

/**
 * Cancel current matchmaking and leave the queue
 * @param {function} getAccessTokenSilently - Auth0 function to get token
 */
export async function cancelMatchmaking(getAccessTokenSilently) {
  try {
    console.log("Canceling matchmaking...");
    
    const token = await getAccessTokenSilently();
    
    const response = await fetch('/api/matchmaking/leave-queue', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to leave queue');
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error canceling matchmaking:', error);
    return false;
  }
}

/**
 * Get details of a specific match
 * @param {string} matchId - ID of the match to get
 * @param {function} getAccessTokenSilently - Auth0 function to get token
 */
export async function getMatchDetails(matchId, getAccessTokenSilently) {
  try {
    const token = await getAccessTokenSilently();
    
    const response = await fetch(`/api/matchmaking/match/${matchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get match details');
    }
    
    const data = await response.json();
    return data.match; // Return the match object directly
  } catch (error) {
    console.error('Error getting match details:', error);
    throw error;
  }
}

/**
 * Get all active matches for the current user
 * @param {function} getAccessTokenSilently - Auth0 function to get token
 */
export async function getUserMatches(getAccessTokenSilently) {
  try {
    const token = await getAccessTokenSilently();
    
    const response = await fetch('/api/matchmaking/user-matches', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user matches');
    }
    
    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
}