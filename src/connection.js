// require('dotenv').config();
import dotenv from 'dotenv'
dotenv.config;
// const MongoClient = require("mongodb").MongoClient;
// import MongoClient from 'mongodb'


const DB = process.env.REACT_APP_ATLAS_URI;
const client = new MongoClient(DB);

export default client

