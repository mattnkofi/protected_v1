// backend/src/model/GADScoringCriteria.js
module.exports = (sequelize, DataTypes) => {
    const GADScoringCriteria = sequelize.define('GADScoringCriteria', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        criteria_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: 'Name of the scoring criterion (e.g., "Gender Inclusivity", "Fairness")'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Detailed description of what this criteria evaluates'
        },
        max_points: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            allowNull: false,
            comment: 'Maximum points for this criterion'
        },
        guidelines: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'JSON guidelines for scoring (e.g., threshold values, examples)'
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 1.0,
            comment: 'Weight multiplier for this criterion in total score'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Whether this criterion is active for new evaluations'
        }
    }, {
        tableName: 'gad_scoring_criteria',
        timestamps: true,
        underscored: true
    });

    return GADScoringCriteria;
};
