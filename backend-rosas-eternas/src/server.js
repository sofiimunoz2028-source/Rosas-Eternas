require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const port = Number(process.env.PORT || 4000);

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en las variables de entorno');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`API Rosas Eternas en http://localhost:${port}`);
});

pool.query('SELECT 1')
  .then(() => console.log('MySQL conectado'))
  .catch((err) => {
    console.error('No se pudo conectar a MySQL:', err.message);
    console.error('En Clever Cloud autoriza tu IP (o 0.0.0.0/0 para pruebas). El puerto 3306 debe estar abierto.');
  });
