// require('dotenv').config();
// const { Pool } = require('pg');

// // Create a connection pool
// const pool = new Pool({
//   user: 'postgres',
//   password: 'password',
//   host: 'localhost',
//   port: 5432, // default Postgres port
//   database: 'test_db'
// });

// module.exports = pool;



require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('test_db', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Turn on for debugging raw SQL
});

module.exports = sequelize;
