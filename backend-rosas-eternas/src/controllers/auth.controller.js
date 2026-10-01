const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');
const { signToken, publicUser } = require('../middleware/auth');

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.register = asyncHandler(async (req, res) => {
  const { nombre, apellido, email, password, telefono, acepta_privacidad } = req.body || {};
  if (!nombre || !email || !password) {
    throw httpError(400, 'Nombre, correo y contraseña son obligatorios');
  }
  if (!validEmail(email)) throw httpError(400, 'Correo no válido');
  if (String(password).length < 8) throw httpError(400, 'La contraseña debe tener al menos 8 caracteres');
  if (!acepta_privacidad) throw httpError(400, 'Debes aceptar el aviso de privacidad');

  const exists = await query('SELECT id_usuario FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
  if (exists.length) throw httpError(409, 'Ya existe una cuenta con ese correo');

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono)
     VALUES (2, ?, ?, ?, ?, ?)`,
    [nombre.trim(), apellido?.trim() || null, email.trim().toLowerCase(), hash, telefono?.trim() || null],
  );

  const user = {
    id_usuario: result.insertId,
    nombre: nombre.trim(),
    apellido: apellido?.trim() || null,
    email: email.trim().toLowerCase(),
    telefono: telefono?.trim() || null,
    rol: 'cliente',
  };
  res.status(201).json({ token: signToken(user), usuario: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw httpError(400, 'Correo y contraseña son obligatorios');

  const rows = await query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.password_hash, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.email = ? AND u.activo = 1`,
    [email.trim().toLowerCase()],
  );
  const user = rows[0];
  const ok = user && await bcrypt.compare(password, user.password_hash);
  if (!ok) throw httpError(401, 'Correo o contraseña incorrectos');

  delete user.password_hash;
  res.json({ token: signToken(user), usuario: publicUser(user) });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ usuario: publicUser(req.user) });
});
