'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is a placeholder for HGDG assessments
    // Create table for HGDG assessments
    await queryInterface.createTable('hgdg_assessments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      proposal_id: { type: Sequelize.INTEGER, allowNull: false },
      assessment_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('hgdg_assessments');
  }
};
