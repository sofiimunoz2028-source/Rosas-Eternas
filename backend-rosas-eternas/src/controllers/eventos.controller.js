const { query } = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/error');

exports.listar = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT e.id_evento, e.titulo, e.descripcion, e.tipo, e.lugar, e.fecha_inicio, e.fecha_fin, e.cupo_maximo,
            CASE WHEN e.cupo_maximo IS NULL THEN NULL
                 ELSE e.cupo_maximo - COUNT(i.id_inscripcion) END AS cupos_disponibles
     FROM eventos e
     LEFT JOIN inscripciones_evento i ON i.id_evento = e.id_evento AND i.estado <> 'cancelado'
     WHERE e.publicado = 1 AND e.fecha_inicio >= NOW()
     GROUP BY e.id_evento, e.titulo, e.descripcion, e.tipo, e.lugar, e.fecha_inicio, e.fecha_fin, e.cupo_maximo
     ORDER BY e.fecha_inicio`,
  );
  res.json(rows);
});

exports.inscribir = asyncHandler(async (req, res) => {
  const idEvento = Number(req.params.id);
  const dup = await query(
    'SELECT id_inscripcion FROM inscripciones_evento WHERE id_evento = ? AND id_usuario = ?',
    [idEvento, req.user.id_usuario],
  );
  if (dup.length) throw httpError(409, 'Ya estás inscrito en este evento');

  const result = await query(
    `INSERT INTO inscripciones_evento (id_evento, id_usuario)
     SELECT e.id_evento, ?
     FROM eventos e
     WHERE e.id_evento = ? AND e.publicado = 1
       AND (e.cupo_maximo IS NULL OR e.cupo_maximo >
            (SELECT COUNT(*) FROM inscripciones_evento i
              WHERE i.id_evento = e.id_evento AND i.estado <> 'cancelado'))`,
    [req.user.id_usuario, idEvento],
  );
  if (!result.affectedRows) throw httpError(409, 'Cupo lleno o el evento no está disponible');
  res.status(201).json({ ok: true });
});
