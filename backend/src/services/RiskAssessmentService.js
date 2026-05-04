const { Op } = require('sequelize');
const { Quiz, Module, User, MLAnalysisResult } = require('../model');
const mlAnalysisService = require('./MLAnalysisService');
const personalizationService = require('./PersonalizationService');

const ASSESSMENT_TITLE = 'Behavioral Pattern & Risk Check';

const QUESTIONNAIRE = [
    {
        id: 'safety_1',
        question: 'In stressful situations, how often do you feel unsafe with people close to you?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'safety_2',
        question: 'How often do you feel pressured to do things you are uncomfortable with?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'emotion_1',
        question: 'How frequently have you felt anxious, overwhelmed, or unable to focus recently?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'emotion_2',
        question: 'When upset, how often do you withdraw from support systems (family, friends, mentors)?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'behavior_1',
        question: 'How often do conflicts around you escalate into shouting, intimidation, or threats?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'behavior_2',
        question: 'How often do you feel controlled (for example: monitored messages, restricted movements, or decisions)?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'support_1',
        question: 'If you needed immediate help for safety concerns, how confident are you in knowing where to go?',
        options: ['Very confident', 'Somewhat confident', 'Not sure', 'Not confident']
    },
    {
        id: 'support_2',
        question: 'How often do you avoid reporting harmful situations because of fear of consequences?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    }
];

class RiskAssessmentService {
    _extractTopBehaviors(analysisResults = [], limit = 3) {
        if (!Array.isArray(analysisResults)) return [];

        const counts = {};
        analysisResults.forEach((item) => {
            if (!item || !Array.isArray(item.behaviors)) return;
            item.behaviors.forEach((behavior) => {
                const key = String(behavior || '').trim();
                if (!key) return;
                counts[key] = (counts[key] || 0) + 1;
            });
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([label, count]) => ({ label, count }));
    }

    _buildRiskBreakdown(analysisResults = []) {
        const riskLevels = ['Low', 'Moderate', 'High', 'Severe'];
        const breakdown = riskLevels.map(level => ({ level, count: 0 }));

        if (!Array.isArray(analysisResults)) return breakdown;

        const counts = analysisResults.reduce((acc, item) => {
            const key = String(item?.risk_level || 'Low');
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return breakdown.map(item => ({
            ...item,
            count: counts[item.level] || 0
        }));
    }

    _buildStudentRecommendation(latestAssessment = null) {
        if (!latestAssessment) {
            return null;
        }

        const overallRiskLevel = latestAssessment.overall_risk_level || 'Low';
        const dominantCategory = latestAssessment.dominant_category || 'Neutral / Unclassified';
        const analysisResults = Array.isArray(latestAssessment.analysis_results)
            ? latestAssessment.analysis_results
            : [];
        const topBehaviors = this._extractTopBehaviors(analysisResults, 3);
        const riskBreakdown = this._buildRiskBreakdown(analysisResults);

        const stressLabelMap = {
            Low: 'low',
            Moderate: 'moderate',
            High: 'high',
            Severe: 'very high'
        };

        const seminarRecommended = ['High', 'Severe'].includes(overallRiskLevel) || !!latestAssessment.flags_detected;

        const supportThemes = [];
        const themeChecks = [
            {
                label: 'family, friends, or mentors',
                matcher: /support systems|family|friends|mentors/i
            },
            {
                label: 'feeling unsafe or pressured',
                matcher: /unsafe|pressure|controlled|intimidation|threats/i
            },
            {
                label: 'reporting harmful situations',
                matcher: /reporting harmful|fear of consequences/i
            },
            {
                label: 'emotional overload or withdrawal',
                matcher: /anxious|overwhelmed|unable to focus|withdraw/i
            }
        ];

        analysisResults.forEach((item) => {
            const questionText = String(item?.question_text || '').trim();
            if (!questionText) return;

            themeChecks.forEach((theme) => {
                if (theme.matcher.test(questionText) && !supportThemes.includes(theme.label)) {
                    supportThemes.push(theme.label);
                }
            });
        });

        const reasonParts = [];
        if (dominantCategory && dominantCategory !== 'Neutral / Unclassified') {
            reasonParts.push(`main pattern: ${dominantCategory}`);
        }
        if (topBehaviors.length) {
            reasonParts.push(`common signals: ${topBehaviors.map(item => item.label).join(', ')}`);
        }
        if (supportThemes.length) {
            reasonParts.push(`likely stress areas: ${supportThemes.join(', ')}`);
        }

        const summary = `The system predicts ${stressLabelMap[overallRiskLevel] || 'low'} stress indicators based on your responses.`;
        const recommendationText = seminarRecommended
            ? 'A support seminar or facilitator check-in is recommended so the student can talk through the patterns identified by the analysis.'
            : 'A seminar is not required right now, but the student should keep monitoring these patterns and reach out if the situation gets harder.';

        const note = 'This is a screening result, not a diagnosis.';

        return {
            summary,
            reasonParts,
            seminarRecommended,
            recommendationText,
            note,
            topBehaviors,
            riskBreakdown
        };
    }

    async _resolveSystemOwner() {
        const owner = await User.findOne({
            where: {
                role: { [Op.in]: ['admin', 'educator', 'moderator'] }
            },
            order: [['id', 'ASC']]
        });

        if (owner) return owner;

        return User.findOne({ order: [['id', 'ASC']] });
    }

    async _resolveAnchorModule() {
        const preferredModule = await Module.findOne({
            where: {
                category: { [Op.in]: ['vawc', 'gad', 'general'] }
            },
            order: [['id', 'ASC']]
        });

        return preferredModule || Module.findOne({ order: [['id', 'ASC']] });
    }

    async ensureAssessmentQuiz() {
        let quiz = await Quiz.findOne({
            where: { title: ASSESSMENT_TITLE },
            order: [['id', 'ASC']]
        });

        if (quiz) return quiz;

        const [owner, module] = await Promise.all([
            this._resolveSystemOwner(),
            this._resolveAnchorModule()
        ]);

        if (!owner || !module) {
            throw new Error('Cannot initialize assessment quiz: missing owner or module data');
        }

        quiz = await Quiz.create({
            module_id: module.id,
            title: ASSESSMENT_TITLE,
            description: 'Dedicated behavioral-pattern questionnaire for early support and risk screening.',
            quiz_type: 'time_attack',
            questions_data: QUESTIONNAIRE,
            time_limit: 120,
            points_per_question: 0,
            created_by: owner.id
        });

        return quiz;
    }

    _normalizeSubmittedAnswers(rawAnswers, questions) {
        if (!Array.isArray(rawAnswers)) return [];

        const questionMap = new Map(questions.map((q, idx) => [q.id || `q_${idx}`, { ...q, idx }]));

        return rawAnswers
            .map((entry, idx) => {
                if (!entry || typeof entry !== 'object') return null;

                const questionId = String(entry.questionId || `q_${idx}`);
                const question = questionMap.get(questionId) || null;
                const parsedIndex = Number(entry.selectedOptionIndex);
                const selectedOptionIndex = Number.isInteger(parsedIndex) ? parsedIndex : null;

                const selectedAnswer = String(
                    entry.selectedAnswer
                    || (question && selectedOptionIndex !== null ? question.options[selectedOptionIndex] : '')
                    || ''
                ).trim();

                if (!selectedAnswer) return null;

                return {
                    question: question?.question || String(entry.question || '').trim(),
                    selectedAnswer,
                    questionIndex: question?.idx ?? idx,
                    selectedOptionIndex,
                    questionId
                };
            })
            .filter(Boolean);
    }

    async getQuestionnaire() {
        const quiz = await this.ensureAssessmentQuiz();

        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            questions: Array.isArray(quiz.questions_data) ? quiz.questions_data : QUESTIONNAIRE
        };
    }

    async submitAssessment(userId, payload = {}) {
        const quiz = await this.ensureAssessmentQuiz();
        const questions = Array.isArray(quiz.questions_data) ? quiz.questions_data : QUESTIONNAIRE;
        const answerEntries = this._normalizeSubmittedAnswers(payload.answers, questions);

        if (!answerEntries.length) {
            throw new Error('At least one answer is required for assessment analysis');
        }

        const answerTexts = answerEntries.map(a => a.selectedAnswer).filter(Boolean);

        const mlResult = await mlAnalysisService.analyzeAndStore(
            userId,
            quiz.id,
            answerTexts,
            null,
            answerEntries
        );

        const signalResult = await personalizationService.processPostQuizSignals(userId, quiz.id, mlResult);
        const studentRecommendation = this._buildStudentRecommendation(mlResult);

        return {
            quiz: { id: quiz.id, title: quiz.title },
            answersSubmitted: answerEntries.length,
            mlResult,
            studentRecommendation,
            guidance: signalResult?.guidance || null,
            alertCreated: !!signalResult?.alertCreated
        };
    }

    async getLatestAssessmentAnalysis(userId) {
        const quiz = await this.ensureAssessmentQuiz();

        const latest = await MLAnalysisResult.findOne({
            where: {
                user_id: userId,
                quiz_id: quiz.id
            },
            order: [['created_at', 'DESC']]
        });

        if (!latest) return null;

        return {
            quizId: latest.quiz_id,
            quizTitle: quiz.title,
            analyzedAt: latest.created_at || latest.createdAt,
            overallRiskLevel: latest.overall_risk_level,
            dominantCategory: latest.dominant_category,
            concerningAnswersCount: latest.concerning_answers_count,
            totalAnswersAnalyzed: latest.total_answers_analyzed,
            flagsDetected: !!latest.flags_detected,
            topBehaviors: this._extractTopBehaviors(latest.analysis_results),
            riskBreakdown: this._buildRiskBreakdown(latest.analysis_results),
            studentRecommendation: this._buildStudentRecommendation(latest)
        };
    }
}

module.exports = new RiskAssessmentService();
