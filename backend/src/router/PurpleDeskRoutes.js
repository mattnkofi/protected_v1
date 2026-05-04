const express = require('express');
const router = express.Router();
const purpleDeskController = require('../controller/PurpleDeskController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');

const canSubmit = requireRole(['player', 'educator', 'moderator']);
const isAdmin = requireRole(['admin', 'moderator']);

router.post('/reports', authenticate, canSubmit, purpleDeskController.submitReport);
router.get('/reports/status/:tracking_code', authenticate, purpleDeskController.getReportStatus);
router.get('/reports', authenticate, isAdmin, purpleDeskController.getReports);
router.put('/reports/:id/status', authenticate, isAdmin, purpleDeskController.updateReportStatus);

module.exports = router;
