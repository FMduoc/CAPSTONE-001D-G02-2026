const { Pool } = require('pg');
require('dotenv').config();
// CREDENCIALES DE .ENV. VA EN EL ROOT DEL BACKEND
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // DB_SSL es para conectar con Render.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;