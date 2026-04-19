// backend/src/model/GADProposal.js
module.exports = (sequelize, DataTypes) => {
    const GADProposal = sequelize.define('GADProposal', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'User who submitted the proposal'
        },
        campus_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Campus where proposal is from'
        },
        title: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: 'Title of the gender-responsive project proposal'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Full description of the project'
        },
        file_key: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Cloudflare R2 file key for proposal document'
        },
        status: {
            type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected_with_feedback', 'revised', 'approved_final'),
            defaultValue: 'submitted',
            comment: 'Current status of proposal'
        },
        admin_feedback: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Admin justification/recommendations for improvements'
        },
        gfl_issues: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Gender-Fair Language issues detected'
        },
        submission_date: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        reviewed_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Admin who reviewed the proposal'
        },
        reviewed_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Date when proposal was reviewed'
        }
    }, {
        tableName: 'gad_proposals',
        timestamps: true,
        underscored: true
    });

    return GADProposal;
};
