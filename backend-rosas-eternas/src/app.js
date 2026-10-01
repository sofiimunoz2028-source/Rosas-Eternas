require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const api = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.set('trust proxy', 1);

const allowed = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowed.length === 0) return callback(null, true);
    if (allowed.includes(origin) || allowed.includes('*')) return callback(null, true);
    if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const mount = express.Router();
mount.get('/salud', (req, res) => {
  res.json({ ok: true, servicio: 'rosas-eternas-api' });
});
mount.use(api);

app.use('/api', mount);
app.use(mount);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
