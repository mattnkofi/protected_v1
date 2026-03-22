// backend/src/controller/QuizController.js
const { Module, UserGamification, User, QuizAttempt } = require('../model');
const QuizService = require('../services/QuizService');
const gamificationService = require('../services/GamificationService'); // In-import natin ang bagong service

class QuizController {
    /**
     * Check if user has already attempted a quiz (1 attempt only)
     */
    async checkUserAttempt(req, res) {
        try {
            const quizId = req.params.id;
            const userId = req.user.id;

            const existingAttempt = await QuizAttempt.findOne({
                where: { user_id: userId, quiz_id: quizId }
            });

            return res.status(200).json({
                success: true,
                attempted: !!existingAttempt,
                attempt: existingAttempt ? {
                    score: existingAttempt.score,
                    completed_at: existingAttempt.createdAt
                } : null
            });
        } catch (error) {
            console.error('QuizController.checkUserAttempt error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Creates a new gamified quiz linked to a specific module
     */
    async createQuiz(req, res) {
        try {
            const { module_id } = req.body;
            const userId = req.user.id;

            // 1. Verify that the module exists
            const targetModule = await Module.findByPk(module_id);
            if (!targetModule) {
                return res.status(404).json({
                    success: false,
                    message: 'The module you are trying to link this quiz to does not exist.'
                });
            }

            // 2. Create the quiz via service
            const result = await QuizService.createQuiz(req.body, userId);
            
            return res.status(201).json({
                success: true,
                message: 'Gamified quiz created and linked to module successfully',
                quiz: result
            });
        } catch (error) {
            console.error('QuizController.createQuiz error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Fetches all quizzes associated with a specific module ID
     */
    async getByModule(req, res) {
        try {
            const { moduleId } = req.params;
            
            const moduleExists = await Module.findByPk(moduleId);
            if (!moduleExists) {
                return res.status(404).json({ success: false, message: 'Module not found' });
            }

            const quizzes = await QuizService.getQuizzesByModule(moduleId);
            return res.status(200).json({ success: true, quizzes: quizzes || [] });
        } catch (error) {
            console.error('QuizController.getByModule error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Fetches a single quiz detail by its primary ID
     */
    async getQuizById(req, res) {
        try {
            const result = await QuizService.getQuizById(req.params.id);
            return res.status(200).json({
                success: true,
                quiz: result
            });
        } catch (error) {
            console.error('QuizController.getQuizById error:', error);
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    /**
     * Handles quiz submission, saves attempts, and updates XP/Title
     */
    async submitResults(req, res) {
        try {
            const quizId = req.params.id;
            const userId = req.user.id;
            const { pointsEarned, correctCount } = req.body;
            
            // 1. I-save ang attempt sa database (QuizAttempt)
            const result = await QuizService.submitAttempt(userId, quizId, req.body);
            
            // 2. EXP Logic: Magbigay ng EXP base sa dami ng tamang sagot
            // Halimbawa: 20 EXP per correct answer
            const expGained = (correctCount || 0) * 20;
            
            // 3. I-update ang Gamification Status (EXP at Title)
            const updatedGamification = await gamificationService.addExperience(userId, expGained);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Progress saved successfully!',
                data: {
                    attempt: result,
                    expGained: expGained,
                    currentExp: updatedGamification.experience_points,
                    currentTitle: updatedGamification.current_title
                }
            });
        } catch (error) {
            console.error('QuizController.submitResults error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Fetches all students (players) and their rankings, including those with 0 XP
     */
    async getLeaderboard(req, res) {
        try {
            const students = await User.findAll({
                where: { 
                    role: 'player',
                    account_status: 'active'
                },
                attributes: ['id', 'name', 'email'],
                include: [{
                    model: UserGamification,
                    as: 'gamification',
                    attributes: ['experience_points', 'current_title', 'level'],
                    required: false // LEFT JOIN to include users with no gamification record
                }]
            });

            // Map standard format for frontend
            const learners = students.map(s => {
                const displayName = s.name || s.email?.split('@')[0] || 'Anonymous Player';
                return {
                    id: s.id,
                    name: displayName,
                    points: s.gamification?.experience_points || 0,
                    level: s.gamification?.level || 1,
                    title: s.gamification?.current_title || 'Novice',
                    initials: displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
                };
            });

            // Sort by points descending (handles null gamification properly)
            learners.sort((a, b) => b.points - a.points);

            return res.status(200).json({
                success: true,
                learners: learners
            });
        } catch (error) {
            console.error('QuizController.getLeaderboard error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal Server Error while fetching leaderboard' 
            });
        }
    }
}

module.exports = new QuizController();