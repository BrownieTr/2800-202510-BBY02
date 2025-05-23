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
 * FIXED: Start looking for a player to match with - improved flow and error handling
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
      
      // STEP 1: Check if user still has preferences (if they don't, they've been matched)
      console.log("Checking if user still has preferences...");
      const preferencesResponse = await fetch('/api/matchmaking/check-preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!preferencesResponse.ok) {
        console.error("Failed to check preferences:", preferencesResponse.status);
        return false;
      }

      const preferencesData = await preferencesResponse.json();
      console.log("Preferences check response:", preferencesData);

      // STEP 2: If preferences don't exist, user has been matched - get their latest match
      if (!preferencesData.hasPreferences) {
        console.log("✅ Preferences deleted - user has been matched! Fetching latest match...");
        
        const userMatchesResponse = await fetch('/api/matchmaking/user-matches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userMatchesResponse.ok) {
          console.error("Failed to fetch user matches:", userMatchesResponse.status);
          return false;
        }

        const userMatchesData = await userMatchesResponse.json();
        console.log("User matches response:", userMatchesData);

        if (userMatchesData.matches && userMatchesData.matches.length > 0) {
          // Get the most recent match (assuming they're sorted by creation date)
          const latestMatch = userMatchesData.matches[0];
          console.log("🎉 Found latest match:", latestMatch);

          // Stop searching
          isSearching = false;
          if (searchTimer) {
            clearInterval(searchTimer);
            searchTimer = null;
            console.log("Stopped match checking timer");
          }

          // Ensure the match data has all required fields
          const matchData = {
            ...latestMatch,
            matchId: latestMatch.matchId || latestMatch.matchID || latestMatch._id,
            // Add any other field normalization here
          };

          console.log("Processed match data:", matchData);

          // Call the callback with match data
          setTimeout(() => {
            if (onMatchFound) {
              console.log("Calling onMatchFound with latest match");
              onMatchFound(matchData);
            }
          }, 100);

          return true;
        } else {
          console.warn("No matches found despite preferences being deleted - this shouldn't happen");
          return false;
        }
      }

      // STEP 3: User still has preferences - they're still in queue, check for new matches
      console.log("User still has preferences - checking for matches with other players...");
      const matchResponse = await fetch('/api/matchmaking/check-for-match', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!matchResponse.ok) {
        const errorText = await matchResponse.text();
        console.error("Error checking for match:", errorText);
        return false;
      }

      const matchData = await matchResponse.json();
      console.log("Match check response:", matchData);

      // If we found a match with another player (this would be immediate matching)
      if (matchData.matchFound && isSearching) {
        console.log('🎉 Immediate match found!', matchData.match);
        
        isSearching = false;
        
        if (searchTimer) {
          clearInterval(searchTimer);
          searchTimer = null;
          console.log("Stopped match checking timer");
        }
        
        // Ensure the match data has all required fields
        const processedMatchData = {
          ...matchData.match,
          matchId: matchData.match.matchId || matchData.match.matchID || matchData.match._id
        };
        
        console.log("Processed immediate match data:", processedMatchData);
        
        setTimeout(() => {
          if (onMatchFound) {
            console.log("Calling onMatchFound with immediate match");
            onMatchFound(processedMatchData);
          }
        }, 100);
        
        return true;
      } else {
        console.log("Still waiting for match. Reason:", matchData.reason || "No other players in queue");
        return false;
      }
    } catch (error) {
      console.error('Error checking for match:', error);
      
      // Don't stop searching on network errors, but log them
      if (error.message.includes('500')) {
        console.error('Server error - check backend logs');
      } else if (error.message.includes('401')) {
        console.error('Authentication error - user may need to log in again');
      }
      
      return false;
    }
  };
  
  console.log("🔍 Starting match search...");
  
  // Start checking immediately and then every 2 seconds (reduced from 3 for faster detection)
  checkForMatch();
  searchTimer = setInterval(checkForMatch, 2000);
  
  // Return an object with functions to control the search
  return {
    cancelSearch: () => {
      console.log("❌ Cancelling match search");
      isSearching = false;
      if (searchTimer) {
        clearInterval(searchTimer);
        searchTimer = null;
      }
    },
    isSearching: () => isSearching
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
      const errorText = await response.text();
      console.error("Error leaving queue:", errorText);
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
    return data.matches || [];
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
}