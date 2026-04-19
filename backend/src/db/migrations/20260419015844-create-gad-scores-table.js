'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('gad_scores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      proposal_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'gad_proposals', key: 'id' },
        onDelete: 'CASCADE'
      },
      criteria_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'gad_scoring_criterias', key: 'id' },
        onDelete: 'RESTRICT'
      },
      scored_by: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'RESTRICT'
      },
      points_awarded: { type: Sequelize.INTEGER, defaultValue: 0 },
      evaluator_comment: { type: Sequelize.TEXT },
      scored_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('gad_scores', ['proposal_id']);
    await queryInterface.addIndex('gad_scores', ['criteria_id']);
    await queryInterface.addIndex('gad_scores', ['scored_by']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('gad_scores');
  }
};
