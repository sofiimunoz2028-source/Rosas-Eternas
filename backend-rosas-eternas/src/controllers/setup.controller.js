const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { asyncHandler, httpError } = require('../middleware/error');

async function buildSql() {
  const sqlPath = path.join(__dirname, '../data/init.sql');
  let sql = fs.readFileSync(sqlPath, 'utf8');
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminRosas2026!', 10);
  const clienteHash = await bcrypt.hash(process.env.CLIENTE_PASSWORD || 'ClienteRosas2026!', 10);
  return sql
    .split('$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL_ADMIN').join(adminHash)
    .split('$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL_CLIENTE').join(clienteHash);
}

exports.setup = asyncHandler(async (req, res) => {
  const key = req.headers['x-setup-key'] || req.query.key;
  if (!process.env.JWT_SECRET || key !== process.env.JWT_SECRET) {
    throw httpError(404, 'Ruta no encontrada');
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: Number(process.env.MYSQL_ADDON_PORT || 3306),
    multipleStatements: true,
    charset: 'utf8mb4',
    connectTimeout: 20000,
    ssl: process.env.MYSQL_SSL === '1' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const [tables] = await connection.query("SHOW TABLES LIKE 'roles'");
    if (tables.length) {
      return res.json({ ok: true, mensaje: 'La base ya estaba inicializada' });
    }
    await connection.query(await buildSql());
    res.json({ ok: true, mensaje: 'Base de datos inicializada' });
  } finally {
    await connection.end();
  }
});
