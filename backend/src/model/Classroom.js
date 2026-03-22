// backend/src/model/Classroom.js
module.exports = (sequelize, DataTypes) => {
    const Classroom = sequelize.define('Classroom', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        name: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        description: { 
            type: DataTypes.TEXT 
        },
        join_code: { 
            type: DataTypes.STRING(10), 
            unique: true, 
            allowNull: false 
        },
        created_by: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            comment: 'ID of the Facilitator/Educator who created the class'
        },
        status: { 
            type: DataTypes.ENUM('active', 'archived'), 
            defaultValue: 'active' 
        }
    }, { 
        underscored: true,
        tableName: 'Classrooms',
        timestamps: true
    });

    Classroom.associate = (models) => {
        // Ang gumawa ng classroom (Facilitator)
        Classroom.belongsTo(models.User, { 
            foreignKey: 'created_by', 
            as: 'facilitator' 
        });

        // Mga estudyanteng naka-enroll sa classroom
        Classroom.belongsToMany(models.User, { 
        through: models.ClassroomMember, 
        foreignKey: 'classroom_id', 
        as: 'students' 
    });

        // BAGONG ASSOCIATION: Mga modules na kabilang sa classroom na ito
        // Pinapayagan nito ang pag-fetch ng modules via classroom.modules
        Classroom.hasMany(models.Module, { 
        foreignKey: 'classroom_id', 
        as: 'modules'
    });
    };

    return Classroom;
};