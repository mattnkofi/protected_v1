// backend/src/model/Campus.js
module.exports = (sequelize, DataTypes) => {
    const Campus = sequelize.define('Campus', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: 'Campus name (e.g., Main, North, South)'
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Short campus code (e.g., MAIN, NORTH, SOUTH)'
        },
        location: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Physical location/address of campus'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Whether campus is currently active'
        }
    }, {
        tableName: 'campuses',
        timestamps: true,
        underscored: true
    });

    return Campus;
};
