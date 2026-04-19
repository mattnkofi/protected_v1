'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('gad_scoring_criterias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      criteria_name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      max_points: { type: Sequelize.INTEGER, defaultValue: 10 },
      weight: { type: Sequelize.DECIMAL(5, 2), defaultValue: 1.0 },
      guidelines: { type: Sequelize.JSON },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('gad_scoring_criterias');
  }
};
