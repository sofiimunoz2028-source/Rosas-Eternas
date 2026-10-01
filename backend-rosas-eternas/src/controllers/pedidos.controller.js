const { pool, query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');

const ESTADOS_CANCELABLES = ['pendiente', 'confirmado'];

async function loadPedido(idPedido, idUsuario = null, esAdmin = false) {
  const params = [idPedido];
  let sql = `SELECT p.*, CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS cliente, u.email, u.telefono
             FROM pedidos p JOIN usuarios u ON u.id_usuario = p.id_usuario
             WHERE p.id_pedido = ?`;
  if (!esAdmin) {
    sql += ' AND p.id_usuario = ?';
    params.push(idUsuario);
  }
  const rows = await query(sql, params);
  if (!rows[0]) return null;
  const pedido = rows[0];
  pedido.items = await query(
    `SELECT dp.id_detalle, pr.nombre AS producto, pr.slug, dp.id_producto, dp.cantidad,
            dp.precio_unitario, dp.subtotal, dp.dedicatoria,
            GROUP_CONCAT(o.nombre ORDER BY o.tipo SEPARATOR ', ') AS opciones
     FROM detalle_pedido dp
     JOIN productos pr ON pr.id_producto = dp.id_producto
     LEFT JOIN detalle_pedido_opciones dpo ON dpo.id_detalle = dp.id_detalle
     LEFT JOIN opciones_personalizacion o ON o.id_opcion = dpo.id_opcion
     WHERE dp.id_pedido = ?
     GROUP BY dp.id_detalle, pr.nombre, pr.slug, dp.id_producto, dp.cantidad,
              dp.precio_unitario, dp.subtotal, dp.dedicatoria`,
    [idPedido],
  );
  pedido.historial = await query(
    `SELECT estado_anterior, estado_nuevo, cambiado_en
     FROM historial_estado_pedido WHERE id_pedido = ? ORDER BY cambiado_en`,
    [idPedido],
  );
  return pedido;
}

exports.crear = asyncHandler(async (req, res) => {
  const {
    items, metodo_pago, tipo_entrega, direccion_entrega, fecha_entrega_deseada, notas,
  } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'El pedido no tiene productos');
  if (!['efectivo', 'transferencia', 'contraentrega'].includes(metodo_pago)) {
    throw httpError(400, 'Método de pago no válido');
  }
  if (!['recogida', 'domicilio'].includes(tipo_entrega)) {
    throw httpError(400, 'Tipo de entrega no válido');
  }
  if (tipo_entrega === 'domicilio' && !String(direccion_entrega || '').trim()) {
    throw httpError(400, 'La dirección es obligatoria para domicilio');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [pedidoResult] = await conn.execute(
      `INSERT INTO pedidos (id_usuario, metodo_pago, tipo_entrega, direccion_entrega, fecha_entrega_deseada, notas)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id_usuario,
        metodo_pago,
        tipo_entrega,
        tipo_entrega === 'domicilio' ? String(direccion_entrega).trim() : null,
        fecha_entrega_deseada || null,
        notas?.slice(0, 255) || null,
      ],
    );
    const idPedido = pedidoResult.insertId;
    let total = 0;

    for (const item of items) {
      const cantidad = Number(item.cantidad) || 0;
      if (cantidad < 1) throw httpError(400, 'Cantidad no válida');
      const [productos] = await conn.execute(
        `SELECT p.id_producto, p.precio, p.stock, p.activo,
                (SELECT COALESCE(MAX(pr.porcentaje_descuento), 0)
                   FROM promocion_productos pp
                   JOIN promociones pr ON pr.id_promocion = pp.id_promocion
                  WHERE pp.id_producto = p.id_producto
                    AND pr.activa = 1
                    AND CURDATE() BETWEEN pr.fecha_inicio AND pr.fecha_fin) AS descuento_pct
         FROM productos p WHERE p.id_producto = ? FOR UPDATE`,
        [item.id_producto],
      );
      const producto = productos[0];
      if (!producto || !producto.activo) throw httpError(400, 'Hay un producto que ya no está disponible');
      if (producto.stock < cantidad) {
        throw httpError(409, 'No hay suficiente stock para uno de los productos');
      }

      const opcionIds = Array.isArray(item.opciones) ? [...new Set(item.opciones.map(Number))] : [];
      let extras = 0;
      const opcionesValidas = [];
      if (opcionIds.length) {
        const placeholders = opcionIds.map(() => '?').join(',');
        const [ops] = await conn.execute(
          `SELECT o.id_opcion, o.costo_extra
           FROM opciones_personalizacion o
           JOIN producto_opciones po ON po.id_opcion = o.id_opcion
           WHERE po.id_producto = ? AND o.activa = 1 AND o.id_opcion IN (${placeholders})`,
          [producto.id_producto, ...opcionIds],
        );
        if (ops.length !== opcionIds.length) throw httpError(400, 'Hay opciones de personalización no válidas');
        for (const op of ops) {
          extras += Number(op.costo_extra);
          opcionesValidas.push(op);
        }
      }

      const precioBase = Number(producto.precio) * (1 - Number(producto.descuento_pct) / 100);
      const precioUnitario = Math.round((precioBase + extras) * 100) / 100;
      const subtotal = Math.round(precioUnitario * cantidad * 100) / 100;
      total += subtotal;

      const [det] = await conn.execute(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal, dedicatoria)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idPedido, producto.id_producto, cantidad, precioUnitario, subtotal, String(item.dedicatoria || '').slice(0, 255) || null],
      );
      for (const op of opcionesValidas) {
        await conn.execute(
          `INSERT INTO detalle_pedido_opciones (id_detalle, id_opcion, costo_extra_aplicado)
           VALUES (?, ?, ?)`,
          [det.insertId, op.id_opcion, op.costo_extra],
        );
      }

      const [stock] = await conn.execute(
        'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
        [cantidad, producto.id_producto, cantidad],
      );
      if (stock.affectedRows === 0) throw httpError(409, 'No hay suficiente stock para uno de los productos');
    }

    await conn.execute('UPDATE pedidos SET total = ? WHERE id_pedido = ?', [Math.round(total * 100) / 100, idPedido]);
    await conn.execute(
      `INSERT INTO historial_estado_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario)
       VALUES (?, NULL, 'pendiente', ?)`,
      [idPedido, req.user.id_usuario],
    );
    await conn.commit();
    const creado = await loadPedido(idPedido, req.user.id_usuario, false);
    res.status(201).json(creado);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

exports.mios = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT id_pedido, estado, total, tipo_entrega, metodo_pago, fecha_entrega_deseada, creado_en
     FROM pedidos WHERE id_usuario = ? ORDER BY creado_en DESC`,
    [req.user.id_usuario],
  );
  res.json(rows);
});

exports.detalle = asyncHandler(async (req, res) => {
  const pedido = await loadPedido(req.params.id, req.user.id_usuario, req.user.rol === 'administrador');
  if (!pedido) throw httpError(404, 'Pedido no encontrado');
  res.json(pedido);
});

exports.cancelar = asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      'SELECT id_pedido, estado FROM pedidos WHERE id_pedido = ? AND id_usuario = ? FOR UPDATE',
      [req.params.id, req.user.id_usuario],
    );
    const pedido = rows[0];
    if (!pedido) throw httpError(404, 'Pedido no encontrado');
    if (!ESTADOS_CANCELABLES.includes(pedido.estado)) {
      throw httpError(409, 'Solo puedes cancelar pedidos pendientes o confirmados');
    }
    await conn.execute("UPDATE pedidos SET estado = 'cancelado' WHERE id_pedido = ?", [pedido.id_pedido]);
    await conn.execute(
      `UPDATE productos p
       JOIN detalle_pedido dp ON dp.id_producto = p.id_producto
          SET p.stock = p.stock + dp.cantidad
        WHERE dp.id_pedido = ?`,
      [pedido.id_pedido],
    );
    await conn.execute(
      `INSERT INTO historial_estado_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario)
       VALUES (?, ?, 'cancelado', ?)`,
      [pedido.id_pedido, pedido.estado, req.user.id_usuario],
    );
    await conn.commit();
    res.json(await loadPedido(pedido.id_pedido, req.user.id_usuario, false));
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

exports.loadPedido = loadPedido;
