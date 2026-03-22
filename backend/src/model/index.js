// backend/src/model/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const db = {};

// 1. Initialize and Import ALL models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Session = require('./Session')(sequelize, Sequelize.DataTypes);
db.TokenBlacklist = require('./Tokenblacklist')(sequelize, Sequelize.DataTypes);
db.UserProfile = require('./UserProfile')(sequelize, Sequelize.DataTypes);
db.UserPrivacySettings = require('./UserPrivacySettings')(sequelize, Sequelize.DataTypes);
db.UserNotificationPreferences = require('./UserNotificationPreferences')(sequelize, Sequelize.DataTypes);
db.AccountDeletionRequest = require('./AccountDeletionrequest')(sequelize, Sequelize.DataTypes);
db.File = require('./File')(sequelize, Sequelize.DataTypes);
db.Module = require('./Module')(sequelize, Sequelize.DataTypes);
db.ModuleView = require('./ModuleView')(sequelize, Sequelize.DataTypes);

// Classroom / LMS Models
db.Classroom = require('./Classroom')(sequelize, Sequelize.DataTypes);
db.ClassroomMember = require('./ClassroomMember')(sequelize, Sequelize.DataTypes);

// Gamification Models
db.Quiz = require('./Quiz')(sequelize, Sequelize.DataTypes);
db.QuizAttempt = require('./QuizAttempt')(sequelize, Sequelize.DataTypes); 
db.UserGamification = require('./UserGamification')(sequelize, Sequelize.DataTypes);
db.Title = require('./Title')(sequelize, Sequelize.DataTypes);
db.Badge = require('./badge')(sequelize, Sequelize.DataTypes);
db.UserInventory = require('./UserInventory')(sequelize, Sequelize.DataTypes);
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
db.Announcement = require('./Announcement')(sequelize, Sequelize.DataTypes);

/**
 * 2. Manual Associations Fix
 * Dito natin ilalagay ang mga relasyon na kailangan para sa Leaderboard
 * para gumana ang include: [{ model: User, as: 'user' }] sa Controller.
 */
// Relasyon para sa Leaderboard (UserGamification -> User)
db.UserGamification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasOne(db.UserGamification, { foreignKey: 'user_id', as: 'gamification' });

// Relasyon para sa Quiz Results (QuizAttempt -> User)
db.QuizAttempt.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.QuizAttempt.belongsTo(db.Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// Relasyon para sa Rewards/Inventory (UserInventory -> User, Badge)
db.UserInventory.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.UserInventory.belongsTo(db.Badge, { foreignKey: 'badge_id', as: 'badge' });
db.User.hasMany(db.UserInventory, { foreignKey: 'user_id', as: 'inventory' });
db.Badge.hasMany(db.UserInventory, { foreignKey: 'badge_id', as: 'claims' });

// Relasyon para sa Notifications (Notification -> User)
db.Notification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications' });

// Relasyon para sa Announcements (inverse associations only - belongsTo is in model)
db.User.hasMany(db.Announcement, { foreignKey: 'created_by', as: 'announcements' });
db.Classroom.hasMany(db.Announcement, { foreignKey: 'classroom_id', as: 'classroomAnnouncements' });

// 3. Execute automatic associations (kung may .associate function ang models)
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        console.log(`[Database] Binding associations for: ${modelName}`);
        db[modelName].associate(db);
    }
});

// 4. Attach sequelize instance and library
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;