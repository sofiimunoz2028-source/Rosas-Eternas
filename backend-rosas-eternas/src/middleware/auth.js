const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { httpError } = require('./error');

function signToken(user) {
  return jwt.sign(
    { sub: user.id_usuario, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

async function optionalAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const rows = await query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ? AND u.activo = 1`,
      [payload.sub],
    );
    req.user = rows[0] || null;
    next();
  } catch {
    next();
  }
}

async function requireAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) throw httpError(401, 'Debes iniciar sesión');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const rows = await query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ? AND u.activo = 1`,
      [payload.sub],
    );
    if (!rows[0]) throw httpError(401, 'Sesión no válida');
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.status) return next(err);
    next(httpError(401, 'Sesión no válida'));
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'administrador') {
    return next(httpError(403, 'No tienes permisos de administrador'));
  }
  next();
}

function publicUser(user) {
  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    telefono: user.telefono,
    rol: user.rol,
  };
}

module.exports = {
  signToken, optionalAuth, requireAuth, requireAdmin, publicUser,
};
