// backend/src/services/QuizService.js
const { Quiz, Module, QuizAttempt, UserGamification } = require('../model');
const gamificationService = require('./GamificationService'); // Import ang automated EXP/Title logic

class QuizService {
    /**
     * Creates a new gamified quiz linked to a specific module
     */
    async createQuiz(quizData, userId) {
        const moduleRecord = await Module.findByPk(quizData.module_id);
        if (!moduleRecord) throw new Error('Reference module not found');

        return await Quiz.create({
            module_id: quizData.module_id,
            title: quizData.title || 'Module Reviewer',
            description: quizData.description,
            quiz_type: quizData.quiz_type || 'time_attack',
            questions_data: quizData.questions_data,
            time_limit: quizData.time_limit || 30,
            points_per_question: quizData.points_per_question || 10, 
            created_by: userId
        });
    }

    /**
     * Submission Logic: Nag-o-automate ng pag-save ng attempt at pag-update ng EXP/Title
     */
    async submitAttempt(userId, quizId, results) {
        // 1. Siguraduhing Number ang values para hindi mag-error ang Sequelize
        const points = parseInt(results.pointsEarned) || 0;
        const correct = parseInt(results.correctCount) || 0;
        const total = parseInt(results.totalQuestions) || 0;
        const time = parseInt(results.timeTaken) || 0;

        // 2. I-save ang attempt sa quiz_attempts table (Tugma sa model at bagong migration)
        const attempt = await QuizAttempt.create({
            user_id: userId,
            quiz_id: quizId,
            score: points, // Dito sine-save ang total points earned
            correct_answers: correct, // New column based sa fixed migration
            total_questions: total,
            time_taken: time
        });

        // 3. EXP at Automated Title Update
        // Base sa logic natin, ang correct answers ang multiplier para sa EXP (e.g., 20 EXP per correct answer)
        const expGained = correct * 20;
        
        // Tinatawag ang gamificationService para sa automatic Title threshold checking
        const updatedStats = await gamificationService.addExperience(userId, expGained);

        return { 
            success: true,
            attempt, 
            experienceGained: expGained,
            currentTotalExp: updatedStats.experience_points, 
            currentTitle: updatedStats.current_title // Ibinabalik ang bagong title kung nag-level up
        };
    }

    /**
     * Fetches all quizzes associated with a specific module ID
     */
    async getQuizzesByModule(moduleId) {
        return await Quiz.findAll({
            where: { module_id: moduleId },
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Fetches a single quiz detail by its primary ID
     */
    async getQuizById(quizId) {
        const quiz = await Quiz.findByPk(quizId, {
            include: [{
                model: Module,
                as: 'module',
                attributes: ['title', 'category']
            }]
        });
        if (!quiz) throw new Error('Quiz not found');
        return quiz;
    }
}

module.exports = new QuizService();