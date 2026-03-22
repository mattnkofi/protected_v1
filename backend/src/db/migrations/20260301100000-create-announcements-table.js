'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Announcements', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            type: {
                type: Sequelize.ENUM('public', 'classroom'),
                defaultValue: 'public',
                allowNull: false,
                comment: 'public = admin announcements, classroom = facilitator announcements'
            },
            classroom_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Classrooms',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Only set for classroom type announcements'
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            priority: {
                type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
                defaultValue: 'normal',
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('active', 'archived'),
                defaultValue: 'active',
                allowNull: false
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Optional expiry date for announcements'
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Create index for faster queries
        await queryInterface.addIndex('Announcements', ['type', 'status']);
        await queryInterface.addIndex('Announcements', ['classroom_id']);
        await queryInterface.addIndex('Announcements', ['created_by']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Announcements');
    }
};
