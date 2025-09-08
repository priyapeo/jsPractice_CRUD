const { DataTypes } = require('sequelize');
const db = require('../db');
const Fruit = require('./fruit');

const Color = db.define('Color', {
    // id:{
    // type: DataTypes.INTEGER,
    // primaryKey: true,
    // allowNull: false,
    // },
    fruit_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'colors',
  timestamps: false,
});

// Associations
Fruit.hasMany(Color, { foreignKey: 'fruit_id' });
Color.belongsTo(Fruit, { foreignKey: 'fruit_id' });

module.exports = Color;
