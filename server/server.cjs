const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connect = require('./databaseConnection.cjs')
const { calculateDistance } = require('../src/services/locationService.jsx')
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const { auth } = require('express-oauth2-jwt-bearer');
const { MongoClient, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

const jwtCheck = auth({
  audience: 'https://api.playpal.com',
  issuerBaseURL: 'https://dev-d0fbndwh4b5aqcbr.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

app.use(jwtCheck);

app.get('/users', async (req, res) => {
  let db = connect.db();
  let data = await db.collection('users').find({}).toArray();
  res.send(data);
});

app.get('/api/profile', jwtCheck, async (req, res) => {
  try {
    // Log the entire auth object
    console.log("Full Auth0 token payload:", req.auth);

    // Access sub from within the payload object
    const auth0Id = req.auth.payload?.sub;
    console.log("Auth0 ID extracted:", auth0Id);

    if (!auth0Id) {
      console.error("Could not find Auth0 ID in token!");
      console.log("Available fields in req.auth:", Object.keys(req.auth));
      console.log("Available fields in payload:", req.auth.payload ? Object.keys(req.auth.payload) : "No payload");
      return res.status(400).json({ error: 'Auth0 ID not found in token' });
    }

    let db = connect.db();

    // Find user by Auth0 ID
    let user = await db.collection('users').findOne({ auth0Id: auth0Id });
    console.log("User found in DB:", user ? "Yes" : "No");

    // If user doesn't exist, create a new one
    if (!user) {
      console.log("Creating new user for Auth0 ID:", auth0Id);

      // Get user info from Auth0 userinfo endpoint
      // Since we don't have user details in the token, we'll use a default name for now
      // and update it later if needed

      user = {
        auth0Id: auth0Id,
        name: "New User",  // Default name
        email: "No email available",
        address: "Not set",
        country: "Not set",
        preferences: "Not set",
        createdAt: new Date()
      };

      console.log("About to insert user:", user);

      // Save to database
      const result = await db.collection('users').insertOne(user);
      console.log("Insert result:", result);
    } else {
      console.log("Found existing user with ID:", auth0Id);
    }

    res.json(user);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Example: Update profile
app.post('/api/profile/update', jwtCheck, async (req, res) => {
  try {
    // Get Auth0 ID from token
    const auth0Id = req.auth.payload.sub;

    // Get data from request
    const { name, address, country, preferences } = req.body;

    let db = connect.db();

    // Update user by Auth0 ID
    const result = await db.collection('users').updateOne(
      { auth0Id: auth0Id },
      {
        $set: {
          name, address, country, preferences,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user
    const updatedUser = await db.collection('users').findOne({ auth0Id: auth0Id });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Matchmaking Routes

app.post('/api/matchmaking/save-preferences', jwtCheck, async (req, res) => {
  try {
    // Log the request
    console.log("Received save preferences request:");
    console.log("Auth info:", req.auth);
    console.log("Request body:", req.body);

    const userId = req.auth.payload.sub; // Get Auth0 user ID
    console.log("User ID:", userId);

    const { sport, distance, latitude, longitude, skillLevel, mode, matchType } = req.body;

    // Connect to database
    const db = connect.db();
    console.log("Connected to database");

    // Remove any existing preferences
    console.log("Removing existing preferences for user:", userId);
    const deleteResult = await db.collection('matchPreferences').deleteMany({
      userId: userId
    });
    console.log("Delete result:", deleteResult);

    // Save new preferences
    console.log("Saving new preferences for user:", userId);
    const insertData = {
      userId: userId,
      sport: sport,
      distance: distance,
      latitude: latitude,
      longitude: longitude,
      skillLevel: skillLevel,
      mode: mode,
      matchType: matchType,
      timestamp: new Date()
    };
    console.log("Insert data:", insertData);

    const insertResult = await db.collection('matchPreferences').insertOne(insertData);
    console.log("Insert result:", insertResult);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Check for a match
app.get('/api/matchmaking/check-for-match', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub; // <-- Updated to use payload.sub
    console.log("Checking for match for user:", userId);

    const db = connect.db();

    // Get the user's preferences
    const myPreferences = await db.collection('matchPreferences').findOne({ userId: userId });

    if (!myPreferences) {
      return res.json({ matchFound: false });
    }

    const matchWithinDistance = []
    const matchDistanceArray = await db.collection('matchPreferences')
      .find({ userId: { $ne: userId } }) // Exclude current user
      .project({ distance: 1, latitude: 1, longitude: 1, userId: 1 })
      .toArray();

    for (const item of matchDistanceArray) {
      if (item.latitude && item.longitude) { // Check if coordinates exist
        const distance = calculateDistance(myPreferences.latitude, myPreferences.longitude, item.latitude, item.longitude);

        if (distance < myPreferences.distance && distance < item.distance) {
          matchWithinDistance.push(item.userId); // Using userId instead of id
        }
      }
    }

    // Look for other users with matching preferences
    const potentialMatch = await db.collection('matchPreferences').findOne({
      userId: { $in: matchWithinDistance }, // Not the current user
      sport: myPreferences.sport,
      skillLevel: myPreferences.skillLevel,
      mode: myPreferences.mode,
      matchType: myPreferences.matchType
    });

    if (!potentialMatch) {
      return res.json({ matchFound: false });
    }

    const user1 = myPreferences;
    const user2 = potentialMatch;

    const distance = calculateDistance(myPreferences.latitude, myPreferences.longitude, potentialMatch.latitude, potentialMatch.longitude);

    // Create the match
    const matchData = {
      matchID: `match_${userId}_${potentialMatch.userId}_${Date.now()}`,
      player1: userId,
      player1Name: user1 ? user1.name : 'Unknown Player',
      player2: potentialMatch.userId,
      player2Name: user2 ? user2.name : 'Unknown Player',
      sport: myPreferences.sport,
      distance: distance,
      skillLevel: myPreferences.skillLevel,
      mode: myPreferences.mode,
      matchType: myPreferences.matchType,
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };

    // Save match to database
    await db.collection('matches').insertOne(matchData);

    // Remove both users from matchmaking queue
    await db.collection('matchPreferences').deleteMany({
      userId: { $in: [userId, potentialMatch.userId] }
    });

    return res.json({
      matchFound: true,
      match: matchData
    });
  } catch (error) {
    console.error('Error checking for matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a match
app.post('/api/matchmaking/create-match', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    console.log("Creating match for user:", userId);

    const matchData = req.body;
    const db = connect.db();

    // Save match to database
    await db.collection('matches').insertOne(matchData);

    // Remove players from matchmaking queue
    await db.collection('matchPreferences').deleteMany({
      userId: { $in: [matchData.player1, matchData.player2] }
    });

    res.json({ success: true, match: matchData });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave matchmaking queue
app.post('/api/matchmaking/leave-queue', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    console.log("User leaving queue:", userId);

    const db = connect.db();

    // Remove from matchmaking queue
    await db.collection('matchPreferences').deleteMany({ userId: userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving queue:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a user's matches
app.get('/api/matchmaking/user-matches', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub; // <-- Updated to use payload.sub
    console.log("Getting matches for user:", userId);

    const db = connect.db();

    // Find matches where user is player1 or player2
    const matches = await db.collection('matches').find({
      $or: [
        { player1: userId },
        { player2: userId }
      ]
    }).toArray();

    res.json({ matches: matches });
  } catch (error) {
    console.error('Error getting user matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific match details
app.get('/api/matchmaking/match/:matchId', jwtCheck, async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const db = connect.db();

    const match = await db.collection('matches').findOne({ matchID: matchId });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ match: match });
  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//Event Routes
// Get all events
app.get('/api/events', jwtCheck, async (req, res) => {
  try {
    const db = connect.db();
    
    // Fetch all events from the database
    const events = await db.collection('events').find({}).toArray();
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new event
app.post('/api/events/create', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub; // Get Auth0 user ID
    
    // Get event data from request body
    const { name, description, date, time, location } = req.body;
    
    // Validate required fields
    if (!name || !date || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = connect.db();
    
    // Create the event object
    const event = {
      creatorId: userId,
      name,
      description,
      date,
      time,
      location,
      participants: [userId], // Creator is automatically a participant
      createdAt: new Date()
    };
    
    // Save to database
    const result = await db.collection('events').insertOne(event);
    
    // Return the created event with its ID
    res.status(201).json({
      success: true,
      event: {
        ...event,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event details
app.get('/api/events/:eventId', jwtCheck, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const db = connect.db();
    
    // Find the event by ID
    const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join an event
app.post('/api/events/:eventId/join', jwtCheck, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.auth.payload.sub;
    
    const db = connect.db();
    
    // Update the event to add the user to participants if not already there
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $addToSet: { participants: userId } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//Gets all the messages from the chat of chatID
app.get('/api/chat/chatMessages/:chatID', jwtCheck, async (req, res) => {
  // Implementation needed
});

//Starts a new chat between 2 users
app.post('/api/chat/newChat/:userID1/:userID2', jwtCheck, async (req, res) => {
  // Implementation needed
});

// List all of the chats that a user has
app.get('/api/chat/allChats/:userID', jwtCheck, async (req, res) => {
  // Implementation needed
});

//Send a message to the chat. 
app.post('/api/chat/sendMessage/:userID/:chatID', jwtCheck, async (req, res) => {
  // Implementation needed
});

//Set up the betting pool
//userID: Person who sets up bet is the only person who can close the bet, probably event owner. 
//Team1Name: Name of team 1
//team2Name: Name of team 2
app.post('/api/bets/makePool', jwtCheck, async(req,res) => {
  try{
    const {userId, team1Name, team2Name } = req.body;
    const db = connect.db();

    const insertData = {
      userId: userId,
      team1Name: team1Name,
      team2Name: team2Name, 
      team1Betters: [],
      team2Betters: [],
      pot: 0,
      timestamp: new Date()
    }
  
    //add to collection
    const insertResults = await db.collection('bets').insertOne(insertData);
  
    res.json({success: true, bettingID: insertResults.insertedId})
    //return betting id

  } catch(error) {
    console.error("Error:", error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }

})


//
// betAmount is the amount the user is betting
//team to bet is the team the user is betting on, either 1 or 2
app.post('/api/bets/makeBet/:betId', jwtCheck, async(req,res) => {
  try{ 
    const {userId, name, betAmount, teamToBet} = req.body;
    const betId = req.params.betId;
    const db = connect.db();

    const insertData = {
      userId: userId, 
      bet: betAmount,
      name: name
    }
    
    if (teamToBet == 1) {
    const result = await db.collection('bets').updateOne(
      {_id: new ObjectId(betId)},
      {
        $addToSet: {
          team1Betters: insertData
        },
        $inc : {
          pot: betAmount
        }
      }
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Betting pool not found' });
    }

    return res.json({success: true})
    } else if(backingTeam == 2) {
    const result = await db.collection('bets').updateOne(
      {_id: new ObjectId(betId)},
      {
        $addToSet: {
          team2Betters: insertData
        },
        $inc : {
          pot: betAmount
        }
      }
    )
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Betting pool not found' });
    }
    return res.json({success: true})
    }

  } catch (error) {
    console.error("Error:", error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
})

app.get('/api/bets/bettingDetails/:betId', jwtCheck, async(req,res) =>{ 
  try{
    const betId = req.params.betId
  
    let bet = await db.collection('bets').findOne({_id: new ObjectId(betId)});

    if(!bet) {
      return res.status(404).json({success: false, error: "Betting pool not found"})
    }
  
    let team1Pool = 0;
    let team1Names = []
    for(let i = 0; i < bet.team1Betters.length; i++) {
      team1Names.push(bet.team1Betters[i].name);
      team1Pool += bet.team1Betters[i].bet;
    }
    let team2Pool = 0;
    let team2Names = [];
    for(let i = 0; i < bet.team2Betters.length; i++) {
      team2Names.push(bet.team2Betters[i].name);
      team2Pool += bet.team2Betters[i].bet;
    }
  
     const toSend = {
      success: true,
      team1Name: bet.team1Name,
      team2Name: bet.team2Name,
      team1Betters: team1Names,
      team2Betters: team2Names,
      team1Pool: team1Pool,
      team2Pool: team2Pool,
      team1Odds: ((bet.pot / team1Pool) * 100),
      team2Odds: ((bet.pot / team2Pool) * 100)
     }
  
     res.json(toSend)

  } catch (error) {
    console.error("Error:", error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
  //returns list of teamA backers, teamB backers, and current odds, 
})

//Winner is either 1 or 2: 1 for team1 winning and vice versa
//Team1 Pool and Team2Pool can be got from bettingDetails. 
app.post('/api/bets/resolveBet/:betId', jwtCheck, async(req,res) => {
  try{
    const betId = req.params.betId
    const {winner, team1Pool, team2Pool} = req.body
    const db = connect.db();
    const bet = await db.collection('bets').findOne({_id:  new ObjectId(betId)});
    const payout = {}
    if(!bet) {
       return res.status(404).json({success: false, error: "Betting pool not found"})
    }
    if(winner == 1) {
      for(let i = 0; i < bet.team1Betters.length; i++) {
        payout[bet.team1Betters[i].name] = ((bet.team1Betters[i].bet/team1Pool) * team2Pool) = bet.team1Betters[i].bet
      }
    } else if(winner == 2) {
      for(let i = 0; i < bet.team2Betters.length; i++ ) {
        payout[bet.team2Betters[i].name] = ((bet.team2Betters[i].bet/team2Pool) * team1Pool) = bet.team2Betters[i].bet
      }
    return res.json({success: true, payout: payout});
    }
  } catch(error) {
    console.error("Error:", error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
})

app.listen(PORT, async () => {
  try {
    await connect.connect();
    console.log('Server is running on port ' + PORT + ' and connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to database:', err);
    console.log('Server is running on port ' + PORT + ' but NOT connected to MongoDB');
  }
});