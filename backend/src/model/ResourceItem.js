module.exports = (sequelize, DataTypes) => {
	const ResourceItem = sequelize.define('ResourceItem', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		title: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		type: {
			type: DataTypes.ENUM('talk', 'training', 'seminar', 'guide', 'policy', 'other'),
			allowNull: false,
			defaultValue: 'other'
		},
		link_url: {
			type: DataTypes.STRING(500),
			allowNull: false
		},
		campus_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		created_by: {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	}, {
		tableName: 'resource_items',
		timestamps: true,
		underscored: true
	});

	return ResourceItem;
};
