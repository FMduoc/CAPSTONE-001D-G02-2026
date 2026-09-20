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

const ESTADOS_PERMITIDOS = ['pendiente', 'en_proceso', 'resuelta'];

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

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));