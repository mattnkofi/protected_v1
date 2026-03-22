// backend/src/model/Notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'achievement',      // Badge earned, level up, title unlocked
        'quiz',            // Quiz completed, new quiz available
        'module',          // Module completed, new module
        'classroom',       // Classroom invite, announcement
        'reward',          // Reward claimed, coins earned
        'system',          // System announcements
        'reminder'         // Learning reminders
      ),
      allowNull: false,
      defaultValue: 'system'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'bell'  // Lucide icon name
    },
    action_url: {
      type: DataTypes.STRING(500),
      allowNull: true  // Optional link to go somewhere when clicked
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}  // Extra data (badge_id, quiz_id, etc.)
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['is_read'] },
      { fields: ['type'] },
      { fields: ['created_at'] }
    ]
  });

  // Associations are defined centrally in model/index.js
  // to avoid duplicates

  return Notification;
};
