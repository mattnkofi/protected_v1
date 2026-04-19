'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gad_proposal_comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      proposal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'gad_proposals',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      comment_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      comment_type: {
        type: Sequelize.ENUM('feedback', 'question', 'suggestion', 'issue'),
        defaultValue: 'feedback'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes for performance
    await queryInterface.addIndex('gad_proposal_comments', ['proposal_id']);
    await queryInterface.addIndex('gad_proposal_comments', ['admin_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('gad_proposal_comments');
  }
};
