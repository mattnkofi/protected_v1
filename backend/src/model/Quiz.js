// backend/src/model/Quiz.js
module.exports = (sequelize, DataTypes) => {
    const Quiz = sequelize.define('Quiz', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        module_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { 
                model: 'Modules', 
                key: 'id' 
            }
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        quiz_type: { 
            type: DataTypes.ENUM('time_attack', 'streak', 'boss_battle'),
            allowNull: false,
            defaultValue: 'time_attack' 
        },
        questions_data: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'Array of {question, options, correctAnswer, explanation}'
        },
        time_limit: { 
            type: DataTypes.INTEGER, 
            defaultValue: 30,
            comment: 'Seconds allowed per question'
        },
        points_per_question: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'Quizzes'
    });

    Quiz.associate = function (models) {
        // Link to the reference module
        Quiz.belongsTo(models.Module, {
            foreignKey: 'module_id',
            as: 'module',
            onDelete: 'CASCADE'
        });

        // Link to the facilitator who created it
        Quiz.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'creator'
        });
    };

    return Quiz;
};