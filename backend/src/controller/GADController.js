// backend/src/controller/GADController.js
const { GADProposal, GADScoringCriteria, GADScore, GADProposalComment, User, Campus, Sequelize, Notification } = require('../model');
const GenderFairLanguageService = require('../services/GenderFairLanguageService');
const FileStorageService = require('../services/FileStorageService');
const EmailService = require('../services/EmailService');
const { Op } = require('sequelize');

// Helper function to format status
const formatStatus = (status) => {
    const statusMap = {
        'submitted': 'Submitted',
        'under_review': 'Under Review',
        'rejected_with_feedback': 'Needs Revision',
        'revised': 'Revised',
        'approved': 'Approved',
        'approved_final': 'Approved (Final)'
    };
    return statusMap[status] || status;
};

class GADController {
    /**
     * Get all campuses
     */
    async getCampuses(req, res, next) {
        try {
            const campuses = await Campus.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });

            return res.status(200).json({
                success: true,
                campuses
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new campus (Admin only)
     */
    async createCampus(req, res, next) {
        try {
            const { name, code, location } = req.body;

            if (!name || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Campus name and code are required'
                });
            }

            const existingCampus = await Campus.findOne({
                where: {
                    [Op.or]: [{ name }, { code }]
                }
            });

            if (existingCampus) {
                return res.status(409).json({
                    success: false,
                    message: 'Campus with this name or code already exists'
                });
            }

            const campus = await Campus.create({
                name,
                code,
                location,
                is_active: true
            });

            return res.status(201).json({
                success: true,
                message: 'Campus created successfully',
                campus
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Analyze text for gender-fair language issues
     */
    async analyzeGenderFairLanguage(req, res, next) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({
                    success: false,
                    message: 'Text is required for analysis'
                });
            }

            const analysis = GenderFairLanguageService.analyzeText(text);
            const suggestions = GenderFairLanguageService.getSuggestions(analysis.issues);

            return res.status(200).json({
                success: true,
                analysis,
                suggestions
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * User/Facilitator: Submit a GAD proposal
     */
    async submitProposal(req, res, next) {
        try {
            const userId = req.user.id;
            const { title, description, campus_id } = req.body;

            // Validate required fields
            if (!title || !description || !campus_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, description, and campus_id are required'
                });
            }

            // Verify campus exists
            const campus = await Campus.findByPk(campus_id);
            if (!campus) {
                return res.status(404).json({
                    success: false,
                    message: 'Campus not found'
                });
            }

            // Analyze proposal for gender-fair language
            const gflAnalysis = GenderFairLanguageService.analyzeText(description);

            // Create proposal
            const proposal = await GADProposal.create({
                user_id: userId,
                campus_id,
                title,
                description,
                gfl_issues: gflAnalysis.issues.length > 0 ? gflAnalysis : null,
                status: 'submitted'
            });

            return res.status(201).json({
                success: true,
                message: 'Proposal submitted successfully. Please review the GFL analysis and provide feedback.',
                proposal,
                gflAnalysis: {
                    totalIssues: gflAnalysis.totalIssues,
                    gflScore: gflAnalysis.gflScore,
                    summary: gflAnalysis.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin: Review and provide feedback on a proposal
     */
    async reviewProposal(req, res, next) {
        try {
            const { proposal_id } = req.params;
            const { admin_feedback, status, scores } = req.body;
            const adminId = req.user.id;

            // === VALIDATION ===
            if (!proposal_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Proposal ID is required'
                });
            }

            // Check proposal exists
            const proposal = await GADProposal.findByPk(proposal_id);
            if (!proposal) {
                return res.status(404).json({
                    success: false,
                    message: 'Proposal not found'
                });
            }

            // Validate status
            const validStatuses = ['submitted', 'under_review', 'rejected_with_feedback', 'revised', 'approved', 'approved_final'];
            const newStatus = status || 'under_review';
            
            if (!validStatuses.includes(newStatus)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            // Require feedback for rejection
            if (newStatus === 'rejected_with_feedback' && (!admin_feedback || admin_feedback.trim().length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin feedback is required when marking proposal as "Needs Revision"'
                });
            }

            // Validate scores
            if (scores && Array.isArray(scores)) {
                const criteria = await GADScoringCriteria.findAll();
                const criteriaMap = new Map(criteria.map(c => [c.id, c]));

                for (const score of scores) {
                    // Check criteria exists
                    if (!criteriaMap.has(score.criteria_id)) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid criteria ID: ${score.criteria_id}`
                        });
                    }

                    const criterion = criteriaMap.get(score.criteria_id);
                    
                    // Validate points awarded
                    if (typeof score.points_awarded !== 'number' || score.points_awarded < 0) {
                        return res.status(400).json({
                            success: false,
                            message: `Points for ${criterion.name} must be a non-negative number`
                        });
                    }

                    // Ensure points don't exceed max
                    if (score.points_awarded > criterion.max_points) {
                        return res.status(400).json({
                            success: false,
                            message: `Points for "${criterion.name}" cannot exceed ${criterion.max_points} (received: ${score.points_awarded})`
                        });
                    }

                    // Validate comment if provided
                    if (score.comment && typeof score.comment !== 'string') {
                        return res.status(400).json({
                            success: false,
                            message: `Comment for "${criterion.name}" must be a string`
                        });
                    }
                }
            } else if (!scores || scores.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one scoring criterion is required'
                });
            }

            // === UPDATE PROPOSAL ===
            await proposal.update({
                status: newStatus,
                admin_feedback: admin_feedback || null,
                reviewed_by: adminId,
                reviewed_date: new Date()
            });

            // === SAVE SCORES ===
            // Remove existing scores for this proposal (to allow re-review)
            await GADScore.destroy({
                where: { proposal_id }
            });

            // Save new scores
            let totalScore = 0;
            let maxScore = 0;
            
            if (scores && Array.isArray(scores)) {
                for (const score of scores) {
                    await GADScore.create({
                        proposal_id,
                        criteria_id: score.criteria_id,
                        scored_by: adminId,
                        points_awarded: score.points_awarded,
                        evaluator_comment: score.comment || null
                    });
                    
                    totalScore += score.points_awarded;
                }
                
                // Calculate max score
                const criteria = await GADScoringCriteria.findAll();
                maxScore = criteria.reduce((sum, c) => sum + c.max_points, 0);
            }

            // === SEND NOTIFICATION ===
            try {
                const facilitator = await User.findByPk(proposal.created_by);
                if (facilitator) {
                    const statusMessage = {
                        'approved': 'Your GAD proposal has been approved! 🎉',
                        'approved_final': 'Your GAD proposal has been approved (final review)! 🎉',
                        'rejected_with_feedback': 'Your GAD proposal needs revision. Please review the feedback and resubmit.',
                        'under_review': 'Your GAD proposal is being reviewed.',
                        'revised': 'Thank you for revising your proposal. It is now under review.'
                    };

                    await Notification.create({
                        user_id: facilitator.id,
                        title: `GAD Proposal Review: ${formatStatus(newStatus)}`,
                        message: statusMessage[newStatus] || 'Your GAD proposal has been reviewed.',
                        type: 'gad_review',
                        related_id: proposal_id,
                        is_read: false
                    });

                    // Send email notification
                    try {
                        await EmailService.sendGADProposalReviewEmail(
                            facilitator,
                            proposal,
                            newStatus,
                            admin_feedback || null,
                            {
                                total_score: totalScore,
                                max_score: maxScore
                            }
                        );
                    } catch (emailError) {
                        console.error('Failed to send email notification:', emailError);
                        // Don't fail the review if email fails
                    }
                }
            } catch (notifyError) {
                console.error('Failed to send notification:', notifyError);
                // Don't fail the review if notification fails
            }

            return res.status(200).json({
                success: true,
                message: 'Proposal reviewed successfully',
                proposal: {
                    ...proposal.toJSON(),
                    total_score: totalScore,
                    max_score: maxScore,
                    score_percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin: Update proposal status without scoring
     */
    async updateProposalStatus(req, res, next) {
        try {
            const { proposal_id } = req.params;
            const { status, admin_feedback } = req.body;
            const adminId = req.user.id;

            if (!proposal_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Proposal ID is required'
                });
            }

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['submitted', 'under_review', 'rejected_with_feedback', 'revised', 'approved', 'approved_final'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            if (status === 'rejected_with_feedback' && (!admin_feedback || admin_feedback.trim().length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin feedback is required when marking proposal as "Needs Revision"'
                });
            }

            const proposal = await GADProposal.findByPk(proposal_id);
            if (!proposal) {
                return res.status(404).json({
                    success: false,
                    message: 'Proposal not found'
                });
            }

            await proposal.update({
                status,
                admin_feedback: admin_feedback || null,
                reviewed_by: adminId,
                reviewed_date: new Date()
            });

            try {
                const facilitatorId = proposal.created_by || proposal.user_id;
                const facilitator = await User.findByPk(facilitatorId);

                if (facilitator) {
                    const statusMessage = {
                        'approved': 'Your GAD proposal has been approved! 🎉',
                        'approved_final': 'Your GAD proposal has been approved (final review)! 🎉',
                        'rejected_with_feedback': 'Your GAD proposal needs revision. Please review the feedback and resubmit.',
                        'under_review': 'Your GAD proposal is being reviewed.',
                        'revised': 'Thank you for revising your proposal. It is now under review.'
                    };

                    await Notification.create({
                        user_id: facilitator.id,
                        title: `GAD Proposal Update: ${formatStatus(status)}`,
                        message: statusMessage[status] || 'Your GAD proposal status has been updated.',
                        type: 'gad_review',
                        related_id: proposal_id,
                        is_read: false
                    });

                    try {
                        await EmailService.sendGADProposalReviewEmail(
                            facilitator,
                            proposal,
                            status,
                            admin_feedback || null,
                            null
                        );
                    } catch (emailError) {
                        console.error('Failed to send email notification:', emailError);
                    }
                }
            } catch (notifyError) {
                console.error('Failed to send notification:', notifyError);
            }

            return res.status(200).json({
                success: true,
                message: 'Proposal status updated successfully',
                proposal: proposal.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Facilitator: Upload HGDG or supporting document
     */
    async uploadProposalDocument(req, res, next) {
        try {
            const { proposal_id } = req.params;
            const userId = req.user.id;
            
            if (!proposal_id || !req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Proposal ID and document file are required'
                });
            }

            console.log('🔄 Starting file upload for proposal:', proposal_id);
            console.log('📄 File info:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                encoding: req.file.encoding,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            const proposal = await GADProposal.findByPk(proposal_id);
            if (!proposal) {
                return res.status(404).json({
                    success: false,
                    message: 'Proposal not found'
                });
            }

            // Verify user owns this proposal
            if (proposal.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You do not own this proposal'
                });
            }

            // Upload file using FileStorageService (same as modules)
            let fileStorageService;
            try {
                fileStorageService = new FileStorageService();
            } catch (initError) {
                console.error('❌ FileStorageService initialization error:', initError.message);
                return res.status(500).json({
                    success: false,
                    message: 'File storage service is not properly configured',
                    error: initError.message
                });
            }

            let uploadResult;
            try {
                uploadResult = await fileStorageService.uploadDocument(
                    req.file.buffer,
                    proposal_id,
                    'document',
                    req.file.mimetype,
                    req.file.originalname,
                    { userId }
                );
            } catch (uploadError) {
                console.error('❌ File upload error:', uploadError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload document to storage',
                    error: uploadError.message
                });
            }

            console.log('✅ File uploaded successfully:', uploadResult.key);

            // Store file metadata in database
            try {
                await proposal.update({
                    file_key: uploadResult.key,
                });
                console.log('💾 Proposal updated with file_key');
            } catch (dbError) {
                console.error('❌ Database update error:', dbError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save file reference to database',
                    error: dbError.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Document uploaded successfully',
                file: {
                    key: uploadResult.key,
                    url: uploadResult.url,
                    name: req.file.originalname,
                    size: req.file.size,
                    mimeType: req.file.mimetype,
                    uploadedAt: uploadResult.uploadedAt
                }
            });
        } catch (error) {
            console.error('❌ Unexpected error uploading proposal document:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            next(error);
        }
    }

    /**
     * Admin: Download/access proposal document
     */
    async downloadProposalDocument(req, res, next) {
        try {
            const { proposal_id } = req.params;

            const proposal = await GADProposal.findByPk(proposal_id);
            if (!proposal || !proposal.file_key) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            // Construct public URL from file key
            // In development mode without R2, generate a mock data URL
            // In production with R2, use the public endpoint or worker
            let downloadUrl;
            
            if (process.env.R2_PUBLIC_URL || process.env.WORKER_URL) {
                const publicUrl = process.env.R2_PUBLIC_URL || process.env.WORKER_URL;
                downloadUrl = `${publicUrl}/${proposal.file_key}`;
            } else {
                // Development mode: create a mock download endpoint
                downloadUrl = `http://localhost:${process.env.PORT || 8080}/api/v1/gad/files/${proposal.id}/${proposal.file_key}`;
            }

            return res.status(200).json({
                success: true,
                document: {
                    fileKey: proposal.file_key,
                    downloadUrl: downloadUrl,
                    uploadedAt: proposal.updated_at,
                    proposal: {
                        id: proposal.id,
                        title: proposal.title,
                        submittedBy: proposal.user_id
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get proposal details with scoring history
     */
    async getProposalDetails(req, res, next) {
        try {
            const { proposal_id } = req.params;

            const proposal = await GADProposal.findByPk(proposal_id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Campus,
                        as: 'campus',
                        attributes: ['id', 'name', 'code']
                    }
                ]
            });

            if (!proposal) {
                return res.status(404).json({
                    success: false,
                    message: 'Proposal not found'
                });
            }

            // Get scoring history
            const scores = await GADScore.findAll({
                where: { proposal_id },
                include: [
                    {
                        model: GADScoringCriteria,
                        as: 'criteria',
                        attributes: ['id', 'criteria_name', 'max_points']
                    },
                    {
                        model: User,
                        as: 'evaluator',
                        attributes: ['id', 'name']
                    }
                ]
            });

            const totalScore = await this.calculateProposalScore(proposal_id);

            return res.status(200).json({
                success: true,
                proposal,
                scores,
                totalScore
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all proposals (with filtering)
     */
    async getAllProposals(req, res, next) {
        try {
            const { campus_id, status, search, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};
            if (campus_id) whereClause.campus_id = campus_id;
            if (status) whereClause.status = status;
            if (search) {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            const { count, rows } = await GADProposal.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Campus,
                        as: 'campus',
                        attributes: ['id', 'name', 'code']
                    }
                ],
                order: [['submission_date', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return res.status(200).json({
                success: true,
                proposals: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all scoring criteria
     */
    async getScoringCriteria(req, res, next) {
        try {
            const criteria = await GADScoringCriteria.findAll({
                where: { is_active: true },
                order: [['criteria_name', 'ASC']]
            });

            return res.status(200).json({
                success: true,
                criteria
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create scoring criteria (Admin only)
     */
    async createScoringCriteria(req, res, next) {
        try {
            const { criteria_name, description, max_points, guidelines, weight } = req.body;

            if (!criteria_name || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Criteria name and description are required'
                });
            }

            const criteria = await GADScoringCriteria.create({
                criteria_name,
                description,
                max_points: max_points || 10,
                guidelines,
                weight: weight || 1.0,
                is_active: true
            });

            return res.status(201).json({
                success: true,
                message: 'Scoring criteria created successfully',
                criteria
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Calculate total score for a proposal
     * @private
     */
    async calculateProposalScore(proposal_id) {
        const scores = await GADScore.findAll({
            where: { proposal_id },
            include: [
                {
                    model: GADScoringCriteria,
                    as: 'criteria',
                    attributes: ['max_points', 'weight']
                }
            ]
        });

        if (scores.length === 0) return null;

        let totalWeightedScore = 0;
        let totalMaxScore = 0;

        scores.forEach(score => {
            const weight = score.criteria?.weight || 1.0;
            totalWeightedScore += score.points_awarded * weight;
            totalMaxScore += (score.criteria?.max_points || 10) * weight;
        });

        return {
            totalScore: Math.round((totalWeightedScore / totalMaxScore) * 100),
            scoredCriteria: scores.length
        };
    }

    /**
     * Get GAD dashboard statistics
     */
    async getDashboardStats(req, res, next) {
        try {
            const { campus_id } = req.query;

            const whereClause = {};
            if (campus_id) whereClause.campus_id = campus_id;

            // Proposal statistics
            const totalProposals = await GADProposal.count({ where: whereClause });
            const approvedProposals = await GADProposal.count({
                where: { ...whereClause, status: { [Op.in]: ['approved', 'approved_final'] } }
            });
            const pendingProposals = await GADProposal.count({
                where: { ...whereClause, status: { [Op.in]: ['submitted', 'under_review'] } }
            });
            const rejectedProposals = await GADProposal.count({
                where: { ...whereClause, status: 'rejected_with_feedback' }
            });

            const statsByStatus = await GADProposal.findAll({
                where: whereClause,
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
                ],
                group: ['status'],
                raw: true
            });

            return res.status(200).json({
                success: true,
                stats: {
                    totalProposals,
                    approvedProposals,
                    pendingProposals,
                    rejectedProposals,
                    byStatus: statsByStatus
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all comments for a proposal
     */
    async getProposalComments(req, res, next) {
        try {
            const { proposal_id } = req.params;

            const proposal = await GADProposal.findByPk(proposal_id);
            if (!proposal) {
                return res.status(404).json({
                    success: false,
                    message: 'Proposal not found'
                });
            }

            const comments = await GADProposal.findByPk(proposal_id, {
                include: [{
                    association: 'comments',
                    include: [{
                        association: 'admin',
                        attributes: ['id', 'name', 'email']
                    }],
                    order: [['created_at', 'ASC']]
                }],
                attributes: []
            });

            return res.status(200).json({
                success: true,
                comments: comments?.comments || []
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add a comment to a proposal (Admin only)
     */
    async addProposalComment(req, res, next) {
        try {
            const { proposal_id } = req.params;
            const { comment_text, comment_type } = req.body;
            const admin_id = req.user.id;

            // Validate proposal exists
            const proposal = await GADProposal.findByPk(proposal_id);
            if (!proposal) {
                return res.status(404).json({
                    success: false,
                    message: 'Proposal not found'
                });
            }

            // Validate input
            if (!comment_text || comment_text.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Comment text cannot be empty'
                });
            }

            const comment = await GADProposalComment.create({
                proposal_id,
                admin_id,
                comment_text: comment_text.trim(),
                comment_type: comment_type || 'feedback'
            });

            // Fetch comment with admin details
            const commentWithAdmin = await comment.reload({
                include: [{
                    association: 'admin',
                    attributes: ['id', 'name', 'email']
                }]
            });

            return res.status(201).json({
                success: true,
                message: 'Comment added successfully',
                comment: commentWithAdmin
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a comment (Admin who created it only)
     */
    async deleteProposalComment(req, res, next) {
        try {
            const { comment_id } = req.params;
            const user_id = req.user.id;

            const comment = await GADProposalComment.findByPk(comment_id);

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found'
                });
            }

            // Check if user is the comment creator
            if (comment.admin_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete your own comments'
                });
            }

            await comment.destroy();

            return res.status(200).json({
                success: true,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new GADController();
