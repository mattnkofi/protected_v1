const { UserGamification, Title, Sequelize } = require('../model');
const { Op } = Sequelize;

/**
 * Adds EXP to a user and automatically updates their title if a threshold is reached.
 */
exports.addExperience = async (userId, amount) => {
    try {
        // Find or create gamification record for the user
        let [status] = await UserGamification.findOrCreate({
            where: { user_id: userId },
            defaults: { experience_points: 0, current_title: 'Novice', total_points: 0 }
        });

        const newExp = status.experience_points + amount;
        status.total_points = (status.total_points || 0) + amount; // Track lifetime XP for Titles
        
        // Find the highest title applicable based on TOTAL_POINTS (Title Tier)
        // Only query if Title model exists and has data
        if (Title) {
            const nextTitle = await Title.findOne({
                where: {
                    exp_required: { [Op.lte]: status.total_points }
                },
                order: [['exp_required', 'DESC']]
            });

            // Update title if a new one is earned
            if (nextTitle && nextTitle.name !== status.current_title) {
                status.current_title = nextTitle.name;
            }
        }

        status.experience_points = newExp; // This is spendable XP for Store

        await status.save();
        return status;
    } catch (error) {
        console.error('[GamificationService] Error adding EXP:', error);
        throw error;
    }
};