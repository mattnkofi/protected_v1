const { Badge, UserInventory, UserGamification, User } = require('../model');

class RewardsController {
    /**
     * Get all available rewards for the shop (active only)
     * Transforms Badge model fields to match frontend expectations
     */
    async getAvailableRewards(req, res) {
        try {
            const rewards = await Badge.findAll({
                where: { is_active: true }
            });

            // Transform to match frontend field expectations
            const transformedRewards = rewards.map(reward => ({
                id: reward.id,
                title: reward.name,
                description: reward.description,
                image_url: reward.iconPath ? `${req.protocol}://${req.get('host')}${reward.iconPath}` : null,
                xp_required: reward.cost_xp,
                stock_quantity: reward.total_slots > 0 
                    ? Math.max(0, reward.total_slots - reward.claimed_count) 
                    : 999, // Unlimited if total_slots is 0
                total_slots: reward.total_slots,
                claimed_count: reward.claimed_count
            }));

            res.json(transformedRewards);
        } catch (error) {
            console.error('Error fetching rewards:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get ALL rewards for facilitator management (including inactive)
     */
    async getAllRewardsForAdmin(req, res) {
        try {
            const rewards = await Badge.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Transform to match frontend field expectations
            const transformedRewards = rewards.map(reward => ({
                id: reward.id,
                title: reward.name,
                name: reward.name,
                description: reward.description,
                image_url: reward.iconPath ? `${req.protocol}://${req.get('host')}${reward.iconPath}` : null,
                iconPath: reward.iconPath,
                xp_required: reward.cost_xp,
                cost_xp: reward.cost_xp,
                stock_quantity: reward.total_slots > 0 
                    ? Math.max(0, reward.total_slots - reward.claimed_count) 
                    : 999,
                total_slots: reward.total_slots,
                claimed_count: reward.claimed_count,
                is_active: reward.is_active
            }));

            res.json({ success: true, rewards: transformedRewards });
        } catch (error) {
            console.error('Error fetching all rewards:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Claim a reward (Trade XP)
     */
    async claimReward(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const reward = await Badge.findByPk(id);
            if (!reward) {
                return res.status(404).json({ message: 'Reward not found' });
            }

            const userStats = await UserGamification.findOne({ where: { user_id: userId } });
            if (!userStats) {
                return res.status(400).json({ message: 'User gamification profile not found' });
            }

            // 1. Check if active
            if (!reward.is_active) {
                return res.status(400).json({ message: 'This reward is currently unavailable' });
            }

            // 2. Check slots (0 = unlimited)
            const remainingSlots = reward.total_slots > 0 
                ? reward.total_slots - reward.claimed_count 
                : 999;
            
            if (reward.total_slots > 0 && remainingSlots <= 0) {
                return res.status(400).json({ message: 'This reward is out of stock' });
            }

            // 3. Check XP Cost
            if (userStats.experience_points < reward.cost_xp) {
                return res.status(400).json({ 
                    message: `Insufficient XP. You need ${reward.cost_xp} XP but have ${userStats.experience_points} XP` 
                });
            }

            // 4. Check if already owned
            const alreadyOwned = await UserInventory.findOne({ 
                where: { user_id: userId, badge_id: id } 
            });
            if (alreadyOwned) {
                return res.status(400).json({ message: 'You already own this reward' });
            }

            // 5. Deduct XP
            userStats.experience_points -= reward.cost_xp;
            await userStats.save();

            // 6. Add to Inventory
            await UserInventory.create({ 
                user_id: userId, 
                badge_id: id,
                claimed_at: new Date()
            });

            // 7. Increment claimed count
            reward.claimed_count += 1;
            await reward.save();

            res.json({
                success: true,
                message: 'Reward claimed successfully!',
                remaining_xp: userStats.experience_points,
                reward: {
                    id: reward.id,
                    title: reward.name
                }
            });
        } catch (error) {
            console.error('Error claiming reward:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get user's claimed rewards inventory
     */
    async getMyInventory(req, res) {
        try {
            const userId = req.user.id;

            const inventory = await UserInventory.findAll({
                where: { user_id: userId },
                include: [{ 
                    model: Badge, 
                    as: 'badge',
                    attributes: ['id', 'name', 'description', 'iconPath', 'cost_xp']
                }],
                order: [['claimed_at', 'DESC']]
            });

            // Transform for frontend
            const transformedInventory = inventory.map(item => ({
                id: item.id,
                claimed_at: item.claimed_at,
                reward: item.badge ? {
                    id: item.badge.id,
                    title: item.badge.name,
                    description: item.badge.description,
                    image_url: item.badge.iconPath ? `http://localhost:3000${item.badge.iconPath}` : null,
                    xp_cost: item.badge.cost_xp
                } : null
            }));

            res.json({ 
                success: true, 
                inventory: transformedInventory 
            });
        } catch (error) {
            console.error('Error fetching inventory:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Admin/Facilitator: Create a new reward
     */
    async createReward(req, res) {
        try {
            const { name, description, iconPath, cost_xp, total_slots } = req.body;

            const reward = await Badge.create({
                name,
                description,
                iconPath: iconPath || '/uploads/rewards/default.png',
                cost_xp: cost_xp || 0,
                total_slots: total_slots || 0,
                claimed_count: 0,
                is_active: true
            });

            res.status(201).json({ 
                success: true, 
                reward: {
                    id: reward.id,
                    title: reward.name,
                    description: reward.description,
                    image_url: reward.iconPath ? `http://localhost:3000${reward.iconPath}` : null,
                    xp_required: reward.cost_xp,
                    stock_quantity: reward.total_slots,
                    is_active: reward.is_active
                }
            });
        } catch (error) {
            console.error('Error creating reward:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Admin/Facilitator: Update a reward
     */
    async updateReward(req, res) {
        try {
            const { id } = req.params;
            const { name, description, iconPath, cost_xp, total_slots, is_active } = req.body;

            const reward = await Badge.findByPk(id);
            if (!reward) {
                return res.status(404).json({ message: 'Reward not found' });
            }

            if (name !== undefined) reward.name = name;
            if (description !== undefined) reward.description = description;
            if (iconPath !== undefined) reward.iconPath = iconPath;
            if (cost_xp !== undefined) reward.cost_xp = cost_xp;
            if (total_slots !== undefined) reward.total_slots = total_slots;
            if (is_active !== undefined) reward.is_active = is_active;

            await reward.save();

            res.json({ 
                success: true, 
                message: 'Reward updated successfully',
                reward: {
                    id: reward.id,
                    title: reward.name,
                    description: reward.description,
                    xp_required: reward.cost_xp,
                    stock_quantity: reward.total_slots > 0 
                        ? Math.max(0, reward.total_slots - reward.claimed_count) 
                        : 999,
                    is_active: reward.is_active
                }
            });
        } catch (error) {
            console.error('Error updating reward:', error);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Admin/Facilitator: Delete a reward
     */
    async deleteReward(req, res) {
        try {
            const { id } = req.params;
            
            // Also delete related inventory entries
            await UserInventory.destroy({ where: { badge_id: id } });
            await Badge.destroy({ where: { id } });

            res.json({ success: true, message: 'Reward deleted successfully' });
        } catch (error) {
            console.error('Error deleting reward:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new RewardsController();
