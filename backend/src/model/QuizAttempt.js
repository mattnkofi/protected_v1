const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class QuizAttempt extends Model {}

    QuizAttempt.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        correct_answers: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_questions: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        time_taken: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'QuizAttempt',
        tableName: 'quiz_attempts',
        underscored: true, // Sinisiguro nito na 'created_at' ang gagamitin
        timestamps: true   // Naka-enable ang auto-timestamps para sa created_at/updated_at
    });

    return QuizAttempt;
};