'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const rawTables = await queryInterface.showAllTables();
        const tables = (rawTables || [])
            .map((t) => {
                if (typeof t === 'string') return t;
                if (!t || typeof t !== 'object') return '';
                return t.tableName || t.TABLE_NAME || t.name || t[0] || '';
            })
            .filter(Boolean)
            .map((t) => String(t).toLowerCase());

        if (!tables.includes('user_resource_dismissals')) {
            await queryInterface.createTable('user_resource_dismissals', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onDelete: 'CASCADE'
                },
                resource_item_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'resource_items',
                        key: 'id'
                    },
                    onDelete: 'CASCADE'
                },
                dismissed_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW
                },
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW
                }
            });
        }

        await queryInterface.addIndex('user_resource_dismissals', ['user_id', 'resource_item_id'], {
            name: 'uniq_user_resource_dismissals_user_resource',
            unique: true
        });
        await queryInterface.addIndex('user_resource_dismissals', ['user_id'], {
            name: 'idx_user_resource_dismissals_user_id'
        });
        await queryInterface.addIndex('user_resource_dismissals', ['resource_item_id'], {
            name: 'idx_user_resource_dismissals_resource_item_id'
        });
    },

    async down(queryInterface) {
        const rawTables = await queryInterface.showAllTables();
        const tables = (rawTables || [])
            .map((t) => {
                if (typeof t === 'string') return t;
                if (!t || typeof t !== 'object') return '';
                return t.tableName || t.TABLE_NAME || t.name || t[0] || '';
            })
            .filter(Boolean)
            .map((t) => String(t).toLowerCase());

        if (tables.includes('user_resource_dismissals')) {
            await queryInterface.dropTable('user_resource_dismissals');
        }
    }
};
