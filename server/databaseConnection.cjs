/**
 * Code based on MERN Tutorial: Ep 2 - MongoDB & Node Setup with Vite
 * @author Austin Davis
 * @see https://www.youtube.com/watch?v=CE1H4t8t2yY
 */
const {MongoClient} = require('mongodb');
require('dotenv').config({path: "./config.env"});

const client = new MongoClient(process.env.ATLAS_URI, {});

let database

module.exports = {
  connect: () => {
    database = client.db('playpal')
  },

  db: () => {
    return database
  }
}

