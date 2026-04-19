'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('resource_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      type: {
        type: Sequelize.ENUM('talk', 'training', 'seminar', 'guide', 'policy', 'other'),
        allowNull: false,
        defaultValue: 'other'
      },
      link_url: { type: Sequelize.STRING(500), allowNull: false },
      campus_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'campuses', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('resource_items', ['campus_id']);
    await queryInterface.addIndex('resource_items', ['type']);
    await queryInterface.addIndex('resource_items', ['is_active']);
  },

  async down (queryInterface) {
    await queryInterface.dropTable('resource_items');
  }
};
