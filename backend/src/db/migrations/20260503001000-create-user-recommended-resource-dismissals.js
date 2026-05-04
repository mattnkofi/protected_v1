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

		if (!tables.includes('user_recommended_resource_dismissals')) {
			await queryInterface.createTable('user_recommended_resource_dismissals', {
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
				item_key: {
					type: Sequelize.STRING(255),
					allowNull: false
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

		await queryInterface.addIndex('user_recommended_resource_dismissals', ['user_id', 'item_key'], {
			name: 'uniq_user_recommended_resource_dismissals_user_key',
			unique: true
		});
		await queryInterface.addIndex('user_recommended_resource_dismissals', ['user_id'], {
			name: 'idx_user_recommended_resource_dismissals_user_id'
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

		if (tables.includes('user_recommended_resource_dismissals')) {
			await queryInterface.dropTable('user_recommended_resource_dismissals');
		}
	}
};
