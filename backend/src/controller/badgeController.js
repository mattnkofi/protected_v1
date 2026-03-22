const { Badge, UserInventory, UserGamification } = require('../model');

class BadgeController {
    // Facilitator: Create new Reward item
    async createReward(req, res) {
        try {
            const { name, description, iconPath, cost_xp, total_slots } = req.body;
            const reward = await Badge.create({
                name,
                description,
                iconPath,
                cost_xp,
                total_slots,
                is_active: true
            });
            res.status(201).json({ success: true, reward });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Facilitator: List all rewards for management
    async getAllRewards(req, res) {
        try {
            const rewards = await Badge.findAll();
            res.json({ success: true, rewards });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Facilitator: Update/CRUD slot
    async toggleRewardSlot(req, res) {
        try {
            const { id } = req.params;
            const { total_slots, is_active, cost_xp, name, description } = req.body;

            const reward = await Badge.findByPk(id);
            if (!reward) return res.status(404).json({ message: 'Reward not found' });

            if (total_slots !== undefined) reward.total_slots = total_slots;
            if (is_active !== undefined) reward.is_active = is_active;
            if (cost_xp !== undefined) reward.cost_xp = cost_xp;
            if (name) reward.name = name;
            if (description) reward.description = description;

            await reward.save();

            res.json({ success: true, message: 'Reward updated', reward });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Facilitator: Delete Reward
    async deleteReward(req, res) {
        try {
            const { id } = req.params;
            await Badge.destroy({ where: { id } });
            res.json({ success: true, message: 'Reward deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Student: Claim Reward (Trade XP)
    async claimReward(req, res) {
        try {
            const { badgeId } = req.body;
            const userId = req.user.id;

            const reward = await Badge.findByPk(badgeId);
            if (!reward) return res.status(404).json({ message: 'Reward not found' });

            const userStats = await UserGamification.findOne({ where: { user_id: userId } });

            // 1. Check if active
            if (!reward.is_active) return res.status(400).json({ message: 'This reward is currently unavailable' });

            // 2. Check slots
            if (reward.total_slots > 0 && reward.claimed_count >= reward.total_slots) {
                return res.status(400).json({ message: 'No slots remaining' });
            }

            // 3. Check XP Cost (Trade logic)
            if (userStats.experience_points < reward.cost_xp) {
                return res.status(400).json({ message: 'Insufficient XP to trade for this reward' });
            }

            // 4. Check if already owned
            const alreadyOwned = await UserInventory.findOne({ where: { user_id: userId, badge_id: badgeId } });
            if (alreadyOwned) return res.status(400).json({ message: 'You already have this reward' });

            // 5. Deduct XP (Trade)
            userStats.experience_points -= reward.cost_xp;
            await userStats.save();

            // 6. Add to Inventory
            await UserInventory.create({ user_id: userId, badge_id: badgeId });
            
            reward.claimed_count += 1;
            await reward.save();

            res.json({ 
                success: true, 
                message: 'Reward traded successfully!', 
                remaining_xp: userStats.experience_points 
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Listahan ng nakuha na ng student
    async getMyInventory(req, res) {
        try {
            const inventory = await UserInventory.findAll({
                where: { user_id: req.user.id },
                include: [{ model: Badge }]
            });
            res.json({ success: true, inventory });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new BadgeController();