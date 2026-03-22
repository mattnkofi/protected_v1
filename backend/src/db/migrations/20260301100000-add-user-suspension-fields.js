'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Modify account_status ENUM to include new statuses
    await queryInterface.sequelize.query(`
      ALTER TABLE Users 
      MODIFY COLUMN account_status 
      ENUM('active', 'deactivated', 'suspended', 'banned', 'pending_deletion', 'deleted') 
      DEFAULT 'active' NOT NULL
    `);

    // Add suspended_until column
    await queryInterface.addColumn('Users', 'suspended_until', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'End date for temporary suspension'
    });

    // Add suspension_reason column
    await queryInterface.addColumn('Users', 'suspension_reason', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Reason for suspension or ban'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns
    await queryInterface.removeColumn('Users', 'suspended_until');
    await queryInterface.removeColumn('Users', 'suspension_reason');

    // Revert ENUM (note: this may fail if there are suspended/banned users)
    await queryInterface.sequelize.query(`
      ALTER TABLE Users 
      MODIFY COLUMN account_status 
      ENUM('active', 'deactivated', 'pending_deletion', 'deleted') 
      DEFAULT 'active' NOT NULL
    `);
  }
};
