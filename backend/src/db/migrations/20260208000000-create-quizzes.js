'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Quizzes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quiz_type: {
        type: Sequelize.ENUM('time_attack', 'streak', 'boss_battle'),
        allowNull: false,
        defaultValue: 'time_attack'
      },
      // This column logs the array of questions, choices, and correct answers
      questions_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Stores array of objects: { question: string, options: string[], correctAnswer: number }'
      },
      time_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        comment: 'Seconds per question'
      },
      points_per_question: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Quizzes');
  }
};