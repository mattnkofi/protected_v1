'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Indexes already exist from the table creation migrations
    // This is a no-op migration to mark the upgrade as complete
    return Promise.resolve();
  },

  down: async (queryInterface) => {
    // No-op
    return Promise.resolve();
  }
};
