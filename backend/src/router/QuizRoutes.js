// backend/src/router/QuizRoutes.js
const express = require('express');
const router = express.Router();
const QuizController = require('../controller/QuizController');
const { authenticate } = require('../middleware/AuthMiddleware');

/**
 * Middleware para sa Role-based Access Control
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

// ===== Authenticated Routes Middleware =====
router.use(authenticate);

// ===== Gamification/Shared Routes =====
/** * IMPORTANT: Ilagay ito sa itaas ng /:id routes para hindi ito 
 * mapagkamalan na isang ID parameter (404 fix).
 */
router.get('/gamification/leaderboard', QuizController.getLeaderboard);

// Lahat ng authenticated users (Player, Educator, Admin) ay pwedeng makita ang quiz info
router.get('/module/:moduleId', QuizController.getByModule);
router.get('/:id/check-attempt', QuizController.checkUserAttempt);
router.get('/:id', QuizController.getQuizById);

// ===== Student Specific Routes =====
// Tanging 'player' lamang ang pwedeng mag-submit ng quiz results
router.post('/:id/submit', requireRole('player'), QuizController.submitResults);

// ===== Facilitator/Admin Specific Routes =====
router.post(
    '/', 
    requireRole(['admin', 'educator', 'moderator']), 
    QuizController.createQuiz
);

module.exports = router;