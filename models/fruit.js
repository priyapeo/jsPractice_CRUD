const { DataTypes } = require('sequelize');
const db = require('../db');

const Fruit = db.define('Fruit', {
    // id:{
    // type: DataTypes.INTEGER,
    // primaryKey: true,
    // allowNull: false,
    // },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'fruits',
  timestamps: false,
});

module.exports = Fruit;
