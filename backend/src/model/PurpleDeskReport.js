module.exports = (sequelize, DataTypes) => {
    const PurpleDeskReport = sequelize.define('PurpleDeskReport', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tracking_code: {
            type: DataTypes.STRING(24),
            allowNull: false,
            unique: true
        },
        campus_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        encrypted_payload: {
            type: DataTypes.JSON,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('submitted', 'in_review', 'resolved'),
            defaultValue: 'submitted'
        }
    }, {
        tableName: 'purple_desk_reports',
        timestamps: true,
        underscored: true
    });

    return PurpleDeskReport;
};
