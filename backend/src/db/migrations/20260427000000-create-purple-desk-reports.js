'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('purple_desk_reports', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tracking_code: { type: Sequelize.STRING(24), allowNull: false, unique: true },
      campus_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'campuses', key: 'id' },
        onDelete: 'SET NULL'
      },
      category: { type: Sequelize.STRING(100), allowNull: true },
      encrypted_payload: { type: Sequelize.JSON, allowNull: false },
      status: {
        type: Sequelize.ENUM('submitted', 'in_review', 'resolved'),
        defaultValue: 'submitted'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('purple_desk_reports', ['tracking_code']);
    await queryInterface.addIndex('purple_desk_reports', ['campus_id']);
    await queryInterface.addIndex('purple_desk_reports', ['status']);
  },

  async down (queryInterface) {
    await queryInterface.dropTable('purple_desk_reports');
  }
};
