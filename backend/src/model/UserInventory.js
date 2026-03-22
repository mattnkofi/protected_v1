module.exports = (sequelize, DataTypes) => {
    const UserInventory = sequelize.define('UserInventory', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        badge_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        claimed_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_inventories',
        underscored: true,
        timestamps: false
    });

    return UserInventory;
};