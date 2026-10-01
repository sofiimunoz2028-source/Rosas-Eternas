const { query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');

function toNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

exports.listCategorias = asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT id_categoria, nombre, descripcion, imagen_url FROM categorias WHERE activa = 1 ORDER BY nombre',
  );
  res.json(rows);
});

exports.listPromociones = asyncHandler(async (req, res) => {
  const promociones = await query(
    `SELECT pr.id_promocion, pr.nombre, pr.descripcion, pr.porcentaje_descuento, pr.fecha_inicio, pr.fecha_fin
     FROM promociones pr
     WHERE pr.activa = 1 AND CURDATE() BETWEEN pr.fecha_inicio AND pr.fecha_fin
     ORDER BY pr.fecha_fin`,
  );
  for (const promo of promociones) {
    promo.productos = await query(
      `SELECT c.id_producto, c.nombre, c.slug, c.imagen_principal, c.precio, c.precio_final, c.descuento_pct
       FROM promocion_productos pp
       JOIN v_catalogo c ON c.id_producto = pp.id_producto
       WHERE pp.id_promocion = ?`,
      [promo.id_promocion],
    );
  }
  res.json(promociones);
});

exports.listProductos = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 12;
  const offset = (page - 1) * limit;
  const q = (req.query.q || '').trim();
  const idCategoria = toNumber(req.query.categoria);
  const min = toNumber(req.query.min);
  const max = toNumber(req.query.max);
  const destacados = req.query.destacados === '1';

  const where = [];
  const params = [];
  if (q) {
    where.push('(c.nombre LIKE ? OR c.descripcion LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (idCategoria) {
    where.push('c.id_categoria = ?');
    params.push(idCategoria);
  }
  if (min !== null) {
    where.push('c.precio_final >= ?');
    params.push(min);
  }
  if (max !== null) {
    where.push('c.precio_final <= ?');
    params.push(max);
  }
  if (destacados) where.push('c.destacado = 1');

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countRows = await query(`SELECT COUNT(*) AS total FROM v_catalogo c ${clause}`, params);
  const total = countRows[0].total;
  const items = await query(
    `SELECT c.id_producto, c.nombre, c.slug, c.descripcion, c.categoria, c.id_categoria,
            c.imagen_principal, c.precio, c.descuento_pct, c.precio_final,
            c.calificacion_promedio, c.total_resenas, c.stock, c.es_personalizable, c.destacado
     FROM v_catalogo c ${clause}
     ORDER BY c.destacado DESC, c.nombre ASC
     LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total });
});

exports.getProducto = asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM v_catalogo WHERE slug = ?', [req.params.slug]);
  if (!rows[0]) throw httpError(404, 'Producto no encontrado');
  const producto = rows[0];
  const [imagenes, opciones, resenas] = await Promise.all([
    query(
      `SELECT url, texto_alternativo, es_principal, orden
       FROM imagenes_producto WHERE id_producto = ? ORDER BY es_principal DESC, orden`,
      [producto.id_producto],
    ),
    query(
      `SELECT o.id_opcion, o.tipo, o.nombre, o.valor_hex, o.costo_extra
       FROM producto_opciones po
       JOIN opciones_personalizacion o ON o.id_opcion = po.id_opcion
       WHERE po.id_producto = ? AND o.activa = 1
       ORDER BY o.tipo, o.nombre`,
      [producto.id_producto],
    ),
    query(
      `SELECT r.calificacion, r.comentario, r.creado_en, u.nombre
       FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario
       WHERE r.id_producto = ? AND r.aprobada = 1
       ORDER BY r.creado_en DESC`,
      [producto.id_producto],
    ),
  ]);
  res.json({ ...producto, imagenes, opciones, resenas });
});
