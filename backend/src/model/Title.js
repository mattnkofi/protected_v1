module.exports = (sequelize, DataTypes) => {
    const Title = sequelize.define('Title', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exp_required: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'titles',
        underscored: true
    });

    return Title;
};