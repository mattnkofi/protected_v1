'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed Title ranks based on XP thresholds
    await queryInterface.bulkInsert('titles', [
      { name: 'Novice', exp_required: 0, created_at: new Date(), updated_at: new Date() },
      { name: 'Learner', exp_required: 100, created_at: new Date(), updated_at: new Date() },
      { name: 'Scholar', exp_required: 300, created_at: new Date(), updated_at: new Date() },
      { name: 'Expert', exp_required: 600, created_at: new Date(), updated_at: new Date() },
      { name: 'Master', exp_required: 1000, created_at: new Date(), updated_at: new Date() },
      { name: 'Champion', exp_required: 1500, created_at: new Date(), updated_at: new Date() },
      { name: 'Legend', exp_required: 2500, created_at: new Date(), updated_at: new Date() },
      { name: 'Grandmaster', exp_required: 4000, created_at: new Date(), updated_at: new Date() },
      { name: 'Mythic', exp_required: 6000, created_at: new Date(), updated_at: new Date() },
      { name: 'Immortal', exp_required: 10000, created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('titles', null, {});
  }
};