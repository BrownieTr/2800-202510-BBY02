/**
 * I based this file on the code from MERN Tutorial: Ep 3 - Setting Up Express on youtube
 * @author Austin Davis
 * @see https://www.youtube.com/watch?v=lWM_8Zq9tUc&t=305s
 * 
 * As well as 
 */
require('dotenv').config({path: "../config.env"});
const connect = require('./databaseConnection.cjs')
const { calculateDistance } = require('../src/services/locationService.jsx')
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Auth0
const { auth } = require('express-oauth2-jwt-bearer');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
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

// Save match preferences
app.post('/api/matchmaking/save-preferences', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.sub; // Get Auth0 user ID
    const { sport, distance, latitude, longitude, skillLevel, mode, matchType } = req.body;
    
    // Connect to database
    const db = connect.db();
    
    // Remove any existing preferences
    await db.collection('matchPreferences').deleteMany({ 
      userId: userId 
    });
    
    // Save new preferences
    await db.collection('matchPreferences').insertOne({
      userId: userId,
      sport: sport,
      distance: distance, 
      latitude: latitude,
      longitude: longitude,
      skillLevel: skillLevel,
      mode: mode,
      matchType: matchType,
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check for a match
app.get('/api/matchmaking/check-for-match', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.sub; // Get Auth0 user ID
    const db = connect.db();
    
    // Get the user's preferences
    const myPreferences = await db.collection('matchPreferences').findOne({ userId: userId });
    
    if (!myPreferences) {
      return res.json({ matchFound: false });
    }
    
    const matchDistance = await db.collection('matchPreferences').find({},{distance: 1, latitude: 1, longitude: 1})

    const matchWithinDistance = []
    matchDistance.each(function (err, item) {
      const distance = calculateDistance(myPreferences.latitude, myPreferences.longitude, item.latitude, item.longitude);

      if( distance < myPreferences.distance && distance < item.distance) {
        matchWithinDistance.push(item.id)
      }
    });

    // Look for other users with matching preferences
    const potentialMatch = await db.collection('matchPreferences').findOne({
      userId: { $in:matchWithinDistance }, // Not the current user
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
    const userId = req.auth.sub; // Get Auth0 user ID
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
    const userId = req.auth.sub; // Get Auth0 user ID
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
    const userId = req.auth.sub; // Get Auth0 user ID
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

app.get('/api/conversations', jwtCheck, async (req, res) => {
  try {
    const auth0Id = req.auth.payload?.sub;

    if(!auth0Id) {
      return res.status(400).json({ error: 'Auth0 ID not found in token' });
    }

    let db = connect.db();
    let user = await db.collection('users').findOne({ auth0Id: auth0Id });
    
    if(!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find conversations where the user's ID is in the participants array
    let conversations = await db.collection('conversations').find({
      participants: { $in: [user._id] }
    }).toArray();

    console.log("Conversations found:", conversations);
    
    // Enhance the conversation data with recipient info
    const enhancedConversations = await Promise.all(conversations.map(async (convo) => {
      // Find the other participant ID (not the current user)
      const otherParticipantId = convo.participants.find(
        id => id.toString() !== user._id.toString()
      );
      
      // Get recipient details
      const recipient = await db.collection('users').findOne({ _id: otherParticipantId });
      
      return {
        _id: convo._id,
        recipientId: otherParticipantId,
        recipientName: recipient ? recipient.name : 'Unknown User',
        lastMessage: convo.lastMessage || "",
        timestamp: convo.lastMessageDate || convo.createdAt || new Date()
      };
    }));
    
    res.json({ conversations: enhancedConversations });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

//Gets all the messages from the chat of chatID
app.get('/api/chat/chatMessages/:chatID', jwtCheck, async (req,res) => {
  // Implementation needed
});

//Starts a new chat between 2 users
app.post('/api/chat/newChat/:userID1/:userID2', jwtCheck, async (req,res) => {
  // Implementation needed
});

// List all of the chats that a user has
app.get('/api/chat/allChats/:userID', jwtCheck, async (req,res) => {
  // Implementation needed
});

//Send a message to the chat. 
app.post('/api/chat/sendMessage/:userID/:chatID', jwtCheck, async (req,res) => {
  // Implementation needed
});

app.listen(PORT, async () => {
  try {
    await connect.connect();
    console.log('Server is running on port ' + PORT + ' and connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to database:', err);
    console.log('Server is running on port ' + PORT + ' but NOT connected to MongoDB');
  }
});