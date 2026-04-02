// backend/src/controller/MLAnalysisController.js
const mlAnalysisService = require('../services/MLAnalysisService');
const riskAssessmentService = require('../services/RiskAssessmentService');

class MLAnalysisController {
    /**
     * GET /api/v1/ml-analysis/assessment/questionnaire
     * Fetch dedicated behavioral-risk questionnaire for learners.
     */
    async getAssessmentQuestionnaire(req, res) {
        try {
            const assessment = await riskAssessmentService.getQuestionnaire();

            return res.status(200).json({
                success: true,
                assessment
            });
        } catch (error) {
            console.error('MLAnalysisController.getAssessmentQuestionnaire error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/v1/ml-analysis/assessment/submit
     * Submit dedicated behavioral-risk questionnaire for ML analysis.
     */
    async submitAssessment(req, res) {
        try {
            const userId = req.user.id;
            const result = await riskAssessmentService.submitAssessment(userId, req.body);

            return res.status(200).json({
                success: true,
                message: 'Assessment submitted and analyzed successfully',
                data: result
            });
        } catch (error) {
            console.error('MLAnalysisController.submitAssessment error:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/ml-analysis/assessment/latest
     * Fetch latest ML analysis result for the dedicated behavioral assessment.
     */
    async getLatestAssessmentAnalysis(req, res) {
        try {
            const userId = req.user.id;
            const analysis = await riskAssessmentService.getLatestAssessmentAnalysis(userId);

            return res.status(200).json({
                success: true,
                analysis
            });
        } catch (error) {
            console.error('MLAnalysisController.getLatestAssessmentAnalysis error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/ml-analysis/facilitator/results
     * Facilitators view all ML analysis results for their students
     */
    async getFacilitatorResults(req, res) {
        try {
            const facilitatorId = req.user.id;
            const { page, limit, riskLevel, flaggedOnly, quizId, reviewed } = req.query;

            const data = await mlAnalysisService.getResultsForFacilitator(facilitatorId, {
                page: page || 1,
                limit: limit || 20,
                riskLevel,
                flaggedOnly,
                quizId,
                reviewed
            });

            return res.status(200).json({
                success: true,
                ...data
            });
        } catch (error) {
            console.error('MLAnalysisController.getFacilitatorResults error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/ml-analysis/facilitator/stats
     * Facilitator dashboard statistics
     */
    async getFacilitatorStats(req, res) {
        try {
            const facilitatorId = req.user.id;
            const stats = await mlAnalysisService.getStatsForFacilitator(facilitatorId);

            return res.status(200).json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('MLAnalysisController.getFacilitatorStats error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/ml-analysis/:id
     * Get detailed analysis result by ID
     */
    async getResultDetail(req, res) {
        try {
            const result = await mlAnalysisService.getResultById(req.params.id);

            return res.status(200).json({
                success: true,
                result
            });
        } catch (error) {
            console.error('MLAnalysisController.getResultDetail error:', error);
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    /**
     * PATCH /api/v1/ml-analysis/:id/review
     * Mark an analysis result as reviewed and optionally add notes
     */
    async markReviewed(req, res) {
        try {
            const resultId = req.params.id;
            const facilitatorId = req.user.id;
            const { notes } = req.body;

            const result = await mlAnalysisService.markAsReviewed(resultId, facilitatorId, notes);

            return res.status(200).json({
                success: true,
                message: 'Analysis marked as reviewed',
                result
            });
        } catch (error) {
            console.error('MLAnalysisController.markReviewed error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new MLAnalysisController();
