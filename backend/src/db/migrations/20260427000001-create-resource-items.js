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

		if (!tables.includes('resource_items')) {
			await queryInterface.createTable('resource_items', {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				title: {
					type: Sequelize.STRING(255),
					allowNull: false
				},
				description: {
					type: Sequelize.TEXT,
					allowNull: true
				},
				type: {
					type: Sequelize.ENUM('talk', 'training', 'seminar', 'guide', 'policy', 'other'),
					allowNull: false,
					defaultValue: 'other'
				},
				link_url: {
					type: Sequelize.STRING(500),
					allowNull: false
				},
				campus_id: {
					type: Sequelize.INTEGER,
					allowNull: true,
					references: {
						model: 'campuses',
						key: 'id'
					},
					onDelete: 'SET NULL'
				},
				created_by: {
					type: Sequelize.INTEGER,
					allowNull: true,
					references: {
						model: 'users',
						key: 'id'
					},
					onDelete: 'SET NULL'
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

		await queryInterface.addIndex('resource_items', ['campus_id'], {
			name: 'idx_resource_items_campus_id'
		});
		await queryInterface.addIndex('resource_items', ['type'], {
			name: 'idx_resource_items_type'
		});
		await queryInterface.addIndex('resource_items', ['created_by'], {
			name: 'idx_resource_items_created_by'
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

		if (tables.includes('resource_items')) {
			await queryInterface.dropTable('resource_items');
		}
	}
};
