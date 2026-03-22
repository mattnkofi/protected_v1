// controllers/ProfileController.js
const { User, UserProfile, UserPrivacySettings, UserGamification, sequelize } = require('../model');
const fileStorageService = require('../services/FileStorageService');

/**
 * Get user profile (public or own)
 */
exports.getProfile = async (req, res, next) => {
    try {
        // If route is /users/profile (no ID), assume it's the logged-in user
        // Otherwise, use the ID from params
        const targetUserId = req.params.id || req.user?.id;
        const requesterId = req.user?.id;

        if (!targetUserId) {
             return res.status(400).json({
                message: 'No user ID specified'
            });
        }

        // Find target user
        const targetUser = await User.findByPk(targetUserId, {
            include: [
                {
                    model: UserProfile,
                    as: 'profile'
                },
                {
                    model: UserPrivacySettings,
                    as: 'privacySettings'
                },
                {
                    model: UserGamification,
                    as: 'gamification'
                }
            ]
        });

        if (!targetUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if user is deactivated or deleted
        if (targetUser.account_status !== 'active') {
            return res.status(403).json({
                message: 'This account is no longer available'
            });
        }

        // Viewing own profile - return full info
        if (targetUserId == requesterId) {
            return res.json({
                id: targetUser.id,
                email: targetUser.email,
                name: targetUser.name,
                role: targetUser.role,
                avatar_url: targetUser.getAvatarUrl(), // Uses method from User model
                is_profile_public: targetUser.is_profile_public,
                account_status: targetUser.account_status,
                created_at: targetUser.created_at,
                gamification: targetUser.gamification ? {
                    experience_points: targetUser.gamification.experience_points,
                    current_title: targetUser.gamification.current_title,
                    total_points: targetUser.gamification.total_points
                } : null,
                profile: targetUser.profile ? {
                    display_name: targetUser.profile.display_name,
                    bio: targetUser.profile.bio,
                    date_of_birth: targetUser.profile.date_of_birth,
                    sex: targetUser.profile.sex,
                    gender_identity: targetUser.profile.gender_identity,
                    phone_number: targetUser.profile.phone_number,
                    address: {
                        line1: targetUser.profile.address_line1,
                        line2: targetUser.profile.address_line2,
                        city: targetUser.profile.city,
                        province: targetUser.profile.province,
                        postal_code: targetUser.profile.postal_code,
                        country: targetUser.profile.country
                    },
                    emergency_contact: {
                        name: targetUser.profile.emergency_contact_name,
                        relationship: targetUser.profile.emergency_contact_relationship,
                        phone: targetUser.profile.emergency_contact_phone
                    }
                } : null,
                privacy_settings: targetUser.privacySettings || null
            });
        }

        // Viewing another user's profile
        // Check if profile is public
        if (!targetUser.is_profile_public) {
            return res.status(403).json({
                message: 'This profile is private'
            });
        }

        // Return public profile info only
        return res.json({
            id: targetUser.id,
            display_name: targetUser.profile?.display_name || targetUser.name,
            bio: targetUser.profile?.bio || null,
            sex: targetUser.profile?.sex || null,
            avatar_url: targetUser.getAvatarUrl(),
            is_profile_public: true,
            achievements: [] // TODO: Load from achievements table
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            username, // Map from frontend 'username' to backend 'name'
            display_name,
            bio,
            date_of_birth,
            sex,
            gender_identity,
            phone_number,
            address,
            emergency_contact
        } = req.body;

        // Transaction for atomicity
        const transaction = await sequelize.transaction();

        try {
            // Find user and profile
            const user = await User.findByPk(userId, { transaction });
            let profile = await UserProfile.findOne({ where: { user_id: userId }, transaction });

            if (!user) {
                await transaction.rollback();
                return res.status(404).json({ message: 'User not found' });
            }

            // Handle Username Change
            if (username && username !== user.name) {
                // Check if username is taken
                const existingUser = await User.findOne({ 
                    where: { name: username },
                    transaction 
                });

                if (existingUser) {
                    await transaction.rollback();
                    return res.status(400).json({ 
                        message: 'Username is already taken' 
                    });
                }

                user.name = username;
                await user.save({ transaction });
            }

            if (!profile) {
                profile = await UserProfile.create({ user_id: userId }, { transaction });
            }

            // Update profile fields
            if (display_name !== undefined) profile.display_name = display_name;
            if (bio !== undefined) profile.bio = bio;
            if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth;
            if (sex !== undefined) profile.sex = sex;
            if (gender_identity !== undefined) profile.gender_identity = gender_identity;
            if (phone_number !== undefined) profile.phone_number = phone_number;

            // Update address fields
            if (address) {
                if (address.line1 !== undefined) profile.address_line1 = address.line1;
                if (address.line2 !== undefined) profile.address_line2 = address.line2;
                if (address.city !== undefined) profile.city = address.city;
                if (address.province !== undefined) profile.province = address.province;
                if (address.postal_code !== undefined) profile.postal_code = address.postal_code;
                if (address.country !== undefined) profile.country = address.country;
            }

            // Update emergency contact
            if (emergency_contact) {
                if (emergency_contact.name !== undefined) {
                    profile.emergency_contact_name = emergency_contact.name;
                }
                if (emergency_contact.relationship !== undefined) {
                    profile.emergency_contact_relationship = emergency_contact.relationship;
                }
                if (emergency_contact.phone !== undefined) {
                    profile.emergency_contact_phone = emergency_contact.phone;
                }
            }

            await profile.save({ transaction });
            await transaction.commit();

            res.json({
                message: 'Profile updated successfully',
                user: {
                    name: user.name,
                    email: user.email
                },
                profile: {
                    display_name: profile.display_name,
                    bio: profile.bio,
                    date_of_birth: profile.date_of_birth,
                    sex: profile.sex,
                    gender_identity: profile.gender_identity,
                    phone_number: profile.phone_number,
                    address: {
                        line1: profile.address_line1,
                        line2: profile.address_line2,
                        city: profile.city,
                        province: profile.province,
                        postal_code: profile.postal_code,
                        country: profile.country
                    },
                    emergency_contact: {
                        name: profile.emergency_contact_name,
                        relationship: profile.emergency_contact_relationship,
                        phone: profile.emergency_contact_phone
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Upload Avatar - WITH PROPER TRANSACTION & ERROR HANDLING
 */
exports.uploadAvatar = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Validate file exists
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded'
            });
        }

        // 2. Validate file (size, type, extension)
        const validation = fileStorageService.validateFile({
            buffer: req.file.buffer,
            size: req.file.size,
            mimetype: req.file.mimetype,
            originalFilename: req.file.originalname
        }, 'avatar');

        if (!validation.valid) {
            return res.status(400).json({
                message: 'File validation failed',
                errors: validation.errors
            });
        }

        // 3. Get user with lock (prevent race conditions)
        const user = await User.findByPk(req.user.id, {
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // 4. Store old avatar KEY (not URL) for cleanup
        const oldAvatarKey = user.avatar_key;

        // 5. Upload new avatar
        const result = await fileStorageService.uploadAvatar(
            req.file.buffer,
            user.id,
            oldAvatarKey  // Pass key, not URL
        );

        // 6. Update database with NEW KEY (not URL)
        user.avatar_key = result.key;  // Store ONLY the key
        await user.save({ transaction });

        // 7. Commit transaction
        await transaction.commit();

        // 8. Return URL for immediate display
        res.json({
            message: 'Avatar updated successfully',
            avatar_url: result.url,  // Frontend uses this
            avatar_key: result.key   // For debugging
        });

    } catch (error) {
        // Rollback on any error
        await transaction.rollback();

        console.error('Avatar upload error:', error);

        // Provide user-friendly error messages
        if (error.message.includes('File validation failed')) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.message.includes('Failed to upload')) {
            return res.status(500).json({
                message: 'Failed to upload avatar. Please try again.'
            });
        }

        next(error);
    }
};

/**
 * Delete Avatar - WITH PROPER CLEANUP
 */
exports.deleteAvatar = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Get user with lock
        const user = await User.findByPk(req.user.id, {
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Delete from R2 if exists
        if (user.avatar_key) {
            try {
                await fileStorageService.deleteFile(user.avatar_key);
            } catch (deleteError) {
                console.error('Failed to delete avatar from R2:', deleteError);
                // Continue anyway - update database even if R2 delete fails
            }
        }

        // 3. Clear avatar_key in database
        user.avatar_key = null;
        await user.save({ transaction });

        // 4. Commit transaction
        await transaction.commit();

        // 5. Return default avatar URL
        const defaultAvatarUrl = user.getAvatarUrl(); // Should return default

        res.json({
            message: 'Avatar removed successfully',
            avatar_url: defaultAvatarUrl
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = exports;