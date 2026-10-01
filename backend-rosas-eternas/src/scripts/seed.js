require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function buildSql() {
  const sqlPath = path.join(__dirname, '../../../docs/04_base_de_datos.sql');
  let sql = fs.readFileSync(sqlPath, 'utf8');
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminRosas2026!', 10);
  const clienteHash = await bcrypt.hash(process.env.CLIENTE_PASSWORD || 'ClienteRosas2026!', 10);
  sql = sql.split('$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL_ADMIN').join(adminHash);
  sql = sql.split('$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL_CLIENTE').join(clienteHash);
  const out = path.join(__dirname, 'seed-listo.sql');
  fs.writeFileSync(out, sql);
  console.log('SQL listo para importar en la consola de Clever Cloud:', out);
  return sql;
}

async function main() {
  const sql = await buildSql();
  if (process.argv.includes('--sql-only')) return;
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
  console.log('Aplicando esquema en Clever Cloud…');
  await connection.query(sql);
  await connection.end();
  console.log('Base de datos lista.');
}

main().catch((err) => {
  console.error(err.message);
  console.error('Si el puerto 3306 está bloqueado, importa backend-rosas-eternas/src/scripts/seed-listo.sql desde la consola MySQL de Clever Cloud.');
  process.exit(1);
});
