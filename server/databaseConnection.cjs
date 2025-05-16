const {MongoClient} = require('mongodb');

/**
 * You'll have to make your own config.env file in this folder, looking like this:
 * ATLAS_URI=<connection_string>
 * 
 * with connection_string looking something like this: mongodb+srv://<username>:<password>@playpal.bv02d2k.mongodb.net/
 */
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

