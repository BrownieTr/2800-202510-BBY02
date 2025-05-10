/**
 * Sports Matchmaking Service
 * Handles finding matches, creating games, and managing the matchmaking queue
 */

// Get the current user info
// import { getCurrentUser } from '........';

import {currentLocation, calculateDistance} from './locationService.jsx'

/**
 * Save a user's matchmaking preferences to the database
 * @param {string} sport - Which sport they want to play
 * @param {string} distance - How far they're willing to travel for a match in km
 * @param {string} skillLevel - Their skill level
 * @param {string} mode - Game mode
 * @param {string} matchType - Type of match
 */
export async function saveMatchPreferences(sport, distance, skillLevel, mode, matchType) {
  try {
    // Make sure user is logged in
    const loggedInUser = getCurrentUser();
    if (!loggedInUser) {
      window.location.href = '/login';
      return;
    }

    const location = await currentLocation();
    const lat = location[0]
    const lon = location[1]
    
    console.log("Saving preferences:", { sport, distance, lat, lon, skillLevel, mode, matchType });
    
    // Send preferences to server
    const response = await fetch('/api/matchmaking/save-preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport: sport,
        distance: distance,
        latitude: lat,
        longitude: lon,
        skillLevel: skillLevel,
        mode: mode,
        matchType: matchType
      })
    });
    
    // Check if everything went OK
    if (response.ok) {
      console.log('Preferences saved successfully!');
      window.location.href = '/matching';
    } else {
      throw new Error('Server returned an error');
    }
  } catch (error) {
    console.error('Failed to save preferences:', error);
    alert('Something went wrong. Please try again.');
  }
}

/**
 * Start looking for a player to match with
 */
export async function startLookingForMatch() {
  try {
    // Make sure user is logged in
    const loggedInUser = getCurrentUser();
    if (!loggedInUser) {
      window.location.href = '/login';
      return;
    }
    
    console.log('Starting to look for a match...');
    
    // Start checking for matches every few seconds
    let searchTimer = setInterval(async function() {
      // Ask server if we found a match yet
      const response = await fetch('/api/matchmaking/check-for-match');
      const data = await response.json();
      
      // If we found a match
      if (data.matchFound) {
        // Stop checking
        clearInterval(searchTimer);
        
        // Save match details
        localStorage.setItem('matchDetails', JSON.stringify(data.match));
        
        // Show message and go to match page
        alert('Match found! Redirecting to match page.');
        window.location.href = '/match';
      } else {
        console.log('Still looking for a match...');
      }
    }, 5000); // Check every 5 seconds
    
    // Save the timer so we can cancel it later if needed
    window.matchSearchTimer = searchTimer;
    
    // Start the visual timer for the user
    startVisualTimer();
  } catch (error) {
    console.error('Error looking for match:', error);
    alert('Something went wrong. Please try again.');
  }
}

/**
 * Create a new match between two players
 * @param {string} player1 - First player's ID
 * @param {string} player2 - Second player's ID
 * @param {Object} matchDetails - Details about the match
 */
export async function createMatch(player1, player2, matchDetails) {
  try {
    // Get player names
    const player1Name = await getPlayerName(player1);
    const player2Name = await getPlayerName(player2);
    
    // Format the match data
    const matchData = {
      matchID: generateMatchID(player1, player2),
      player1: player1,
      player1Name: player1Name,
      player2: player2,
      player2Name: player2Name,
      sport: matchDetails.sport,
      distance: matchDetails.distance,
      skillLevel: matchDetails.skillLevel,
      mode: matchDetails.mode,
      matchType: matchDetails.matchType,
      timestamp: new Date().toLocaleString()
    };
    
    console.log("Creating match:", matchData);
    
    // Send to server
    const response = await fetch('/api/matchmaking/create-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create match');
    }
    
    const result = await response.json();
    console.log("Match created successfully:", result);
    return result.match;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
}

/**
 * Get a player's name from their ID
 * @param {string} playerId - The player's ID
 * @returns {string} The player's name
 */
async function getPlayerName(playerId) {
  try {
    const response = await fetch(`/api/users/${playerId}`);
    if (!response.ok) {
      return "Unknown Player";
    }
    const data = await response.json();
    return data.name || "Unknown Player";
  } catch (error) {
    console.error("Error getting player name:", error);
    return "Unknown Player";
  }
}

/**
 * Generate a unique match ID
 * @param {string} player1 - First player's ID
 * @param {string} player2 - Second player's ID
 * @returns {string} Unique match ID
 */
function generateMatchID(player1, player2) {
  return `match_${player1}_${player2}_${Date.now()}`;
}

/**
 * Remove a user from the matchmaking queue
 */
export async function removeFromMatchmakingQueue() {
  try {
    // Make sure user is logged in
    const loggedInUser = getCurrentUser();
    if (!loggedInUser) {
      return false;
    }
    
    // Tell server to remove user from queue
    const response = await fetch('/api/matchmaking/leave-queue', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to leave queue');
    }
    
    console.log('Successfully removed from matchmaking queue');
    return true;
  } catch (error) {
    console.error('Error leaving matchmaking queue:', error);
    return false;
  }
}

/**
 * Start the visual timer that shows the user how long they've been waiting
 */
function startVisualTimer() {
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  
  // Get the timer display element
  const timerDisplay = document.getElementById('timerDisplay');
  if (!timerDisplay) {
    console.error("Timer display element not found");
    return;
  }
  
  // Update timer every second
  const timer = setInterval(() => {
    seconds++;
    
    // Convert to minutes when needed
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    
    // Convert to hours when needed
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }
    
    // Format with leading zeros (01:05:32)
    const formattedTime = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update the display
    timerDisplay.textContent = formattedTime;
  }, 1000);
  
  // Save the timer so we can stop it later
  window.timerInterval = timer;
}

/**
 * Cancel current matchmaking and return to main menu
 */
export async function cancelMatchmaking() {
  try {
    console.log("Canceling matchmaking...");
    
    // Stop the timers
    if (window.matchSearchTimer) {
      clearInterval(window.matchSearchTimer);
    }
    
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
    }
    
    // Remove from matchmaking queue
    const removed = await removeFromMatchmakingQueue();
    
    if (removed) {
      alert('You have left the matchmaking queue.');
      window.location.href = '/main';
      return true;
    } else {
      throw new Error('Could not leave queue');
    }
  } catch (error) {
    console.error('Error canceling matchmaking:', error);
    alert('Failed to cancel matchmaking. Please try again.');
    return false;
  }
}

/**
 * Check if a match is available with the given preferences
 * @param {Object} preferences - Matchmaking preferences
 * @returns {Promise<Object|null>} Match object or null if no match found
 */
export async function findAvailableMatch(preferences) {
  try {
    const response = await fetch('/api/matchmaking/available-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    
    if (!response.ok) {
      throw new Error('Failed to find matches');
    }
    
    const data = await response.json();
    return data.matches.length > 0 ? data.matches[0] : null;
  } catch (error) {
    console.error('Error finding available match:', error);
    return null;
  }
}

/**
 * Accept a match that was found
 * @param {string} matchId - ID of the match to accept
 */
export async function acceptMatch(matchId) {
  try {
    const response = await fetch(`/api/matchmaking/accept-match/${matchId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept match');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error accepting match:', error);
    throw error;
  }
}

/**
 * Decline a match that was found
 * @param {string} matchId - ID of the match to decline
 */
export async function declineMatch(matchId) {
  try {
    const response = await fetch(`/api/matchmaking/decline-match/${matchId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to decline match');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error declining match:', error);
    throw error;
  }
}

/**
 * Get details of a specific match
 * @param {string} matchId - ID of the match to get
 */
export async function getMatchDetails(matchId) {
  try {
    const response = await fetch(`/api/matchmaking/match/${matchId}`);
    
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
 */
export async function getUserMatches() {
  try {
    const loggedInUser = getCurrentUser();
    if (!loggedInUser) {
      return [];
    }
    
    const response = await fetch('/api/matchmaking/user-matches');
    
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