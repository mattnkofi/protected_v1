// backend/src/model/Announcement.js
module.exports = (sequelize, DataTypes) => {
    const Announcement = sequelize.define('Announcement', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        title: { 
            type: DataTypes.STRING(255), 
            allowNull: false 
        },
        content: { 
            type: DataTypes.TEXT, 
            allowNull: false 
        },
        type: { 
            type: DataTypes.ENUM('public', 'classroom'), 
            defaultValue: 'public',
            allowNull: false,
            comment: 'public = admin announcements, classroom = facilitator announcements'
        },
        classroom_id: { 
            type: DataTypes.INTEGER, 
            allowNull: true,
            comment: 'Only set for classroom type announcements'
        },
        created_by: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        priority: { 
            type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'), 
            defaultValue: 'normal',
            allowNull: false
        },
        status: { 
            type: DataTypes.ENUM('active', 'archived'), 
            defaultValue: 'active',
            allowNull: false
        },
        expires_at: { 
            type: DataTypes.DATE, 
            allowNull: true,
            comment: 'Optional expiry date for announcements'
        }
    }, { 
        underscored: true,
        tableName: 'Announcements',
        timestamps: true
    });

    Announcement.associate = (models) => {
        // Created by user (admin or facilitator)
        Announcement.belongsTo(models.User, { 
            foreignKey: 'created_by', 
            as: 'author' 
        });

        // Related classroom (for classroom announcements)
        Announcement.belongsTo(models.Classroom, { 
            foreignKey: 'classroom_id', 
            as: 'classroom' 
        });
    };

    return Announcement;
};
