const express = require('express');
const router = express.Router();
const purpleDeskController = require('../controller/PurpleDeskController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');

const isAdmin = requireRole(['admin', 'moderator']);

// Submit report (students + facilitators)
const canSubmitReport = requireRole(['player', 'educator', 'moderator']);
router.post('/reports', authenticate, canSubmitReport, purpleDeskController.submitReport);

// Public: Check status
router.get('/reports/status/:tracking_code', purpleDeskController.getReportStatus);

// Admin: List reports and update status
router.get('/reports', authenticate, isAdmin, purpleDeskController.getReports);
router.put('/reports/:report_id/status', authenticate, isAdmin, purpleDeskController.updateReportStatus);

module.exports = router;
