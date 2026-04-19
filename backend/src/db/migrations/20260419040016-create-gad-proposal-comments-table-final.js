'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('gad_proposal_comments')) {
      return;
    }

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
    await queryInterface.addIndex('gad_proposal_comments', ['proposal_id'], { name: 'idx_gad_proposal_comments_proposal_id' });
    await queryInterface.addIndex('gad_proposal_comments', ['admin_id'], { name: 'idx_gad_proposal_comments_admin_id' });
  },

  async down (queryInterface, Sequelize) {
    // Check if table exists before dropping
    const tables = await queryInterface.showAllTables();
    if (tables.includes('gad_proposal_comments')) {
      await queryInterface.dropTable('gad_proposal_comments');
    }
  }
};
