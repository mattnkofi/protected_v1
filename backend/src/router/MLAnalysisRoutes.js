// backend/src/router/MLAnalysisRoutes.js
const express = require('express');
const router = express.Router();
const MLAnalysisController = require('../controller/MLAnalysisController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');

// All routes require authentication
router.use(authenticate);

// ===== Facilitator Routes =====
// Only educators, moderators, and admins can access ML analysis results
const facilitatorRoles = ['educator', 'moderator', 'admin'];

// ===== Learner Assessment Routes =====
router.get(
    '/assessment/questionnaire',
    requireRole(['player']),
    MLAnalysisController.getAssessmentQuestionnaire
);

router.post(
    '/assessment/submit',
    requireRole(['player']),
    MLAnalysisController.submitAssessment
);

router.get(
    '/assessment/latest',
    requireRole(['player']),
    MLAnalysisController.getLatestAssessmentAnalysis
);

// Get aggregated stats for facilitator dashboard
router.get(
    '/facilitator/stats',
    requireRole(facilitatorRoles),
    MLAnalysisController.getFacilitatorStats
);

// Get paginated list of all analysis results for facilitator's students 
router.get(
    '/facilitator/results',
    requireRole(facilitatorRoles),
    MLAnalysisController.getFacilitatorResults
);

// Get detailed single analysis result
router.get(
    '/:id',
    requireRole(facilitatorRoles),
    MLAnalysisController.getResultDetail
);

// Mark analysis as reviewed with optional notes
router.patch(
    '/:id/review',
    requireRole(facilitatorRoles),
    MLAnalysisController.markReviewed
);

module.exports = router;
