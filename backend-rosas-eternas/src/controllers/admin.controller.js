const { pool, query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');
const { loadPedido } = require('./pedidos.controller');

function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 140);
}

exports.reportes = asyncHandler(async (req, res) => {
  const [ventasMes, masVendidos, stockBajo, reseñasPendientes, mensajes] = await Promise.all([
    query(
      `SELECT DATE_FORMAT(creado_en, '%Y-%m') AS mes, COUNT(*) AS pedidos, SUM(total) AS ventas
       FROM pedidos
       WHERE estado IN ('confirmado', 'en_produccion', 'listo', 'entregado')
       GROUP BY DATE_FORMAT(creado_en, '%Y-%m')
       ORDER BY mes DESC LIMIT 12`,
    ),
    query(
      `SELECT pr.id_producto, pr.nombre, SUM(dp.cantidad) AS unidades, SUM(dp.subtotal) AS ingresos
       FROM detalle_pedido dp
       JOIN pedidos pe ON pe.id_pedido = dp.id_pedido AND pe.estado <> 'cancelado'
       JOIN productos pr ON pr.id_producto = dp.id_producto
       GROUP BY pr.id_producto, pr.nombre
       ORDER BY unidades DESC LIMIT 10`,
    ),
    query('SELECT id_producto, nombre, stock FROM productos WHERE activo = 1 AND stock <= 5 ORDER BY stock'),
    query('SELECT COUNT(*) AS total FROM resenas WHERE aprobada = 0'),
    query('SELECT COUNT(*) AS total FROM mensajes_contacto WHERE atendido = 0'),
  ]);
  res.json({
    ventas_mes: ventasMes,
    mas_vendidos: masVendidos,
    stock_bajo: stockBajo,
    reseñas_pendientes: reseñasPendientes[0].total,
    mensajes_pendientes: mensajes[0].total,
  });
});

exports.listarPedidos = asyncHandler(async (req, res) => {
  const estado = req.query.estado || null;
  const rows = await query(
    `SELECT p.id_pedido, CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS cliente, p.estado, p.total,
            p.tipo_entrega, p.metodo_pago, p.fecha_entrega_deseada, p.creado_en
     FROM pedidos p JOIN usuarios u ON u.id_usuario = p.id_usuario
     WHERE (? IS NULL OR p.estado = ?)
     ORDER BY p.creado_en DESC`,
    [estado, estado],
  );
  res.json(rows);
});

exports.cambiarEstadoPedido = asyncHandler(async (req, res) => {
  const nuevo = req.body.estado;
  const permitidos = ['pendiente', 'confirmado', 'en_produccion', 'listo', 'entregado', 'cancelado'];
  if (!permitidos.includes(nuevo)) throw httpError(400, 'Estado no válido');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT estado FROM pedidos WHERE id_pedido = ? FOR UPDATE', [req.params.id]);
    if (!rows[0]) throw httpError(404, 'Pedido no encontrado');
    const actual = rows[0].estado;
    await conn.execute('UPDATE pedidos SET estado = ? WHERE id_pedido = ?', [nuevo, req.params.id]);
    await conn.execute(
      `INSERT INTO historial_estado_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario)
       VALUES (?, ?, ?, ?)`,
      [req.params.id, actual, nuevo, req.user.id_usuario],
    );
    if (nuevo === 'cancelado' && actual !== 'cancelado') {
      await conn.execute(
        `UPDATE productos p
         JOIN detalle_pedido dp ON dp.id_producto = p.id_producto
            SET p.stock = p.stock + dp.cantidad
          WHERE dp.id_pedido = ?`,
        [req.params.id],
      );
    }
    await conn.commit();
    res.json(await loadPedido(req.params.id, null, true));
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

exports.detallePedidoAdmin = asyncHandler(async (req, res) => {
  const pedido = await loadPedido(req.params.id, null, true);
  if (!pedido) throw httpError(404, 'Pedido no encontrado');
  res.json(pedido);
});

exports.listarProductosAdmin = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT p.*, c.nombre AS categoria
     FROM productos p JOIN categorias c ON c.id_categoria = p.id_categoria
     ORDER BY p.actualizado_en DESC`,
  );
  res.json(rows);
});

exports.crearProducto = asyncHandler(async (req, res) => {
  const { id_categoria, nombre, descripcion, precio, stock, es_personalizable, destacado, activo, imagen_url, opciones } = req.body || {};
  if (!id_categoria || !nombre || precio == null) throw httpError(400, 'Categoría, nombre y precio son obligatorios');
  let slug = slugify(nombre);
  const dup = await query('SELECT id_producto FROM productos WHERE slug = ?', [slug]);
  if (dup.length) slug = `${slug}-${Date.now()}`;
  const result = await query(
    `INSERT INTO productos (id_categoria, nombre, slug, descripcion, precio, stock, es_personalizable, destacado, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_categoria, nombre.trim(), slug, descripcion || null, precio, stock || 0, es_personalizable ? 1 : 0, destacado ? 1 : 0, activo === 0 ? 0 : 1],
  );
  if (imagen_url) {
    await query(
      'INSERT INTO imagenes_producto (id_producto, url, texto_alternativo, es_principal, orden) VALUES (?, ?, ?, 1, 0)',
      [result.insertId, imagen_url, nombre.trim()],
    );
  }
  if (Array.isArray(opciones) && opciones.length) {
    for (const id of opciones) {
      await query('INSERT IGNORE INTO producto_opciones (id_producto, id_opcion) VALUES (?, ?)', [result.insertId, id]);
    }
  }
  res.status(201).json({ id_producto: result.insertId, slug });
});

exports.actualizarProducto = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { id_categoria, nombre, descripcion, precio, stock, es_personalizable, destacado, activo, imagen_url } = req.body || {};
  await query(
    `UPDATE productos SET
       id_categoria = COALESCE(?, id_categoria),
       nombre = COALESCE(?, nombre),
       descripcion = COALESCE(?, descripcion),
       precio = COALESCE(?, precio),
       stock = COALESCE(?, stock),
       es_personalizable = COALESCE(?, es_personalizable),
       destacado = COALESCE(?, destacado),
       activo = COALESCE(?, activo)
     WHERE id_producto = ?`,
    [
      id_categoria ?? null, nombre ?? null, descripcion ?? null, precio ?? null, stock ?? null,
      es_personalizable == null ? null : (es_personalizable ? 1 : 0),
      destacado == null ? null : (destacado ? 1 : 0),
      activo == null ? null : (activo ? 1 : 0),
      id,
    ],
  );
  if (imagen_url) {
    await query('DELETE FROM imagenes_producto WHERE id_producto = ?', [id]);
    await query(
      'INSERT INTO imagenes_producto (id_producto, url, texto_alternativo, es_principal, orden) VALUES (?, ?, ?, 1, 0)',
      [id, imagen_url, nombre || 'Producto'],
    );
  }
  res.json({ ok: true });
});

exports.listarCategoriasAdmin = asyncHandler(async (req, res) => {
  res.json(await query('SELECT * FROM categorias ORDER BY nombre'));
});

exports.guardarCategoria = asyncHandler(async (req, res) => {
  const { id_categoria, nombre, descripcion, activa } = req.body || {};
  if (!nombre) throw httpError(400, 'El nombre es obligatorio');
  if (id_categoria) {
    await query(
      'UPDATE categorias SET nombre = ?, descripcion = ?, activa = ? WHERE id_categoria = ?',
      [nombre, descripcion || null, activa === 0 ? 0 : 1, id_categoria],
    );
    return res.json({ ok: true });
  }
  const result = await query(
    'INSERT INTO categorias (nombre, descripcion, activa) VALUES (?, ?, ?)',
    [nombre, descripcion || null, activa === 0 ? 0 : 1],
  );
  res.status(201).json({ id_categoria: result.insertId });
});

exports.listarOpciones = asyncHandler(async (req, res) => {
  res.json(await query('SELECT * FROM opciones_personalizacion ORDER BY tipo, nombre'));
});

exports.guardarOpcion = asyncHandler(async (req, res) => {
  const { id_opcion, tipo, nombre, valor_hex, costo_extra, activa } = req.body || {};
  if (!tipo || !nombre) throw httpError(400, 'Tipo y nombre son obligatorios');
  if (id_opcion) {
    await query(
      'UPDATE opciones_personalizacion SET tipo = ?, nombre = ?, valor_hex = ?, costo_extra = ?, activa = ? WHERE id_opcion = ?',
      [tipo, nombre, valor_hex || null, costo_extra || 0, activa === 0 ? 0 : 1, id_opcion],
    );
    return res.json({ ok: true });
  }
  const result = await query(
    'INSERT INTO opciones_personalizacion (tipo, nombre, valor_hex, costo_extra, activa) VALUES (?, ?, ?, ?, ?)',
    [tipo, nombre, valor_hex || null, costo_extra || 0, activa === 0 ? 0 : 1],
  );
  res.status(201).json({ id_opcion: result.insertId });
});

exports.listarPromociones = asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM promociones ORDER BY fecha_inicio DESC');
  res.json(rows);
});

exports.guardarPromocion = asyncHandler(async (req, res) => {
  const { id_promocion, nombre, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin, activa, productos } = req.body || {};
  if (!nombre || !porcentaje_descuento || !fecha_inicio || !fecha_fin) {
    throw httpError(400, 'Nombre, porcentaje y fechas son obligatorios');
  }
  let id = id_promocion;
  if (id) {
    await query(
      `UPDATE promociones SET nombre = ?, descripcion = ?, porcentaje_descuento = ?, fecha_inicio = ?, fecha_fin = ?, activa = ?
       WHERE id_promocion = ?`,
      [nombre, descripcion || null, porcentaje_descuento, fecha_inicio, fecha_fin, activa === 0 ? 0 : 1, id],
    );
    await query('DELETE FROM promocion_productos WHERE id_promocion = ?', [id]);
  } else {
    const result = await query(
      `INSERT INTO promociones (nombre, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin, activa)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, porcentaje_descuento, fecha_inicio, fecha_fin, activa === 0 ? 0 : 1],
    );
    id = result.insertId;
  }
  if (Array.isArray(productos)) {
    for (const pid of productos) {
      await query('INSERT IGNORE INTO promocion_productos (id_promocion, id_producto) VALUES (?, ?)', [id, pid]);
    }
  }
  res.json({ id_promocion: id });
});

exports.listarEventosAdmin = asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM eventos ORDER BY fecha_inicio DESC');
  res.json(rows);
});

exports.guardarEvento = asyncHandler(async (req, res) => {
  const { id_evento, titulo, descripcion, tipo, lugar, fecha_inicio, fecha_fin, cupo_maximo, publicado } = req.body || {};
  if (!titulo || !tipo || !fecha_inicio) throw httpError(400, 'Título, tipo y fecha son obligatorios');
  if (id_evento) {
    await query(
      `UPDATE eventos SET titulo = ?, descripcion = ?, tipo = ?, lugar = ?, fecha_inicio = ?, fecha_fin = ?, cupo_maximo = ?, publicado = ?
       WHERE id_evento = ?`,
      [titulo, descripcion || null, tipo, lugar || null, fecha_inicio, fecha_fin || null, cupo_maximo || null, publicado === 0 ? 0 : 1, id_evento],
    );
    return res.json({ ok: true });
  }
  const result = await query(
    `INSERT INTO eventos (titulo, descripcion, tipo, lugar, fecha_inicio, fecha_fin, cupo_maximo, publicado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [titulo, descripcion || null, tipo, lugar || null, fecha_inicio, fecha_fin || null, cupo_maximo || null, publicado === 0 ? 0 : 1],
  );
  res.status(201).json({ id_evento: result.insertId });
});

exports.inscritosEvento = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT i.id_inscripcion, i.estado, i.creado_en, u.nombre, u.apellido, u.email, u.telefono
     FROM inscripciones_evento i JOIN usuarios u ON u.id_usuario = i.id_usuario
     WHERE i.id_evento = ? ORDER BY i.creado_en`,
    [req.params.id],
  );
  res.json(rows);
});

exports.listarResenas = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT r.*, pr.nombre AS producto, u.nombre AS cliente
     FROM resenas r
     JOIN productos pr ON pr.id_producto = r.id_producto
     JOIN usuarios u ON u.id_usuario = r.id_usuario
     ORDER BY r.aprobada ASC, r.creado_en DESC`,
  );
  res.json(rows);
});

exports.aprobarResena = asyncHandler(async (req, res) => {
  await query('UPDATE resenas SET aprobada = ? WHERE id_resena = ?', [req.body.aprobada ? 1 : 0, req.params.id]);
  res.json({ ok: true });
});

exports.listarMensajes = asyncHandler(async (req, res) => {
  res.json(await query('SELECT * FROM mensajes_contacto ORDER BY atendido ASC, creado_en DESC'));
});

exports.atenderMensaje = asyncHandler(async (req, res) => {
  await query('UPDATE mensajes_contacto SET atendido = 1 WHERE id_mensaje = ?', [req.params.id]);
  res.json({ ok: true });
});
