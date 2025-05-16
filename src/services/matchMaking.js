/**
 * Sports Matchmaking Service
 * Handles finding matches, creating games, and managing the matchmaking queue
 */

// Import Auth0 hooks and utilities
// This file will need to be imported into a React component to use these functions

/**
 * Save a user's matchmaking preferences to the database
 * @param {string} sport - Which sport they want to play
 * @param {number} distance - How far they're willing to travel for a match in km
 * @param {string} skillLevel - Their skill level
 * @param {string} mode - Game mode
 * @param {string} matchType - Type of match
 * @param {function} getAccessTokenSilently - Auth0 function to get token
 */
export async function saveMatchPreferences(sport, distance, skillLevel, mode, matchType, getAccessTokenSilently) {
  try {
    // Add debug logs
    console.log("Saving preferences:", { sport, distance, skillLevel, mode, matchType });
    
    // Get the Auth0 token
    const token = await getAccessTokenSilently();
    console.log("Got token (first 20 chars):", token.substring(0, 20) + "...");
    
    // Send preferences to server
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
        latitude: 49.2827, // Default latitude for Vancouver
        longitude: -123.1207, // Default longitude for Vancouver
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
 * Start looking for a player to match with
 * @param {function} getAccessTokenSilently - Auth0 function to get token
 * @param {function} onMatchFound - Callback for when a match is found
 * @returns {Object} - Contains the cancel function
 */
export function startLookingForMatch(getAccessTokenSilently, onMatchFound) {
  let searchTimer = null;
  
  // Function to check for a match
  const checkForMatch = async () => {
    try {
      // Get the Auth0 token
      const token = await getAccessTokenSilently();
      
      // Ask server if we found a match yet
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
      if (data.matchFound) {
        // Stop checking
        clearInterval(searchTimer);
        
        // Call the callback with match data
        if (onMatchFound) {
          onMatchFound(data.match);
        }
        
        return true;
      } else {
        console.log('Still looking for a match...');
        return false;
      }
    } catch (error) {
      console.error('Error checking for match:', error);
      return false;
    }
  };
  
  // Start checking immediately and then every 5 seconds
  checkForMatch();
  searchTimer = setInterval(checkForMatch, 5000);
  
  // Return an object with functions to control the search
  return {
    cancelSearch: () => {
      if (searchTimer) {
        clearInterval(searchTimer);
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
    
    // Get the Auth0 token
    const token = await getAccessTokenSilently();
    
    // Remove from matchmaking queue
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
    // Get the Auth0 token
    const token = await getAccessTokenSilently();
    
    const response = await fetch(`/api/matchmaking/match/${matchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get match details');
    }
    
    return await response.json();
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
    // Get the Auth0 token
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