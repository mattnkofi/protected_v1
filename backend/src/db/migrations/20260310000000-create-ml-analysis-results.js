'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ml_analysis_results', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quiz_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'quizzes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quiz_attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'quiz_attempts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      analysis_results: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of per-answer analysis objects'
      },
      overall_risk_level: {
        type: Sequelize.ENUM('Low', 'Moderate', 'High', 'Severe'),
        allowNull: false,
        defaultValue: 'Low'
      },
      dominant_category: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Neutral / Unclassified'
      },
      category_breakdown: {
        type: Sequelize.JSON,
        allowNull: true
      },
      total_answers_analyzed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      concerning_answers_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      flags_detected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      reviewed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      facilitator_notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add indexes for efficient querying
    await queryInterface.addIndex('ml_analysis_results', ['user_id']);
    await queryInterface.addIndex('ml_analysis_results', ['quiz_id']);
    await queryInterface.addIndex('ml_analysis_results', ['overall_risk_level']);
    await queryInterface.addIndex('ml_analysis_results', ['flags_detected']);
    await queryInterface.addIndex('ml_analysis_results', ['reviewed']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ml_analysis_results');
  }
};
