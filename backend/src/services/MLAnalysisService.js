// backend/src/services/MLAnalysisService.js
const { MLAnalysisResult, User, UserProfile, Quiz, QuizAttempt, Module, Classroom, ClassroomMember } = require('../model');
const { Op } = require('sequelize');

// ML Service URL (Python Flask API)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

class MLAnalysisService {
    _getAgeBand(age) {
        if (age === null || age === undefined || Number.isNaN(Number(age))) return 'Unknown';

        const numericAge = Number(age);
        if (numericAge < 13) return 'Below 13';
        if (numericAge <= 15) return '13-15';
        if (numericAge <= 18) return '16-18';
        if (numericAge <= 24) return '19-24';
        if (numericAge <= 34) return '25-34';
        if (numericAge <= 44) return '35-44';
        return '45+';
    }

    _calculateAge(dateOfBirth) {
        if (!dateOfBirth) return null;

        const birthDate = new Date(dateOfBirth);
        if (Number.isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    _extractReasonThemes(analysisResults = []) {
        const themeMatchers = [
            {
                key: 'family_support',
                label: 'Family / support concerns',
                example: 'family conflict or support-system strain',
                matcher: /support systems|family|friends|mentors/i
            },
            {
                key: 'pressure_control',
                label: 'Pressure / control concerns',
                example: 'being pressured, controlled, or intimidated',
                matcher: /unsafe|pressure|controlled|intimidation|threats/i
            },
            {
                key: 'reporting_fear',
                label: 'Fear of reporting',
                example: 'avoiding help because of consequences',
                matcher: /reporting harmful|fear of consequences/i
            },
            {
                key: 'overwhelm_withdrawal',
                label: 'Emotional overload / withdrawal',
                example: 'feeling overwhelmed or pulling away from support',
                matcher: /anxious|overwhelmed|unable to focus|withdraw/i
            }
        ];

        const counts = {};
        themeMatchers.forEach((theme) => { counts[theme.key] = 0; });

        if (!Array.isArray(analysisResults)) {
            return themeMatchers.map(theme => ({ ...theme, count: 0 })).sort((a, b) => b.count - a.count);
        }

        analysisResults.forEach((item) => {
            const questionText = String(item?.question_text || '').trim();
            if (!questionText) return;

            themeMatchers.forEach((theme) => {
                if (theme.matcher.test(questionText)) {
                    counts[theme.key] = (counts[theme.key] || 0) + 1;
                }
            });
        });

        return themeMatchers
            .map(theme => ({ ...theme, count: counts[theme.key] || 0 }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Build access scope for facilitator analytics.
     * A facilitator can see:
     * 1) analyses from students in classrooms they created
     * 2) analyses tied to quizzes they authored
     */
    async _buildFacilitatorAccessScope(facilitatorId) {
        const classrooms = await Classroom.findAll({
            where: { created_by: facilitatorId },
            attributes: ['id']
        });
        const classroomIds = classrooms.map(c => c.id);

        const members = classroomIds.length
            ? await ClassroomMember.findAll({
                where: { classroom_id: { [Op.in]: classroomIds } },
                attributes: ['user_id']
            })
            : [];
        const studentIds = [...new Set(members.map(m => m.user_id))];

        const facilitatorQuizzes = await Quiz.findAll({
            where: { created_by: facilitatorId },
            attributes: ['id']
        });
        const quizIds = facilitatorQuizzes.map(q => q.id);

        const orConditions = [];
        if (studentIds.length) orConditions.push({ user_id: { [Op.in]: studentIds } });
        if (quizIds.length) orConditions.push({ quiz_id: { [Op.in]: quizIds } });

        return {
            studentIds,
            quizIds,
            accessWhere: orConditions.length ? { [Op.or]: orConditions } : null
        };
    }

    /**
     * Send answers to the ML service for VAWC analysis
     * @param {string[]} answers - Array of answer texts
     * @returns {Object} - { results, summary }
     */
    async analyzeAnswers(answers) {
        try {
            const response = await fetch(`${ML_SERVICE_URL}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });

            if (!response.ok) {
                throw new Error(`ML Service returned status ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'ML analysis failed');
            }

            return { results: data.results, summary: data.summary };
        } catch (error) {
            console.error('[MLAnalysisService] Error calling ML service:', error.message);
            // Return a fallback result so the quiz submission doesn't fail
            return {
                results: answers.map(a => ({
                    answer_text: a || '',
                    category: 'Neutral / Unclassified',
                    risk_level: 'Low',
                    behaviors: ['ML service unavailable'],
                    detection_method: 'Fallback (service unavailable)'
                })),
                summary: {
                    total_answers_analyzed: answers.length,
                    overall_risk_level: 'Low',
                    dominant_category: 'Neutral / Unclassified',
                    category_breakdown: { 'Neutral / Unclassified': answers.length },
                    concerning_answers_count: 0,
                    flags_detected: false
                }
            };
        }
    }

    /**
     * Analyze quiz answers and store results in the database
     * Called after a quiz submission
     */
    async analyzeAndStore(userId, quizId, answers, quizAttemptId = null, answerEntries = []) {
        try {
            const { results, summary } = await this.analyzeAnswers(answers);

            // Preserve quiz context so facilitator can verify exactly which option was assessed.
            const enrichedResults = results.map((result, index) => {
                const entry = Array.isArray(answerEntries) ? answerEntries[index] : null;
                return {
                    ...result,
                    question_text: entry?.question || null,
                    selected_answer: entry?.selectedAnswer || result.answer_text || '',
                    question_index: Number.isInteger(entry?.questionIndex) ? entry.questionIndex : index,
                    selected_option_index: Number.isInteger(entry?.selectedOptionIndex) ? entry.selectedOptionIndex : null
                };
            });

            const record = await MLAnalysisResult.create({
                user_id: userId,
                quiz_id: quizId,
                quiz_attempt_id: quizAttemptId,
                analysis_results: enrichedResults,
                overall_risk_level: summary.overall_risk_level,
                dominant_category: summary.dominant_category,
                category_breakdown: summary.category_breakdown,
                total_answers_analyzed: summary.total_answers_analyzed,
                concerning_answers_count: summary.concerning_answers_count,
                flags_detected: summary.flags_detected
            });

            return record;
        } catch (error) {
            const detail = error?.errors?.map(e => e.message).join(' | ') || '';
            console.error('[MLAnalysisService] Error storing analysis:', error.message, detail);
            // Don't throw — we don't want ML failures to break quiz submission
            return null;
        }
    }

    /**
     * Get all analysis results for a facilitator's classrooms
     * Facilitators can see results for students in their classrooms
     */
    async getResultsForFacilitator(facilitatorId, options = {}) {
        const { page = 1, limit = 20, riskLevel, flaggedOnly, quizId, reviewed } = options;

        const { accessWhere } = await this._buildFacilitatorAccessScope(facilitatorId);
        if (!accessWhere) {
            return { results: [], total: 0, page, totalPages: 0 };
        }

        const where = { ...accessWhere };
        if (riskLevel) where.overall_risk_level = riskLevel;
        if (flaggedOnly === true || flaggedOnly === 'true') where.flags_detected = true;
        if (quizId) where.quiz_id = quizId;
        if (reviewed !== undefined && reviewed !== null) {
            where.reviewed = reviewed === true || reviewed === 'true';
        }

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit, 10) || 20;
        const offset = (parsedPage - 1) * parsedLimit;

        const { rows, count } = await MLAnalysisResult.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                    include: [{
                        model: UserProfile,
                        as: 'profile',
                        attributes: ['date_of_birth']
                    }]
                },
                {
                    model: Quiz,
                    as: 'quiz',
                    attributes: ['id', 'title', 'quiz_type'],
                    include: [{
                        model: Module,
                        as: 'module',
                        attributes: ['id', 'title']
                    }]
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [
                ['flags_detected', 'DESC'],
                ['overall_risk_level', 'DESC'],
                ['created_at', 'DESC']
            ],
            limit: parsedLimit,
            offset
        });

        return {
            results: rows,
            total: count,
            page: parsedPage,
            totalPages: Math.ceil(count / parsedLimit)
        };
    }

    /**
     * Get a single analysis result by ID (with full detail)
     */
    async getResultById(resultId) {
        const result = await MLAnalysisResult.findByPk(resultId, {
            include: [
                {
                    model: User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Quiz,
                    as: 'quiz',
                    attributes: ['id', 'title', 'quiz_type', 'questions_data'],
                    include: [{
                        model: Module,
                        as: 'module',
                        attributes: ['id', 'title', 'category']
                    }]
                },
                {
                    model: QuizAttempt,
                    as: 'attempt',
                    attributes: ['id', 'score', 'correct_answers', 'total_questions', 'time_taken']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        if (!result) throw new Error('Analysis result not found');
        return result;
    }

    /**
     * Mark a result as reviewed by a facilitator
     */
    async markAsReviewed(resultId, facilitatorId, notes = null) {
        const result = await MLAnalysisResult.findByPk(resultId);
        if (!result) throw new Error('Analysis result not found');

        result.reviewed = true;
        result.reviewed_by = facilitatorId;
        result.reviewed_at = new Date();
        if (notes) result.facilitator_notes = notes;
        await result.save();

        return result;
    }

    /**
     * Get aggregate statistics for a facilitator's dashboard
     */
    async getStatsForFacilitator(facilitatorId) {
        const { accessWhere } = await this._buildFacilitatorAccessScope(facilitatorId);
        if (!accessWhere) {
            return {
                totalAnalyses: 0,
                flaggedCount: 0,
                unreviewedCount: 0,
                riskDistribution: {},
                categoryDistribution: {},
                recentFlags: []
            };
        }

        const where = { ...accessWhere };

        const totalAnalyses = await MLAnalysisResult.count({ where });
        const flaggedCount = await MLAnalysisResult.count({ where: { ...where, flags_detected: true } });
        const unreviewedCount = await MLAnalysisResult.count({ where: { ...where, flags_detected: true, reviewed: false } });

        // Risk and profile distribution
        const allResults = await MLAnalysisResult.findAll({
            where,
            attributes: ['overall_risk_level', 'analysis_results', 'flags_detected'],
            include: [{
                model: User,
                as: 'student',
                attributes: ['id', 'name', 'email'],
                include: [{
                    model: UserProfile,
                    as: 'profile',
                    attributes: ['date_of_birth']
                }]
            }]
        });

        const riskDistribution = {};
        const ageBandDistribution = {};
        const ageBandRiskDistribution = {};

        allResults.forEach((row) => {
            riskDistribution[row.overall_risk_level] = (riskDistribution[row.overall_risk_level] || 0) + 1;

            const dateOfBirth = row.student?.profile?.date_of_birth || null;
            const age = this._calculateAge(dateOfBirth);
            const ageBand = this._getAgeBand(age);

            if (!ageBandDistribution[ageBand]) {
                ageBandDistribution[ageBand] = { total: 0, flagged: 0, severeOrHigh: 0 };
            }

            ageBandDistribution[ageBand].total += 1;
            if (row.flags_detected) ageBandDistribution[ageBand].flagged += 1;
            if (['High', 'Severe'].includes(row.overall_risk_level)) {
                ageBandDistribution[ageBand].severeOrHigh += 1;
            }

            if (!ageBandRiskDistribution[ageBand]) {
                ageBandRiskDistribution[ageBand] = { total: 0, low: 0, moderate: 0, high: 0, severe: 0 };
            }
            ageBandRiskDistribution[ageBand].total += 1;
            const normalizedRisk = String(row.overall_risk_level || 'low').toLowerCase();
            if (normalizedRisk in ageBandRiskDistribution[ageBand]) {
                ageBandRiskDistribution[ageBand][normalizedRisk] += 1;
            }
        });

        // Category distribution
        const categoryResults = await MLAnalysisResult.findAll({
            where,
            attributes: ['dominant_category'],
            raw: true
        });
        const categoryDistribution = {};
        categoryResults.forEach(r => {
            categoryDistribution[r.dominant_category] = (categoryDistribution[r.dominant_category] || 0) + 1;
        });

        const reasonDistribution = {};
        allResults.forEach((row) => {
            const themes = this._extractReasonThemes(row.analysis_results || []);
            themes.forEach((theme) => {
                if (!theme.count) return;
                reasonDistribution[theme.key] = reasonDistribution[theme.key] || {
                    key: theme.key,
                    label: theme.label,
                    example: theme.example,
                    count: 0
                };
                reasonDistribution[theme.key].count += 1;
            });
        });

        const ageRangeDistribution = Object.entries(ageBandDistribution)
            .map(([label, summary]) => ({
                label,
                ...summary,
                severeRate: summary.total > 0 ? Number(((summary.severeOrHigh / summary.total) * 100).toFixed(1)) : 0
            }))
            .sort((a, b) => {
                const order = ['Below 13', '13-15', '16-18', '19-24', '25-34', '35-44', '45+', 'Unknown'];
                return order.indexOf(a.label) - order.indexOf(b.label);
            });

        const reasonBreakdown = Object.values(reasonDistribution)
            .sort((a, b) => b.count - a.count);

        // Recent flagged results
        const recentFlags = await MLAnalysisResult.findAll({
            where: { ...where, flags_detected: true },
            include: [
                { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
                {
                    model: Quiz, as: 'quiz', attributes: ['id', 'title'],
                    include: [{ model: Module, as: 'module', attributes: ['id', 'title'] }]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        return {
            totalAnalyses,
            flaggedCount,
            unreviewedCount,
            riskDistribution,
            ageRangeDistribution,
            ageBandRiskDistribution,
            reasonBreakdown,
            categoryDistribution,
            recentFlags
        };
    }
}

module.exports = new MLAnalysisService();
