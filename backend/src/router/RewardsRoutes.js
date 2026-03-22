const express = require('express');
const router = express.Router();
const rewardsController = require('../controller/RewardsController');
const { authenticate } = require('../middleware/AuthMiddleware');

// All routes require authentication
router.use(authenticate);

// ===== Student Routes =====
// Get all available rewards for the shop
router.get('/available', rewardsController.getAvailableRewards);

// Get user's claimed rewards inventory
router.get('/my-inventory', rewardsController.getMyInventory);

// Claim a reward (trade XP)
router.post('/claim/:id', rewardsController.claimReward);

// ===== Admin/Facilitator Routes =====
// Get ALL rewards (including inactive) for management
router.get('/all', rewardsController.getAllRewardsForAdmin);

// Create a new reward
router.post('/', rewardsController.createReward);

// Update a reward
router.put('/:id', rewardsController.updateReward);

// Delete a reward
router.delete('/:id', rewardsController.deleteReward);

module.exports = router;
