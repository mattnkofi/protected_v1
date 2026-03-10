// backend/src/model/MLAnalysisResult.js
module.exports = (sequelize, DataTypes) => {
    const MLAnalysisResult = sequelize.define('MLAnalysisResult', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Quizzes',
                key: 'id'
            }
        },
        quiz_attempt_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'quiz_attempts',
                key: 'id'
            }
        },
        // Per-answer detailed analysis stored as JSON array
        analysis_results: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'Array of { answer_text, category, risk_level, behaviors, detection_method }'
        },
        // Summary fields for easy querying
        overall_risk_level: {
            type: DataTypes.ENUM('Low', 'Moderate', 'High', 'Severe'),
            allowNull: false,
            defaultValue: 'Low'
        },
        dominant_category: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'Neutral / Unclassified'
        },
        category_breakdown: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: '{ "category_name": count, ... }'
        },
        total_answers_analyzed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        concerning_answers_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        flags_detected: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        // Track if facilitator has reviewed this
        reviewed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        reviewed_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        reviewed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        facilitator_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'ml_analysis_results'
    });

    MLAnalysisResult.associate = function (models) {
        MLAnalysisResult.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'student'
        });
        MLAnalysisResult.belongsTo(models.User, {
            foreignKey: 'reviewed_by',
            as: 'reviewer'
        });
        MLAnalysisResult.belongsTo(models.Quiz, {
            foreignKey: 'quiz_id',
            as: 'quiz'
        });
        MLAnalysisResult.belongsTo(models.QuizAttempt, {
            foreignKey: 'quiz_attempt_id',
            as: 'attempt'
        });
    };

    return MLAnalysisResult;
};
