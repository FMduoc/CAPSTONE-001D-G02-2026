// =====================================================
// RELACIÓN ENTRE ROL DEL PERSONAL Y CATEGORÍA
// (en tu proyecto, rol y categoría ya usan el mismo valor)
// =====================================================

const CATEGORIAS_STAFF = ['tecnico', 'enfermeria', 'seguridad', 'limpieza'];

// Listar solicitudes asignadas, con orden inteligente (pendiente > en_proceso > resuelta)
app.get('/api/solicitudes/asignadas', verificarToken, async (req, res) => {
  const { rol } = req.usuario;

  const orderClause = `
    CASE
      WHEN s.estado = 'pendiente' THEN 1
      WHEN s.estado = 'en_proceso' THEN 2
      WHEN s.estado = 'resuelta' THEN 3
      ELSE 4
    END,
    s.fecha_creacion DESC
  `;

  if (rol === 'administrador') {
    const result = await pool.query(`
      SELECT s.*, sa.nombre AS sala_nombre
      FROM solicitud s
      JOIN sala sa ON s.sala_id = sa.id
      ORDER BY ${orderClause}
    `);
    return res.json(result.rows);
  }

  if (!CATEGORIAS_STAFF.includes(rol)) {
    return res.status(403).json({ error: 'El usuario no posee un rol de soporte válido' });
  }

  try {
    const result = await pool.query(
      `SELECT s.*, sa.nombre AS sala_nombre
       FROM solicitud s
       JOIN sala sa ON s.sala_id = sa.id
       WHERE s.categoria = $1
       ORDER BY ${orderClause}`,
      [rol]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/solicitudes/asignadas:', err);
    res.status(500).json({ error: err.message });
  }
});

// Marcar como "en proceso" — con validación de transición y asignación de responsable
app.patch('/api/solicitudes/:id/atender', verificarToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;
  const rol = req.usuario.rol;

  if (!CATEGORIAS_STAFF.includes(rol)) {
    return res.status(403).json({ error: 'El usuario no posee un rol de soporte válido' });
  }

  try {
    const result = await pool.query(
      `UPDATE solicitud
       SET estado = 'en_proceso', atendido_por = $1, fecha_actualizacion = NOW()
       WHERE id = $2 AND categoria = $3 AND estado = 'pendiente'
       RETURNING *`,
      [usuarioId, id, rol]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Solicitud no encontrada, ya fue atendida o no corresponde a tu área',
      });
    }

    res.json({ mensaje: 'Solicitud marcada como en proceso', solicitud: result.rows[0] });
  } catch (err) {
    console.error('Error al atender solicitud:', err);
    res.status(500).json({ error: err.message });
  }
});

// Marcar como "resuelta" — solo quien la atendió puede cerrarla
app.patch('/api/solicitudes/:id/terminar', verificarToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;
  const rol = req.usuario.rol;

  if (!CATEGORIAS_STAFF.includes(rol)) {
    return res.status(403).json({ error: 'El usuario no posee un rol de soporte válido' });
  }

  try {
    const result = await pool.query(
      `UPDATE solicitud
       SET estado = 'resuelta', fecha_actualizacion = NOW()
       WHERE id = $1 AND categoria = $2 AND estado = 'en_proceso' AND atendido_por = $3
       RETURNING *`,
      [id, rol, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'La solicitud no existe, no está en proceso o está asignada a otro usuario',
      });
    }

    res.json({ mensaje: 'Solicitud marcada como resuelta', solicitud: result.rows[0] });
  } catch (err) {
    console.error('Error al terminar solicitud:', err);
    res.status(500).json({ error: err.message });
  }
});

// Notificaciones: cantidad de pendientes por rol
app.get('/api/solicitudes/notificaciones', verificarToken, async (req, res) => {
  const { rol } = req.usuario;

  if (!CATEGORIAS_STAFF.includes(rol)) {
    return res.status(403).json({ error: 'El usuario no posee un rol de soporte válido' });
  }

  try {
    const result = await pool.query(
      `SELECT s.id, s.descripcion, s.categoria, s.estado, s.fecha_creacion, sa.nombre AS sala_nombre
       FROM solicitud s
       JOIN sala sa ON s.sala_id = sa.id
       WHERE s.categoria = $1 AND s.estado = 'pendiente'
       ORDER BY s.fecha_creacion DESC`,
      [rol]
    );

    res.json({ cantidad: result.rows.length, solicitudes: result.rows });
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ error: err.message });
  }
});