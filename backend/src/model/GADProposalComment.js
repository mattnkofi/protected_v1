// backend/src/model/GADProposalComment.js
module.exports = (sequelize, DataTypes) => {
    const GADProposalComment = sequelize.define('GADProposalComment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        proposal_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to GAD Proposal'
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Admin who added the comment'
        },
        comment_text: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Comment content'
        },
        comment_type: {
            type: DataTypes.ENUM('feedback', 'question', 'suggestion', 'issue'),
            defaultValue: 'feedback',
            comment: 'Type of comment for categorization'
        }
    }, {
        tableName: 'gad_proposal_comments',
        timestamps: true,
        underscored: true
    });

    return GADProposalComment;
};
