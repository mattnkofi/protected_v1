module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Modules', 'classroom_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Null kung public module
      references: { model: 'Classrooms', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Modules', 'classroom_id');
  }
};