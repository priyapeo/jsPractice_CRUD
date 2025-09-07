require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  user: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'test_db'
});

module.exports = pool;
