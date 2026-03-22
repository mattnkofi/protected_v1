module.exports = (sequelize, DataTypes) => {
    const UserGamification = sequelize.define('UserGamification', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        experience_points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        current_title: {
            type: DataTypes.STRING,
            defaultValue: 'Novice'
        },
        total_points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'user_gamifications',
        underscored: true
    });

    return UserGamification;
};