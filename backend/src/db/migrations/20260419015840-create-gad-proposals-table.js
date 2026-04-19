'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('gad_proposals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      campus_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'campuses', key: 'id' },
        onDelete: 'RESTRICT'
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      status: { 
        type: Sequelize.ENUM('submitted', 'under_review', 'rejected_with_feedback', 'revised', 'approved', 'approved_final'),
        defaultValue: 'submitted'
      },
      gfl_issues: { type: Sequelize.JSON },
      admin_feedback: { type: Sequelize.TEXT },
      file_key: { type: Sequelize.STRING(500) },
      reviewed_by: { type: Sequelize.INTEGER },
      reviewed_date: { type: Sequelize.DATE },
      submission_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('gad_proposals', ['user_id']);
    await queryInterface.addIndex('gad_proposals', ['campus_id']);
    await queryInterface.addIndex('gad_proposals', ['status']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('gad_proposals');
  }
};
