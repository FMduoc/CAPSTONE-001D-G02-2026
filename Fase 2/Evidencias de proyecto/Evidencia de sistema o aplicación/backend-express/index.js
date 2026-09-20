//index.js(backend)
// =====================================================
// RELACIÓN ENTRE ROL DEL PERSONAL Y CATEGORÍA
// (en tu proyecto, rol y categoría ya usan el mismo valor)
// =====================================================
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

/* VERSIÓN ANTIGUA
// Crear una sala
app.post('/api/salas', async (req, res) => {
  const { nombre, codigo_qr } = req.body;
  if (!nombre || !codigo_qr) {
    return res.status(400).json({ error: 'nombre y codigo_qr son obligatorios' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO sala (nombre, codigo_qr) VALUES ($1, $2) RETURNING *',
      [nombre, codigo_qr]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar salas
app.get('/api/salas', async (req, res) => {
  const result = await pool.query('SELECT * FROM sala ORDER BY id');
  res.json(result.rows);
});

*/

// Verificación de token de usuario.
const verificarToken = require('./middleware/auth');

// Categorías válidas para una solicitud
const CATEGORIAS_PERMITIDAS = ['tecnico', 'enfermeria', 'seguridad', 'limpieza'];

// Crear una solicitud
app.post('/api/solicitudes', verificarToken, async (req, res) => {
  const { sala_id, descripcion, categoria } = req.body;
  const usuario_id = req.usuario.id; // viene del token verificado, no del body

  if (!sala_id || !descripcion || !categoria) {
    return res.status(400).json({ error: 'sala_id, descripcion y categoria son obligatorios' });
  }

  if (!CATEGORIAS_PERMITIDAS.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }

  try {
    // Trae el nombre del usuario autenticado para guardarlo como respaldo
    const usuarioResult = await pool.query('SELECT nombre, apellido FROM usuario WHERE id = $1', [usuario_id]);
    const nombre_solicitante = `${usuarioResult.rows[0].nombre} ${usuarioResult.rows[0].apellido}`;

    const result = await pool.query(
      `INSERT INTO solicitud (sala_id, usuario_id, nombre_solicitante, descripcion, categoria)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sala_id, usuario_id, nombre_solicitante, descripcion, categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en /api/solicitudes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Listar solicitudes (con nombre de sala incluido)
// Solicitudes filtradas según el rol del usuario autenticado (para el staff)
app.get('/api/solicitudes/asignadas', verificarToken, async (req, res) => {
  const { rol } = req.usuario;

  // El administrador ve todas
  if (rol === 'administrador') {
    const result = await pool.query(`
      SELECT s.*, sa.nombre AS sala_nombre
      FROM solicitud s
      JOIN sala sa ON s.sala_id = sa.id
      ORDER BY s.fecha_creacion DESC
    `);
    return res.json(result.rows);
  }

  // El staff solo ve las que coinciden con su rol/categoría asignada
  try {
    const result = await pool.query(
      `SELECT s.*, sa.nombre AS sala_nombre
       FROM solicitud s
       JOIN sala sa ON s.sala_id = sa.id
       WHERE s.categoria = $1
       ORDER BY s.fecha_creacion DESC`,
      [rol]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/solicitudes/asignadas:', err);
    res.status(500).json({ error: err.message });
  }
});

const ESTADOS_PERMITIDOS = ['pendiente', 'atendida', 'terminada'];

// Cambiar el estado de una solicitud (solo el staff asignado a esa categoría, o el admin)
app.patch('/api/solicitudes/:id/estado', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const { rol } = req.usuario;

  if (!ESTADOS_PERMITIDOS.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const solicitudResult = await pool.query('SELECT categoria FROM solicitud WHERE id = $1', [id]);

    if (solicitudResult.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const categoriaSolicitud = solicitudResult.rows[0].categoria;

    // Solo puede modificarla el admin, o el staff cuyo rol coincide con la categoría
    if (rol !== 'administrador' && rol !== categoriaSolicitud) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta solicitud' });
    }

    const result = await pool.query(
      'UPDATE solicitud SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en /api/solicitudes/:id/estado:', err);
    res.status(500).json({ error: err.message });
  }
});

// Solicitudes creadas por el usuario autenticado (para el docente/solicitante)
app.get('/api/solicitudes/mias', verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    const result = await pool.query(
      `SELECT s.*, sa.nombre AS sala_nombre
       FROM solicitud s
       JOIN sala sa ON s.sala_id = sa.id
       WHERE s.usuario_id = $1
       ORDER BY s.fecha_creacion DESC`,
      [usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/solicitudes/mias:', err);
    res.status(500).json({ error: err.message });
  }
});


// Listar usuarios en admin dashboard.
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Ruta a routes/salas.js
const salasRoutes = require('./routes/salas');
app.use('/api/salas', salasRoutes);

// Ruta a routes/soporte.js
const soporteRoutes = require('./routes/soporte');
app.use('/api/soporte', soporteRoutes);

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));

const CATEGORIAS_STAFF = ['tecnico', 'enfermeria', 'seguridad', 'limpieza'];

// Listar solicitudes asignadas, con orden inteligente (pendiente > atendida > terminada)
app.get('/api/solicitudes/asignadas', verificarToken, async (req, res) => {
  const { rol } = req.usuario;

  const orderClause = `
    CASE
      WHEN s.estado = 'pendiente' THEN 1
      WHEN s.estado = 'atendida' THEN 2
      WHEN s.estado = 'terminada' THEN 3
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

// Marcar como "atendida" — con validación de transición y asignación de responsable
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
       SET estado = 'atendida', atendido_por = $1, fecha_actualizacion = NOW()
       WHERE id = $2 AND categoria = $3 AND estado = 'pendiente'
       RETURNING *`,
      [usuarioId, id, rol]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Solicitud no encontrada, ya fue atendida o no corresponde a tu área',
      });
    }

    res.json({ mensaje: 'Solicitud marcada como atendida', solicitud: result.rows[0] });
  } catch (err) {
    console.error('Error al atender solicitud:', err);
    res.status(500).json({ error: err.message });
  }
});

// Marcar como "terminada" — solo quien la atendió puede cerrarla
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
       SET estado = 'terminada', fecha_actualizacion = NOW()
       WHERE id = $1 AND categoria = $2 AND estado = 'atendida' AND atendido_por = $3
       RETURNING *`,
      [id, rol, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'La solicitud no existe, no está atendida o está asignada a otro usuario',
      });
    }

    res.json({ mensaje: 'Solicitud marcada como terminada', solicitud: result.rows[0] });
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