// backend/src/router/MLAnalysisRoutes.js
const express = require('express');
const router = express.Router();
const MLAnalysisController = require('../controller/MLAnalysisController');
const { authenticate } = require('../middleware/AuthMiddleware');

/**
 * Role-based access control middleware
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (req.user && allowedRoles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({
            message: 'Access denied: You do not have the required permissions.'
        });
    };
};

// All routes require authentication
router.use(authenticate);

// ===== Facilitator Routes =====
// Only educators, moderators, and admins can access ML analysis results
const facilitatorRoles = ['educator', 'moderator', 'admin'];

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
