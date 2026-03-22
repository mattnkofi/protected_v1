const express = require('express');
const router = express.Router();
const chatbotController = require('../controller/ChatbotController');

// Main chat endpoint
router.post('/ask', chatbotController.askChatbot);

// Get quick suggestions by topic
router.get('/suggestions', chatbotController.getSuggestions);

// Get emergency resources and hotlines
router.get('/resources', chatbotController.getResources);

module.exports = router;