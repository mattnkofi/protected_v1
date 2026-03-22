module.exports = (sequelize, DataTypes) => {
    const ClassroomMember = sequelize.define('ClassroomMember', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        classroom_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        user_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        }
        // Tinanggal ang joined_at field dito
    }, { 
        tableName: 'classroom_members', 
        underscored: true, // Ito ang gagawa ng created_at at updated_at sa DB
        timestamps: true
    });
        ClassroomMember.associate = (models) => {
            ClassroomMember.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'student'
            });
            ClassroomMember.belongsTo(models.Classroom, {
                foreignKey: 'classroom_id',
                as: 'classroom'
            });
        };  

    return ClassroomMember;
};