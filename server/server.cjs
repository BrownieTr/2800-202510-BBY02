/**
 * I based this file on the code from MERN Tutorial: Ep 3 - Setting Up Express on youtube
 * @author Austin Davis
 * @see https://www.youtube.com/watch?v=lWM_8Zq9tUc&t=305s
 * 
 * As well as 
 */
require('dotenv').config({path: "./config.env"});
const connect = require('./databaseConnection.cjs')
const express = require('express');
const session = require('express-session')
const cors = require('cors');
const app = express();
const MongoStore = require('connect-mongo');
const PORT = process.env.PORT || 3000;
const mongoSecret = process.env.MONGO_SECRET || '123ase45'
const nodeSecret = process.env.NODE_SECRET || 'aosijf1safd'
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

app.get('*', (req,res) => {
  res.status(404);
  res.send("Requested route does not exist");
})

app.listen(PORT, () => {
  connect.connect();
  console.log('server is running on port ' + PORT);
})