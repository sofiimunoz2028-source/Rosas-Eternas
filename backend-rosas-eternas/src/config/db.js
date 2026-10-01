require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: Number(process.env.MYSQL_ADDON_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 20000,
  namedPlaceholders: true,
  timezone: 'Z',
  charset: 'utf8mb4',
  ssl: process.env.MYSQL_SSL === '1' ? { rejectUnauthorized: false } : undefined,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };
