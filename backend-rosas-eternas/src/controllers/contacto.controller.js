const { query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.enviar = asyncHandler(async (req, res) => {
  const { nombre, email, telefono, asunto, mensaje } = req.body || {};
  if (!nombre || !email || !mensaje) throw httpError(400, 'Nombre, correo y mensaje son obligatorios');
  if (!validEmail(email)) throw httpError(400, 'Correo no válido');
  await query(
    'INSERT INTO mensajes_contacto (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)',
    [nombre.trim(), email.trim().toLowerCase(), telefono?.trim() || null, asunto?.trim() || null, mensaje.trim()],
  );
  res.status(201).json({ ok: true, mensaje: 'Recibimos tu mensaje. Te responderemos pronto.' });
});
