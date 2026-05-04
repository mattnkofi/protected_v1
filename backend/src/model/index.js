// backend/src/model/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const db = {};

// 1. Models
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
db.Classroom = require('./Classroom')(sequelize, Sequelize.DataTypes);
db.ClassroomMember = require('./ClassroomMember')(sequelize, Sequelize.DataTypes);
db.Quiz = require('./Quiz')(sequelize, Sequelize.DataTypes);
db.QuizAttempt = require('./QuizAttempt')(sequelize, Sequelize.DataTypes);
db.UserGamification = require('./UserGamification')(sequelize, Sequelize.DataTypes);
db.Title = require('./Title')(sequelize, Sequelize.DataTypes);
db.Badge = require('./badge')(sequelize, Sequelize.DataTypes);
db.UserInventory = require('./UserInventory')(sequelize, Sequelize.DataTypes);
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
db.Announcement = require('./Announcement')(sequelize, Sequelize.DataTypes);
db.PushSubscription = require('./PushSubscription')(sequelize, Sequelize.DataTypes);
db.MLAnalysisResult = require('./MLAnalysisResult')(sequelize, Sequelize.DataTypes);
db.Campus = require('./Campus')(sequelize, Sequelize.DataTypes);
db.PurpleDeskReport = require('./PurpleDeskReport')(sequelize, Sequelize.DataTypes);
db.ResourceItem = require('./ResourceItem')(sequelize, Sequelize.DataTypes);
db.UserResourceDismissal = require('./UserResourceDismissal')(sequelize, Sequelize.DataTypes);
db.UserRecommendedResourceDismissal = require('./UserRecommendedResourceDismissal')(sequelize, Sequelize.DataTypes);
db.GADProposal = require('./GADProposal')(sequelize, Sequelize.DataTypes);
db.GADProposalComment = require('./GADProposalComment')(sequelize, Sequelize.DataTypes);
db.GADScoringCriteria = require('./GADScoringCriteria')(sequelize, Sequelize.DataTypes);
db.GADScore = require('./GADScore')(sequelize, Sequelize.DataTypes);

// 2. Associations

// User ↔ Gamification
db.UserGamification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasOne(db.UserGamification, { foreignKey: 'user_id', as: 'gamification' });

// Quiz ↔ Module — defined inside Module.associate() / Quiz.associate().
// Removed from here to avoid duplicate alias error ("quizzes" conflict).

// QuizAttempt
db.QuizAttempt.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.QuizAttempt.belongsTo(db.Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
db.Quiz.hasMany(db.QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });

// UserInventory ↔ Badge
db.UserInventory.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.UserInventory.belongsTo(db.Badge, { foreignKey: 'badge_id', as: 'badge' });
db.User.hasMany(db.UserInventory, { foreignKey: 'user_id', as: 'inventory' });
db.Badge.hasMany(db.UserInventory, { foreignKey: 'badge_id', as: 'claims' });

// Notification ↔ User
db.Notification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications' });

// Announcement ↔ User / Classroom
// Announcement.belongsTo(User, 'author') and belongsTo(Classroom, 'classroom')
// are defined in Announcement.associate() — only keeping the inverse sides here
// since User and Classroom models have no associate() defining these.
db.User.hasMany(db.Announcement, { foreignKey: 'created_by', as: 'announcements' });
db.Classroom.hasMany(db.Announcement, { foreignKey: 'classroom_id', as: 'classroomAnnouncements' });

// PushSubscription ↔ User
db.PushSubscription.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasMany(db.PushSubscription, { foreignKey: 'user_id', as: 'pushSubscriptions' });

// Purple Desk ↔ Campus
db.PurpleDeskReport.belongsTo(db.Campus, { foreignKey: 'campus_id', as: 'campus' });
db.Campus.hasMany(db.PurpleDeskReport, { foreignKey: 'campus_id', as: 'purpleDeskReports' });

// Resource Center ↔ User, Campus
db.ResourceItem.belongsTo(db.User, { foreignKey: 'created_by', as: 'creator' });
db.User.hasMany(db.ResourceItem, { foreignKey: 'created_by', as: 'resourceItems' });
db.ResourceItem.belongsTo(db.Campus, { foreignKey: 'campus_id', as: 'campus' });
db.Campus.hasMany(db.ResourceItem, { foreignKey: 'campus_id', as: 'resourceItems' });

// Recommended Resource Dismissals ↔ User, ResourceItem
db.UserResourceDismissal.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasMany(db.UserResourceDismissal, { foreignKey: 'user_id', as: 'resourceDismissals' });
db.UserResourceDismissal.belongsTo(db.ResourceItem, { foreignKey: 'resource_item_id', as: 'resourceItem' });
db.ResourceItem.hasMany(db.UserResourceDismissal, { foreignKey: 'resource_item_id', as: 'dismissals' });

// Multi-source Recommended Resource Dismissals ↔ User
db.UserRecommendedResourceDismissal.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasMany(db.UserRecommendedResourceDismissal, { foreignKey: 'user_id', as: 'recommendedResourceDismissals' });

// GAD Module Associations
// GADProposal ↔ User, Campus
db.GADProposal.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.GADProposal.belongsTo(db.Campus, { foreignKey: 'campus_id', as: 'campus' });
db.GADProposal.belongsTo(db.User, { foreignKey: 'reviewed_by', as: 'reviewer' });
db.User.hasMany(db.GADProposal, { foreignKey: 'user_id', as: 'gadProposals' });
db.Campus.hasMany(db.GADProposal, { foreignKey: 'campus_id', as: 'proposals' });

// GADScore ↔ GADProposal, GADScoringCriteria, User
db.GADScore.belongsTo(db.GADProposal, { foreignKey: 'proposal_id', as: 'proposal' });
db.GADScore.belongsTo(db.GADScoringCriteria, { foreignKey: 'criteria_id', as: 'criteria' });
db.GADScore.belongsTo(db.User, { foreignKey: 'scored_by', as: 'evaluator' });
db.GADProposal.hasMany(db.GADScore, { foreignKey: 'proposal_id', as: 'scores' });
db.GADScoringCriteria.hasMany(db.GADScore, { foreignKey: 'criteria_id', as: 'scores' });

// GADProposalComment ↔ GADProposal, User
db.GADProposalComment.belongsTo(db.GADProposal, { foreignKey: 'proposal_id', as: 'proposal' });
db.GADProposalComment.belongsTo(db.User, { foreignKey: 'admin_id', as: 'admin' });
db.GADProposal.hasMany(db.GADProposalComment, { foreignKey: 'proposal_id', as: 'comments' });
db.User.hasMany(db.GADProposalComment, { foreignKey: 'admin_id', as: 'gadComments' });

// 3. Auto-associations from model files
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`[Database] Binding associations for: ${modelName}`);
    db[modelName].associate(db);
  }
});

// 4. Sequelize instances
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 5. Notification hooks (must be last — needs all models loaded)
const { registerNotificationHooks } = require('../utils/NotificationHooks');
registerNotificationHooks(db);

module.exports = db;