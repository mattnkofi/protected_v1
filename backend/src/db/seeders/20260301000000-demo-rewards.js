'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if any badges exist first to avoid meaningful duplicates if run multiple times
    // But seeders usually run once.
    // We will clear existing badges to be safe or just insert.
    // Let's insert some demo rewards
    await queryInterface.bulkInsert('badges', [
      {
        name: 'Cool Sticker Pack',
        description: 'A set of holographic stickers for your laptop.',
        iconPath: '/uploads/stickers.png', // Placeholder
        cost_xp: 500,
        total_slots: 100,
        claimed_count: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Extra Notebook',
        description: 'A high-quality notebook for your studies.',
        iconPath: '/uploads/notebook.png', // Placeholder
        cost_xp: 1200,
        total_slots: 50,
        claimed_count: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Campus Coffee Voucher',
        description: 'One free coffee at the campus cafe.',
        iconPath: '/uploads/coffee.png', // Placeholder
        cost_xp: 800,
        total_slots: 200,
        claimed_count: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Limited Edition T-Shirt',
        description: 'Official GAD department t-shirt.',
        iconPath: '/uploads/tshirt.png', // Placeholder
        cost_xp: 5000,
        total_slots: 20,
        claimed_count: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mystery Box',
        description: 'Contains a random assortment of goodies.',
        iconPath: '/uploads/mystery.png', // Placeholder
        cost_xp: 2500,
        total_slots: 10,
        claimed_count: 0,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('badges', null, {});
  }
};
