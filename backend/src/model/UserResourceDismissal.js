module.exports = (sequelize, DataTypes) => {
    const UserResourceDismissal = sequelize.define('UserResourceDismissal', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        resource_item_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dismissed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_resource_dismissals',
        timestamps: true,
        underscored: true
    });

    return UserResourceDismissal;
};
