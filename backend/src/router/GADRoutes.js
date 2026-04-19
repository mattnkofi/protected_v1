// backend/src/router/GADRoutes.js
const express = require('express');
const router = express.Router();
const gadController = require('../controller/GADController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');
const { upload } = require('../middleware/FileUploadMiddleware');

// ==========================================
// Public Routes (Any authenticated user)
// ==========================================

// Get all campuses
router.get('/campuses', authenticate, gadController.getCampuses);

// Get all active scoring criteria
router.get('/scoring-criteria', authenticate, gadController.getScoringCriteria);

// Analyze text for gender-fair language
router.post('/analyze-language', authenticate, gadController.analyzeGenderFairLanguage);

// ==========================================
// Proposal Routes (User/Facilitator)
// ==========================================

// User: Submit a new GAD proposal
router.post('/proposals/submit', authenticate, gadController.submitProposal);

// Get all proposals (with filtering by campus, status, search)
router.get('/proposals', authenticate, gadController.getAllProposals);

// Get specific proposal details with scoring history
router.get('/proposals/:proposal_id', authenticate, gadController.getProposalDetails);

// Facilitator: Upload HGDG or supporting document
router.post('/proposals/:proposal_id/upload-document', authenticate, 
    upload.single('document'),
    gadController.uploadProposalDocument
);

// Admin: Download/view proposal document
router.get('/proposals/:proposal_id/download-document', authenticate, 
    gadController.downloadProposalDocument
);

// ==========================================
// Admin Routes
// ==========================================

const isAdmin = requireRole(['admin', 'moderator']);

// Admin: Create a new campus
router.post('/campuses', authenticate, isAdmin, gadController.createCampus);

// Admin: Review proposal (add feedback and scores)
router.put('/proposals/:proposal_id/review', authenticate, isAdmin, gadController.reviewProposal);

// Admin: Update proposal status (no scoring required)
router.put('/proposals/:proposal_id/status', authenticate, isAdmin, gadController.updateProposalStatus);

// Admin: Create new scoring criteria
router.post('/scoring-criteria', authenticate, isAdmin, gadController.createScoringCriteria);

// Admin: Get dashboard statistics
router.get('/dashboard/stats', authenticate, isAdmin, gadController.getDashboardStats);

// ==========================================
// Comment Routes (Admin: write, Facilitator: read)
// ==========================================

// Get all comments for a proposal (Any authenticated user can read)
router.get('/proposals/:proposal_id/comments', authenticate, gadController.getProposalComments);

// Admin: Add comment to a proposal
router.post('/proposals/:proposal_id/comments', authenticate, isAdmin, gadController.addProposalComment);

// Admin: Delete their own comment
router.delete('/comments/:comment_id', authenticate, isAdmin, gadController.deleteProposalComment);

module.exports = router;
