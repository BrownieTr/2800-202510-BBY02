/**
 * I based this file on the code from MERN Tutorial: Ep 3 - Setting Up Express on youtube
 * @author Austin Davis
 * @see https://www.youtube.com/watch?v=lWM_8Zq9tUc&t=305s
 * 
 * As well as 
 */
require('dotenv').config({path: "./config.env"});
const connect = require('./databaseConnection.cjs')
import { calculateDistance } from '../src/services/locationService';
const express = require('express');
const session = require('express-session')
const cors = require('cors');
const app = express();
const MongoStore = require('connect-mongo');
const PORT = process.env.PORT || 3000;
const mongoSecret = process.env.MONGO_SECRET || '123ase45'
const nodeSecret = process.env.NODE_SECRET || 'aosijf1safd'
// Auth0
const { auth } = require('express-oauth2-jwt-bearer');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + "/public"));


/**
 * Session handling is from 2537 example code
 * @author Patrick Guichon
 */
var mongoStore = MongoStore.create({
  mongoUrl: process.env.ATLAS_URI,
  crypto: {
    secret: mongoSecret
  }
})

app.use(session({ 
    secret: nodeSecret,
  store: mongoStore, //default is memory store 
  saveUninitialized: false, 
  resave: true
}
));

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

// Functionality in test, will continue when authentication is implemented
app.get('/profile', async (req, res) => {
  let db = connect.db();
  if (req.session.authenticated) {
    let data = await db.collection('users').find({email: email})
                .project({name: 1 , email: 1, address: 1, country: 1, preferences: 1}).toArray();
    res.send(data);
  } else {
    res.redirect("/")
  }
});

// Matchmaking Routes

// Save match preferences
app.post('/api/matchmaking/save-preferences', async (req, res) => {
  // Make sure user is logged in
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  try {
    const userId = req.session.userId;
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
app.get('/api/matchmaking/check-for-match', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  try {
    const userId = req.session.userId;
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
    
    // Get user details
    // const user1 = await db.collection('users').findOne({ _id: userId });
    // const user2 = await db.collection('users').findOne({ _id: potentialMatch.userId });

    //Not sure why the abovecode is calling the database again, but if there is a reason, it's left up there. 
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
app.post('/api/matchmaking/create-match', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  try {
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
app.post('/api/matchmaking/leave-queue', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  try {
    const userId = req.session.userId;
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
app.get('/api/matchmaking/user-matches', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  try {
    const userId = req.session.userId;
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
app.get('/api/matchmaking/match/:matchId', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
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

app.get('*', (req,res) => {
  res.status(404);
  res.send("Requested route does not exist");
});

app.listen(PORT, () => {
  connect.connect();
  console.log('server is running on port ' + PORT);
});