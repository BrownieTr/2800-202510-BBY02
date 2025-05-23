const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connect = require('./databaseConnection.cjs')
const calculateDistance = require('../src/services/locationService.jsx')
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
    console.log("Full Auth0 token payload:", req.auth);

    const auth0Id = req.auth.payload?.sub;
    console.log("Auth0 ID extracted:", auth0Id);

    if (!auth0Id) {
      console.error("Could not find Auth0 ID in token!");
      console.log("Available fields in req.auth:", Object.keys(req.auth));
      console.log("Available fields in payload:", req.auth.payload ? Object.keys(req.auth.payload) : "No payload");
      return res.status(400).json({ error: 'Auth0 ID not found in token' });
    }

    let db = connect.db();

    let user = await db.collection('users').findOne({ auth0Id: auth0Id });
    console.log("User found in DB:", user ? "Yes" : "No");

    if (!user) {
      console.log("Creating new user for Auth0 ID:", auth0Id);

      user = {
        auth0Id: auth0Id,
        name: "New User",
        email: "No email available",
        address: "Not set",
        country: "Not set",
        preferences: "Not set",
        createdAt: new Date(),
        setUp: false,
        profilePic: ""
      };

      console.log("About to insert user:", user);

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

app.post('/api/profile/update', jwtCheck, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { name, address, country, preferences, setUp, profilePic, email } = req.body;

    let db = connect.db();

    const result = await db.collection('users').updateOne(
      { auth0Id: auth0Id },
      {
        $set: {
          name, address, country, preferences, setUp, profilePic, email,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    console.log("Received save preferences request:");
    console.log("Auth info:", req.auth);
    console.log("Request body:", req.body);

    const userId = req.auth.payload.sub;
    console.log("User ID:", userId);

    const { sport, distance, latitude, longitude, skillLevel, mode, matchType } = req.body;

    const db = connect.db();
    console.log("Connected to database");
    const result = await db.collection('users').findOne({ auth0Id: userId });

    console.log("Removing existing preferences for user:", userId);
    const deleteResult = await db.collection('matchPreferences').deleteMany({
      userId: userId
    });
    console.log("Delete result:", deleteResult);

    console.log("Saving new preferences for user:", userId);
    const insertData = {
      userId: userId,
      name: result.name,
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

app.get('/api/matchmaking/check-for-match', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    console.log("Checking for match for user:", userId);

    const db = connect.db();

    // Get the user's preferences
    const myPreferences = await db.collection('matchPreferences').findOne({ userId: userId });
    console.log("My preferences:", myPreferences);

    if (!myPreferences) {
      console.log("No preferences found for user");
      return res.json({ matchFound: false, reason: "No preferences set" });
    }

    // Validate required fields
    if (!myPreferences.latitude || !myPreferences.longitude) {
      console.log("Missing location data");
      return res.json({ matchFound: false, reason: "Missing location data" });
    }

    const matchWithinDistance = [];
    const matchDistanceArray = await db.collection('matchPreferences')
      .find({ userId: { $ne: userId } }) // Exclude current user
      .project({ distance: 1, latitude: 1, longitude: 1, userId: 1 })
      .toArray();

    console.log("Found other users:", matchDistanceArray.length);

    for (const item of matchDistanceArray) {
      if (item.latitude && item.longitude) { // Check if coordinates exist
        const distance = calculateDistance(
          myPreferences.latitude,
          myPreferences.longitude,
          item.latitude,
          item.longitude
        );
        console.log(`Distance to ${item.userId}: ${distance}km`);

        if (distance <= myPreferences.distance && distance <= item.distance) {
          matchWithinDistance.push(item.userId);
          console.log(`User ${item.userId} is within distance range`);
        }
      }
    }

    console.log("Users within distance:", matchWithinDistance);

    if (matchWithinDistance.length === 0) {
      return res.json({ matchFound: false, reason: "No users within distance" });
    }

    // Look for other users with matching preferences
    const potentialMatch = await db.collection('matchPreferences').findOne({
      userId: { $in: matchWithinDistance }, // Must be within distance
      sport: myPreferences.sport,
      skillLevel: myPreferences.skillLevel,
      mode: myPreferences.mode,
      matchType: myPreferences.matchType
    });

    console.log("Potential match found:", potentialMatch);

    if (!potentialMatch) {
      return res.json({ matchFound: false, reason: "No matching preferences" });
    }

    const user1 = myPreferences;
    const user2 = potentialMatch;
    console.log("USER 1:", user1);
    console.log("USER 2:", user2);
    
    const distance = calculateDistance(
      myPreferences.latitude,
      myPreferences.longitude,
      potentialMatch.latitude,
      potentialMatch.longitude
    );

    // Create the match
    const matchData = {
      matchID: `match_${userId}_${potentialMatch.userId}_${Date.now()}`,
      player1: userId,
      player1Name: user1 ? user1.name : 'Unknown Player',
      player2: potentialMatch.userId,
      player2Name: user2 ? user2.name : 'Unknown Player',
      sport: myPreferences.sport,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      skillLevel: myPreferences.skillLevel,
      mode: myPreferences.mode,
      matchType: myPreferences.matchType,
      timestamp: new Date().toISOString(), // Use ISO string for consistency
      status: 'pending',
      createdAt: new Date()
    };

    console.log("Creating match:", matchData);

    // Save match to database
    const matchResult = await db.collection('matches').insertOne(matchData);
    console.log("Match saved with ID:", matchResult.insertedId);

    // Remove both users from matchmaking queue
    const deleteResult = await db.collection('matchPreferences').deleteMany({
      userId: { $in: [userId, potentialMatch.userId] }
    });
    console.log("Removed from queue:", deleteResult.deletedCount, "users");

    return res.json({
      matchFound: true,
      match: {
        ...matchData,
        _id: matchResult.insertedId
      }
    });
  } catch (error) {
    console.error('Error checking for matches:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/matchmaking/create-match', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    console.log("Creating match for user:", userId);

    const matchData = req.body;
    const db = connect.db();

    await db.collection('matches').insertOne(matchData);

    await db.collection('matchPreferences').deleteMany({
      userId: { $in: [matchData.player1, matchData.player2] }
    });

    res.json({ success: true, match: matchData });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/matchmaking/leave-queue', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    console.log("User leaving queue:", userId);

    const db = connect.db();

    await db.collection('matchPreferences').deleteMany({ userId: userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving queue:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/matchmaking/user-matches', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    console.log("Getting matches for user:", userId);

    const db = connect.db();

    // Find matches where user is player1 or player2
    const matches = await db.collection('matches').find({
      $or: [
        { player1: userId },
        { player2: userId }
      ]
    }).sort({ createdAt: -1 }).toArray(); // Sort by newest first

    console.log(`Found ${matches.length} matches for user ${userId}`);

    res.json({ matches: matches });
  } catch (error) {
    console.error('Error getting user matches:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

app.get('/api/matchmaking/match/:matchId', jwtCheck, async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const db = connect.db();

    console.log("Looking for match with ID:", matchId);

    // Try to find by matchID field first, then by _id
    let match = await db.collection('matches').findOne({ matchID: matchId });
    
    if (!match) {
      // Try by ObjectId if it's a valid ObjectId
      try {
        match = await db.collection('matches').findOne({ _id: new ObjectId(matchId) });
      } catch (objectIdError) {
        // Not a valid ObjectId, that's fine
      }
    }

    if (!match) {
      console.log("Match not found");
      return res.status(404).json({ error: 'Match not found' });
    }

    console.log("Found match:", match);
    res.json({ match: match });
  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

app.get('/api/conversations', jwtCheck, async (req, res) => {
  try {
    const auth0ID = req.auth.payload?.sub;

    if (!auth0ID) {
      return res.status(400).json({ error: 'Auth0 ID not found in token' });
    }

    let db = connect.db();
    let user = await db.collection('users').findOne({ auth0Id: auth0ID });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let conversations = await db.collection('conversations').find({
      participants: { $in: [user._id] }
    }).toArray();

    console.log("Conversations found:", conversations);

    const enhancedConversations = await Promise.all(conversations.map(async (convo) => {
      const otherParticipantId = convo.participants.find(
        id => id.toString() !== user._id.toString()
      );

      const recipient = await db.collection('users').findOne({ _id: otherParticipantId });

      return {
        _id: convo._id,
        recipientId: otherParticipantId,
        recipientName: recipient ? recipient.name : 'Unknown User',
        lastMessage: convo.lastMessage || "",
        timestamp: convo.lastMessageDate || convo.createdAt || new Date(),
        profilePic: recipient ? recipient.profilePic : "https://www.dummyimage.com/40x40/000/fff",
        unread: convo.unread || false,
        sender: convo.sender || null,
      };
    }));

    res.json({ conversations: enhancedConversations });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

//Event Routes
app.get('/api/events', jwtCheck, async (req, res) => {
  try {
    const db = connect.db();

    const events = await db.collection('events').find({}).toArray();

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/events/create', jwtCheck, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;

    const { name, description, date, time, location } = req.body;

    if (!name || !date || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = connect.db();

    const event = {
      creatorId: userId,
      name,
      description,
      date,
      time,
      location,
      participants: [userId],
      createdAt: new Date()
    };

    const result = await db.collection('events').insertOne(event);

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

app.get('/api/events/:eventId', jwtCheck, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const db = connect.db();

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

app.post('/api/events/:eventId/join', jwtCheck, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.auth.payload.sub;

    const db = connect.db();

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

// FIXED: Chat routes
app.get('/api/chat/:conversationID', jwtCheck, async (req, res) => {
  try {
    const auth0ID = req.auth.payload?.sub;

    if (!auth0ID) {
      return res.status(400).json({ error: 'Auth0 ID not found in token' });
    }

    let db = connect.db();
    let user = await db.collection('users').findOne({ auth0Id: auth0ID });
    let conversationID;

    try {
      conversationID = new ObjectId(req.params.conversationID);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    let conversation = await db.collection('conversations').findOne({
      _id: conversationID
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    let recipientName = await db.collection('users').findOne({
      _id: { $in: conversation.participants.filter(id => id.toString() !== user._id.toString()) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let messages = await db.collection('messages').find({
      conversationID: conversationID
    }).toArray();

    const enhancedMessages = await Promise.all(messages.map(async (msg) => {
      const senderID = msg.senderID;
      const sender = await db.collection('users').findOne({ _id: new ObjectId(senderID) });

      let sentByUser = false;
      if (user._id.toString() == senderID.toString()) {
        sentByUser = true;
      }

      return {
        _id: msg._id,
        senderId: senderID,
        senderName: sender ? sender.name : 'Unknown User',
        message: msg.content,
        timestamp: msg.sentAt || new Date(),
        sentByUser: sentByUser,
        recipientName: recipientName ? recipientName.name : 'Unknown User',
        profilePic: sender.profilePic || "https://www.dummyimage.com/25x25/000/fff"
      }
    }));

    if (enhancedMessages.length === 0) {
      return res.json({
        recipientName: recipientName ? recipientName.name : 'Unknown User',
        messages: []
      });
    }

    res.json({ messages: enhancedMessages });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

app.post('/api/chat/send', jwtCheck, async (req, res) => {
  try {
    const auth0ID = req.auth.payload?.sub;

    if (!auth0ID) {
      return res.status(400).json({ error: 'Auth0 ID not found in token' });
    }

    let db = connect.db();
    let user = await db.collection('users').findOne({ auth0Id: auth0ID });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { conversationID, message } = req.body;

    if (!conversationID || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const msg = {
      conversationID: new ObjectId(conversationID),
      senderID: user._id,
      content: message,
      sentAt: new Date()
    };

    const result = await db.collection('messages').insertOne(msg);

    res.status(201).json({
      success: true,
      _id: result.insertedId,
      timestamp: msg.sentAt
    });

    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationID) },
      {
        $set: {
          lastMessage: message,
          lastMessageDate: new Date(),
          sender: user._id,
          unread: true,
        }
      });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/search', jwtCheck, async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    const db = connect.db();
    
    const searchPattern = new RegExp(`^${searchQuery}`, 'i');
    
    const currentUser = await db.collection('users').findOne({ auth0Id: req.auth.payload.sub });
    const query = { name: searchPattern };

    if (currentUser) {
      query._id = { $ne: currentUser._id };
    }

    const users = await db.collection('users')
      .find(query)
      .project({
        _id: 1,
        name: 1,
        profilePic: 1,
      })
      .limit(5)
      .toArray();

    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// FIXED: Conversation creation route
app.post('/api/conversations/create', jwtCheck, async (req, res) => {
  try {
    const auth0ID = req.auth.payload?.sub;
    const { recipientId } = req.body;

    if (!auth0ID) {
      return res.status(400).json({ error: 'Auth0 ID not found in token' });
    }

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    let db = connect.db();
    let currentUser = await db.collection('users').findOne({ auth0Id: auth0ID });

    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // FIXED: Proper ObjectId conversion with error handling
    let recipientObjectId;
    try {
      recipientObjectId = new ObjectId(recipientId);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid recipient ID format' });
    }

    // Check if recipient exists
    const recipient = await db.collection('users').findOne({ _id: recipientObjectId });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // FIXED: Improved duplicate check
    const existingConversation = await db.collection('conversations').findOne({
      $and: [
        { participants: currentUser._id },
        { participants: recipientObjectId }
      ]
    });

    if (existingConversation) {
      return res.json({
        conversationId: existingConversation._id,
        isNew: false
      });
    }

    // Create a new conversation
    const newConversation = {
      participants: [currentUser._id, recipientObjectId],
      createdAt: new Date(),
      lastMessage: '',
      lastMessageDate: new Date(),
      unread: false
    };

    const result = await db.collection('conversations').insertOne(newConversation);

    res.status(201).json({
      conversationId: result.insertedId,
      isNew: true
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// FIXED: Betting routes
app.post('/api/bets/makePool', jwtCheck, async (req, res) => {
  try {
    const { team1Name, team2Name } = req.body;
    const db = connect.db();

    const insertData = {
      team1Name: team1Name,
      team2Name: team2Name,
      team1Betters: [],
      team2Betters: [],
      pot: 0,
      timestamp: new Date()
    }

    const insertResults = await db.collection('bets').insertOne(insertData);

    res.json({ success: true, bettingId: insertResults.insertedId })

  } catch (error) {
    console.error("Error:", error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
})

// FIXED: Variable name bug and logic
app.post('/api/bets/makeBet/:betId', jwtCheck, async (req, res) => {
  try {
    const { userId, name, betAmount, teamToBet } = req.body; // FIXED: Consistent variable name
    const betId = req.params.betId;
    const db = connect.db();

    const insertData = {
      userId: userId,
      bet: betAmount,
      name: name
    }

    if (teamToBet == 1) { // FIXED: Use correct variable name
      const result = await db.collection('bets').updateOne(
        { _id: new ObjectId(betId) },
        {
          $addToSet: {
            team1Betters: insertData
          },
          $inc: {
            pot: betAmount
          }
        }
      )
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Betting pool not found' });
      }

      return res.json({ success: true })
    } else if (teamToBet == 2) { // FIXED: Use correct variable name
      const result = await db.collection('bets').updateOne(
        { _id: new ObjectId(betId) },
        {
          $addToSet: {
            team2Betters: insertData
          },
          $inc: {
            pot: betAmount
          }
        }
      )
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Betting pool not found' });
      }
      return res.json({ success: true })
    } else {
      return res.status(400).json({ error: 'Invalid team selection' });
    }

  } catch (error) {
    console.error("Error:", error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
})

// FIXED: Missing database connection
app.get('/api/bets/bettingDetails/:betId', jwtCheck, async (req, res) => {
  try {
    const betId = req.params.betId
    const db = connect.db(); // FIXED: Missing database connection

    let bet = await db.collection('bets').findOne({ _id: new ObjectId(betId) });

    if (!bet) {
      return res.status(404).json({ success: false, error: "Betting pool not found" })
    }

    let team1Pool = 0;
    let team1Names = []
    for (let i = 0; i < bet.team1Betters.length; i++) {
      team1Names.push(bet.team1Betters[i].name);
      team1Pool += bet.team1Betters[i].bet;
    }
    let team2Pool = 0;
    let team2Names = [];
    for (let i = 0; i < bet.team2Betters.length; i++) {
      team2Names.push(bet.team2Betters[i].name);
      team2Pool += bet.team2Betters[i].bet;
    }

    const toSend = {
      team1Name: bet.team1Name,
      team2Name: bet.team2Name,
      team1Betters: team1Names,
      team2Betters: team2Names,
      team1Pool: team1Pool,
      team2Pool: team2Pool,
      team1Odds: team1Pool > 0 ? ((bet.pot / team1Pool) * 100) : 0,
      team2Odds: team2Pool > 0 ? ((bet.pot / team2Pool) * 100) : 0
    }

    res.json({ success: true, data: toSend })

  } catch (error) {
    console.error("Error:", error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
})

// Mark conversation as read
app.put('/api/conversations/:conversationID/read', jwtCheck, async (req, res) => {
  try {
    const auth0ID = req.auth.payload?.sub;
    const conversationID = req.params.conversationID;

    if (!auth0ID) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let db = connect.db();
    let user = await db.collection('users').findOne({ auth0Id: auth0ID });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await db.collection('conversations').updateOne(
      {
        _id: new ObjectId(conversationID),
        participants: { $in: [user._id] },
        sender: { $ne: user._id }
      },
      {
        $set: {
          unread: false,
        }
      }
    );

    res.json({ success: true, modified: result.modifiedCount > 0 });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
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