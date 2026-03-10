// backend/src/controller/MLAnalysisController.js
const mlAnalysisService = require('../services/MLAnalysisService');

class MLAnalysisController {
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
