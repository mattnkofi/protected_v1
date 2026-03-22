'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns exist before adding them
    const tableDesc = await queryInterface.describeTable('badges');
    
    if (!tableDesc.name) {
      await queryInterface.addColumn('badges', 'name', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!tableDesc.description) {
      await queryInterface.addColumn('badges', 'description', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
    
    if (!tableDesc.cost_xp) {
      await queryInterface.addColumn('badges', 'cost_xp', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('badges');
    
    if (tableDesc.name) {
      await queryInterface.removeColumn('badges', 'name');
    }
    if (tableDesc.description) {
      await queryInterface.removeColumn('badges', 'description');
    }
    if (tableDesc.cost_xp) {
      await queryInterface.removeColumn('badges', 'cost_xp');
    }
  }
};
