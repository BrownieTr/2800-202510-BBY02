const {MongoClient} = require('mongodb');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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

