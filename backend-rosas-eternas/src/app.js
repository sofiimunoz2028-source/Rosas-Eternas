require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const api = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/salud', (req, res) => {
  res.json({ ok: true, servicio: 'rosas-eternas-api' });
});

app.use('/api', api);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
