'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('campuses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      code: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      location: { type: Sequelize.STRING(255) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('campuses');
  }
};
