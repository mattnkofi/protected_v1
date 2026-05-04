const express = require('express');
const router = express.Router();
const resourceController = require('../controller/ResourceController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');

const canCreate = requireRole(['admin', 'educator', 'moderator']);

router.get('/', authenticate, resourceController.getResources);
router.post('/', authenticate, canCreate, resourceController.createResource);

router.get('/recommended', authenticate, resourceController.getRecommendedResources);
router.post('/recommended/dismiss', authenticate, resourceController.dismissRecommendedResourceByKey);
router.post('/recommended/:resourceId/dismiss', authenticate, resourceController.dismissRecommendedResource);

module.exports = router;
