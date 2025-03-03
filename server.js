const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Multer setup for handling image uploads
const upload = multer({ storage: multer.memoryStorage() });

// Standard chatbot responses (Only greetings, not answers)
const responses = {
  "hello": "Hi there! How can I help you?",
  "hallo": "Hi there! How can I help you?",
  "halo": "Hi there! How can I help you?",
  "helo": "Hi there! How can I help you?",
  "your name": "Chat Bot",
  "hi": "Hello! Ask me anything.",
  "how are you": "I'm just a bot, but I'm doing great!",
  "bye": "Goodbye! Have a nice day!",
  "hai": "Hai! How can I help you?"
};

// Google Search API Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

// Function to fetch an answer from Google Search
async function fetchAnswerFromGoogle(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}`;
    const response = await axios.get(url);

    if (response.data.items && response.data.items.length > 0) {
      for (let item of response.data.items) {
        if (item.snippet && item.snippet.length > 30) {
          return item.snippet; // Return the best meaningful snippet
        }
      }
    }
    return "I couldn't find a clear answer. Try searching on Google.";
  } catch (error) {
    console.error("Google Search API Error:", error);
    return "I couldn't fetch an answer right now. Please try again later!";
  }
}

// Function to fetch image results from Google Search
async function fetchImageFromGoogle(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&searchType=image&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}`;
    const response = await axios.get(url);

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].link; // Return the first image result
    }
    return "No relevant images found.";
  } catch (error) {
    console.error("Google Image Search API Error:", error);
    return "I couldn't fetch an image right now. Please try again later!";
  }
}

app.post("/chat", async (req, res) => {
  console.log(req.body);
  const userMessage = req.body.message.toLowerCase().trim();

  // Check if it's a greeting (predefined response)
  if (responses[userMessage]) {
    return res.json({ response: responses[userMessage] });
  }

  const botResponse = await fetchAnswerFromGoogle(userMessage);
  return res.json({ response: botResponse });
});

// Image search route
app.post("/image-search", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required for image search." });

  const imageUrl = await fetchImageFromGoogle(query);
  return res.json({ image: imageUrl });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
