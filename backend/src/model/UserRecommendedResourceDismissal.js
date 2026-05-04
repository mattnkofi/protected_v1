module.exports = (sequelize, DataTypes) => {
	const UserRecommendedResourceDismissal = sequelize.define('UserRecommendedResourceDismissal', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		item_key: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		dismissed_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		}
	}, {
		tableName: 'user_recommended_resource_dismissals',
		timestamps: true,
		underscored: true
	});

	return UserRecommendedResourceDismissal;
};
