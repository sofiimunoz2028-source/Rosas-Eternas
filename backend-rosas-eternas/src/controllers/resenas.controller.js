const { query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');

exports.crear = asyncHandler(async (req, res) => {
  const { id_producto, calificacion, comentario } = req.body || {};
  const stars = Number(calificacion);
  if (!id_producto || !stars || stars < 1 || stars > 5) {
    throw httpError(400, 'Calificación entre 1 y 5 obligatoria');
  }
  const comprado = await query(
    `SELECT 1 FROM pedidos pe
     JOIN detalle_pedido dp ON dp.id_pedido = pe.id_pedido
     WHERE pe.id_usuario = ? AND dp.id_producto = ? AND pe.estado = 'entregado' LIMIT 1`,
    [req.user.id_usuario, id_producto],
  );
  if (!comprado.length) throw httpError(403, 'Solo puedes reseñar productos de pedidos entregados');

  try {
    await query(
      'INSERT INTO resenas (id_usuario, id_producto, calificacion, comentario) VALUES (?, ?, ?, ?)',
      [req.user.id_usuario, id_producto, stars, comentario?.slice(0, 500) || null],
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'Ya dejaste una reseña de este producto');
    throw err;
  }
  res.status(201).json({ ok: true, mensaje: 'Tu reseña quedará visible cuando el administrador la apruebe' });
});
