const { GoogleGenAI } = require("@google/genai");
require('dotenv').config({path: "./config.env"});

const ai = new GoogleGenAI({ apiKey: process.env.AI_URI });

/**
 * Generate a loading screen quote for when the user is looking for a match
 * @param {String} sport - What sport to generate the quote for
 * @param {String} context - What type of quote you want, e.x fun fact, tip, statistic
 * @returns {Promise<Object|null>} Match object or null if no match found
 */
async function getLoadingQuote(sport, context) {

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Give me a true one line ${context} about ${sport}`,
  });
  return response.text
}


async function main() {
  x = await getLoadingQuote('tennis','tip')
  console.log(x);
}


module.exports = {
  getLoadingQuote: getLoadingQuote()
}
