// server\src\model\badge.js
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Badge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Badge.init({
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: DataTypes.TEXT,
    iconPath: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'iconPath' // Keep original camelCase column name
    },
    cost_xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_slots: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    claimed_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt'
    }
  }, {
    sequelize,
    modelName: 'badge',
    tableName: 'badges',
    underscored: false, // Disable auto snake_case conversion
    timestamps: true
  });
  return Badge;
};