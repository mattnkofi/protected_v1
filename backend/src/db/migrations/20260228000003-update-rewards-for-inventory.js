'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Dagdagan natin ng capacity at status ang rewards
    await queryInterface.addColumn('badges', 'total_slots', {
      type: Sequelize.INTEGER,
      defaultValue: 0, // 0 means unlimited kung hindi i-set ng facilitator
      allowNull: false
    });
    await queryInterface.addColumn('badges', 'claimed_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('badges', 'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // Facilitator ang mag-aactivate nito (Open Slot)
      allowNull: false
    });
    await queryInterface.addColumn('badges', 'min_exp_required', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('badges', 'total_slots');
    await queryInterface.removeColumn('badges', 'claimed_count');
    await queryInterface.removeColumn('badges', 'is_active');
    await queryInterface.removeColumn('badges', 'min_exp_required');
  }
};