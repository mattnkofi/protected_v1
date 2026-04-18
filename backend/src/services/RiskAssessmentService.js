const { Op } = require('sequelize');
const { Quiz, Module, User, MLAnalysisResult } = require('../model');
const mlAnalysisService = require('./MLAnalysisService');
const personalizationService = require('./PersonalizationService');

const ASSESSMENT_TITLE = 'Behavioral Pattern & Risk Check';
const ASSESSMENT_DESCRIPTION = '34-item risk screening across possible victim indicators, risk indicators, violator tendencies, and general behavioral indicators.';

const QUESTIONNAIRE = [
    {
        id: 'pv_1',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you feel unsafe around a specific person or situation?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_2',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you worry about upsetting someone close to you?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_3',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you feel watched, monitored, or tracked by someone?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_4',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you avoid asking for help because you fear the consequences?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_5',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you keep problems secret to avoid conflict?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_6',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you feel isolated from your support network?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_7',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you find it hard to leave a tense situation when you want to?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_8',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you feel your choices are dismissed by someone close to you?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'pv_9',
        dimension: 'possible_victim_indicators',
        dimensionLabel: 'Possible Victim Indicators',
        question: 'How often do you feel anxious when calls or messages come from a specific person?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_1',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often do conflicts around you escalate into threats or intimidation?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_2',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often do arguments involve blocking exits, breaking items, or other unsafe escalation?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_3',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often does jealousy get used as a reason to monitor or restrict another person?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_4',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often do alcohol or drugs seem to contribute to harmful behavior around you?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_5',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often does harmful behavior repeat after apologies or promises to stop?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_6',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often do threats or insults increase when someone sets a boundary?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_7',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often does someone pressure you for passwords, location access, or private accounts?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_8',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often are you blamed for another person\'s harmful or controlling behavior?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'ri_9',
        dimension: 'risk_indicators',
        dimensionLabel: 'Risk Indicators',
        question: 'How often have you changed routines to avoid triggering conflict?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_1',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone check your phone, messages, or accounts without permission?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_2',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone restrict who you can talk to or spend time with?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_3',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone use guilt, fear, or pressure to make you comply?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_4',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone control your clothing, movement, or personal decisions?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_5',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone threaten to leave, expose, or harm something to get compliance?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_6',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone ignore consent or push for physical contact after you say no?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_7',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone isolate you from friends, family, or support services?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'vt_8',
        dimension: 'violator_tendencies',
        dimensionLabel: 'Violator Tendencies',
        question: 'How often does someone minimize harm after they hurt, insult, or control you?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_1',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often have you been withdrawing from other people lately?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_2',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often are you struggling to sleep, focus, or concentrate?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_3',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often do you notice mood swings or sudden irritability?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_4',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often do you feel hyperaware, on edge, or easily startled?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_5',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often has your participation in school, work, or activities dropped recently?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_6',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often do you avoid people or places connected with stressful experiences?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_7',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often do you feel fearful or panicked without a clear reason?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
        id: 'gb_8',
        dimension: 'general_behavioral_indicators',
        dimensionLabel: 'General Behavioral Indicators',
        question: 'How often do you feel emotionally numb, shut down, or exhausted?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often']
    }
];

class RiskAssessmentService {
    _questionnaireNeedsSync(quiz) {
        if (!quiz) return true;

        const currentQuestions = Array.isArray(quiz.questions_data) ? quiz.questions_data : [];
        if (currentQuestions.length !== QUESTIONNAIRE.length) return true;

        return QUESTIONNAIRE.some((question, index) => {
            const current = currentQuestions[index] || {};
            return current.id !== question.id || current.dimension !== question.dimension;
        });
    }

    _buildQuestionnaireSections(questions = []) {
        const sections = [];
        const sectionMap = new Map();

        questions.forEach((question) => {
            const label = question.dimensionLabel || 'General';
            if (!sectionMap.has(label)) {
                const section = {
                    key: question.dimension || label.toLowerCase().replace(/\s+/g, '_'),
                    label,
                    count: 0,
                    questions: []
                };
                sectionMap.set(label, section);
                sections.push(section);
            }

            const section = sectionMap.get(label);
            section.questions.push(question);
            section.count += 1;
        });

        return sections;
    }

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

        if (quiz) {
            if (this._questionnaireNeedsSync(quiz)) {
                quiz.questions_data = QUESTIONNAIRE;
                quiz.description = ASSESSMENT_DESCRIPTION;
                quiz.time_limit = 300;
                quiz.points_per_question = 0;
                await quiz.save();
            }

            return quiz;
        }

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
            description: ASSESSMENT_DESCRIPTION,
            quiz_type: 'time_attack',
            questions_data: QUESTIONNAIRE,
            time_limit: 300,
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
        const questions = Array.isArray(quiz.questions_data) ? quiz.questions_data : QUESTIONNAIRE;

        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            questions,
            sections: this._buildQuestionnaireSections(questions)
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

        return {
            quiz: { id: quiz.id, title: quiz.title },
            answersSubmitted: answerEntries.length,
            mlResult,
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
            topBehaviors: this._extractTopBehaviors(latest.analysis_results)
        };
    }
}

module.exports = new RiskAssessmentService();
