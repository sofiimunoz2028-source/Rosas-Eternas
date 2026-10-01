const { query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');

exports.listar = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT c.id_producto, c.nombre, c.slug, c.imagen_principal, c.precio, c.precio_final, c.descuento_pct
     FROM favoritos f JOIN v_catalogo c ON c.id_producto = f.id_producto
     WHERE f.id_usuario = ?
     ORDER BY f.creado_en DESC`,
    [req.user.id_usuario],
  );
  res.json(rows);
});

exports.agregar = asyncHandler(async (req, res) => {
  const id = Number(req.body.id_producto);
  if (!id) throw httpError(400, 'Producto no válido');
  await query('INSERT IGNORE INTO favoritos (id_usuario, id_producto) VALUES (?, ?)', [req.user.id_usuario, id]);
  res.status(201).json({ ok: true });
});

exports.quitar = asyncHandler(async (req, res) => {
  await query('DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?', [req.user.id_usuario, req.params.id]);
  res.json({ ok: true });
});
