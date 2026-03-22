const express = require('express');
const router = express.Router();
const badgeController = require('../controller/badgeController');
const { authenticate } = require('../middleware/AuthMiddleware');

// Lahat ng routes dito ay kailangan ng login
router.use(authenticate);

// 1. Para sa Student: Kunin ang sariling inventory (mga na-claim na)
router.get('/my-inventory', badgeController.getMyInventory);

// 2. Para sa Student/Lahat: Kunin ang listahan ng available rewards sa store
router.get('/store', badgeController.getAllRewards);

// 3. Para sa Student: I-claim ang isang reward slot (Trade XP)
router.post('/claim', badgeController.claimReward);

// 4. Facilitator CRUD
router.post('/', badgeController.createReward);
router.put('/:id', badgeController.toggleRewardSlot);
router.delete('/:id', badgeController.deleteReward);

module.exports = router;