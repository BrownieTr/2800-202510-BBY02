/**
 * Sports Matchmaking Service - FIXED VERSION
 * Handles finding matches, creating games, and managing the matchmaking queue
 */

/**
 * Save a user's matchmaking preferences to the database
 */
export async function saveMatchPreferences(sport, distance, latitude, longitude, skillLevel, mode, matchType, getAccessTokenSilently) {
  try {
    console.log("Saving preferences:", { sport, distance, latitude, longitude, skillLevel, mode, matchType });
    
    const token = await getAccessTokenSilently();
    
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
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Preferences saved successfully:", data);
    
    return data.success;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    throw error;
  }
}

/**
 * FIXED: Start looking for a player to match with - better error handling and logging
 */
export function startLookingForMatch(getAccessTokenSilently, onMatchFound) {
  let searchTimer = null;
  let isSearching = true;
  let checkCount = 0;
  
  // Function to check for a match
  const checkForMatch = async () => {
    if (!isSearching) {
      console.log("Search cancelled, stopping checks");
      return;
    }
    
    checkCount++;
    console.log(`Match check #${checkCount}`);
    
    try {
      const token = await getAccessTokenSilently();
      
      // First check if user still has preferences (if they don't, they've been matched)
      const preferencesResponse = await fetch('/api/matchmaking/check-preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!preferencesResponse.ok) {
        console.error("Failed to check preferences");
        return false;
      }

      const preferencesData = await preferencesResponse.json();
      console.log("Preferences check response:", preferencesData);

      // If preferences don't exist, user has been matched - check their matches
      if (!preferencesData.hasPreferences) {
        console.log("Preferences don't exist - user has been matched!");
        const userMatchesResponse = await fetch('/api/matchmaking/user-matches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userMatchesResponse.ok) {
          const userMatchesData = await userMatchesResponse.json();
          console.log("User matches response:", userMatchesData);

          if (userMatchesData.matches && userMatchesData.matches.length > 0) {
            const latestMatch = userMatchesData.matches[0];
            console.log("Found match:", latestMatch);

            isSearching = false;
            if (searchTimer) {
              clearInterval(searchTimer);
              searchTimer = null;
              console.log("Stopped match checking timer");
            }

            setTimeout(() => {
              if (onMatchFound) {
                console.log("Calling onMatchFound with match");
                onMatchFound(latestMatch);
              }
            }, 100);

            return true;
          }
        }
        return false;
      }

      // User still has preferences - check for matches with other players
      const response = await fetch('/api/matchmaking/check-for-match', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Match check response:", data);

      // If we found a match with another player
      if (data.matchFound && isSearching) {
        console.log('🎉 Match found!', data.match);
        
        isSearching = false; // Stop searching immediately
        
        // Stop the interval
        if (searchTimer) {
          clearInterval(searchTimer);
          searchTimer = null;
          console.log("Stopped match checking timer");
        }
        
        // Ensure the match data has all required fields
        const matchData = {
          ...data.match,
          matchId: data.match.matchId || data.match.matchID || data.match._id
        };
        
        console.log("Processed match data:", matchData);
        
        // Call the callback with match data
        setTimeout(() => {
          if (onMatchFound) {
            console.log("Calling onMatchFound callback");
            onMatchFound(matchData);
          }
        }, 100);
        
        return true;
      } else {
        console.log("No match found with other players. Reason:", data.reason || "Unknown");
        return false;
      }
    } catch (error) {
      console.error('Error checking for match:', error);
      
      // Don't stop searching on network errors, but log them
      if (error.message.includes('500')) {
        console.error('Server error - check backend logs');
      }
      
      return false;
    }
  };
  
  console.log("Starting match search...");
  
  // Start checking immediately and then every 3 seconds
  checkForMatch();
  searchTimer = setInterval(checkForMatch, 3000);
  
  // Return an object with functions to control the search
  return {
    cancelSearch: () => {
      console.log("Cancelling match search");
      isSearching = false;
      if (searchTimer) {
        clearInterval(searchTimer);
        searchTimer = null;
      }
    }
  };
}

/**
 * Cancel current matchmaking and leave the queue
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
    console.log("Left matchmaking queue:", result);
    return result.success;
  } catch (error) {
    console.error('Error canceling matchmaking:', error);
    return false;
  }
}

/**
 * Get details of a specific match
 */
export async function getMatchDetails(matchId, getAccessTokenSilently) {
  try {
    console.log("Getting match details for:", matchId);
    const token = await getAccessTokenSilently();
    
    const response = await fetch(`/api/matchmaking/match/${matchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log("Match not found");
        return null;
      }
      throw new Error('Failed to get match details');
    }
    
    const data = await response.json();
    console.log("Match details:", data);
    return data.match;
  } catch (error) {
    console.error('Error getting match details:', error);
    throw error;
  }
}

/**
 * Get all active matches for the current user
 */
export async function getUserMatches(getAccessTokenSilently) {
  try {
    console.log("Getting user matches...");
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
    console.log("User matches:", data.matches);
    return data.matches;
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
}
