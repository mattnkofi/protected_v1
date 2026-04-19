'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to safely add index
    const safeAddIndex = async (table, columns, options) => {
      try {
        await queryInterface.addIndex(table, columns, options);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          throw error;
        }
        // Index already exists, which is fine
      }
    };

    // Add indices for gad_proposals table
    await safeAddIndex('gad_proposals', ['user_id'], {
      name: 'idx_gad_proposals_user_id'
    });

    await safeAddIndex('gad_proposals', ['campus_id'], {
      name: 'idx_gad_proposals_campus_id'
    });

    await safeAddIndex('gad_proposals', ['status'], {
      name: 'idx_gad_proposals_status'
    });

    // Composite index for common filtering
    await safeAddIndex('gad_proposals', ['status', 'campus_id'], {
      name: 'idx_gad_proposals_status_campus'
    });

    await safeAddIndex('gad_proposals', ['user_id', 'status'], {
      name: 'idx_gad_proposals_user_status'
    });

    // Add indices for gad_scores table
    await safeAddIndex('gad_scores', ['proposal_id'], {
      name: 'idx_gad_scores_proposal_id'
    });

    await safeAddIndex('gad_scores', ['criteria_id'], {
      name: 'idx_gad_scores_criteria_id'
    });

    await safeAddIndex('gad_scores', ['scored_by'], {
      name: 'idx_gad_scores_scored_by'
    });

    // Composite index for score lookups by proposal and criteria
    await safeAddIndex('gad_scores', ['proposal_id', 'criteria_id'], {
      name: 'idx_gad_scores_proposal_criteria'
    });
  },

  async down(queryInterface, Sequelize) {
    // Helper function to safely remove index
    const safeRemoveIndex = async (table, indexName) => {
      try {
        await queryInterface.removeIndex(table, indexName);
      } catch (error) {
        if (!error.message.includes('does not exist')) {
          throw error;
        }
        // Index doesn't exist, which is fine
      }
    };

    // Remove indices from gad_proposals
    await safeRemoveIndex('gad_proposals', 'idx_gad_proposals_user_id');
    await safeRemoveIndex('gad_proposals', 'idx_gad_proposals_campus_id');
    await safeRemoveIndex('gad_proposals', 'idx_gad_proposals_status');
    await safeRemoveIndex('gad_proposals', 'idx_gad_proposals_status_campus');
    await safeRemoveIndex('gad_proposals', 'idx_gad_proposals_user_status');

    // Remove indices from gad_scores
    await safeRemoveIndex('gad_scores', 'idx_gad_scores_proposal_id');
    await safeRemoveIndex('gad_scores', 'idx_gad_scores_criteria_id');
    await safeRemoveIndex('gad_scores', 'idx_gad_scores_scored_by');
    await safeRemoveIndex('gad_scores', 'idx_gad_scores_proposal_criteria');
  }
};
