const express = require('express');
const router = express.Router();
const resourceController = require('../controller/ResourceController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');

const canManageResources = requireRole(['admin', 'educator', 'moderator']);

router.get('/', authenticate, resourceController.getResources);
router.post('/', authenticate, canManageResources, resourceController.createResource);

module.exports = router;
