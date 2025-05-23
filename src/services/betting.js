/**
 * Make a betting pool that players can bet on. 
 */
export async function makeBettingPool(team1Name, team2Name, getAccessTokenSilently) {
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch('/api/bets/makePool', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        team1Name: team1Name,
        team2Name: team2Name,
      })
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.bettingId
  } catch (error) {
    console.error('Failed to make betting pool:', error);
    throw error;
  }
}

export async function makeBet(getAccessTokenSilently, betId, userId, name, betAmount, teamToBet) {
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(`/api/bets/makeBet/${betId}`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        name: name,
        betAmount: betAmount,
        teamToBet: teamToBet
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
    console.error('Failed to make bet:', error);
    throw error;
  }
}

// FIXED: Remove body from GET request
export async function getBettingDetails(getAccessTokenSilently, betId) {
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(`/api/bets/bettingDetails/${betId}`, {
      method: 'GET', // FIXED: GET request without body
      headers: {
        'Authorization': `Bearer ${token}`
      }
      // FIXED: Removed body from GET request
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Response data:", data);
    return data.data
  } catch (error) {
    console.error('Failed to get betting details:', error);
    throw error;
  }
}

export async function resolveBet(getAccessTokenSilently, betId, winner, team1Pool, team2Pool) {
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(`/api/bets/resolveBet/${betId}`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        betId: betId,
        winner: winner,
        team1Pool: team1Pool,
        team2Pool: team2Pool
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
    return data.payout

  } catch (error) {
    console.error('Failed to resolve bet:', error);
    throw error;
  }
}