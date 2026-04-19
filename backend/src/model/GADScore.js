// backend/src/model/GADScore.js
module.exports = (sequelize, DataTypes) => {
    const GADScore = sequelize.define('GADScore', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        proposal_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to GADProposal'
        },
        criteria_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to GADScoringCriteria'
        },
        scored_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Admin/evaluator who gave the score'
        },
        points_awarded: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Points awarded for this criterion'
        },
        evaluator_comment: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Evaluator comments for this specific criterion'
        },
        scored_date: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        }
    }, {
        tableName: 'gad_scores',
        timestamps: true,
        underscored: true
    });

    return GADScore;
};
