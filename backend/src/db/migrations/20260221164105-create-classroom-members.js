// backend/src/db/migrations/20260221164105-create-classroom-members.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('classroom_members', {
      id: { alignAllowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      classroom_id: { type: Sequelize.INTEGER, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      joined_at: { // Siguraduhin na nandito ito
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('classroom_members');
  }
};