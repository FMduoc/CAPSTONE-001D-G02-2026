const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

const verificarToken = require('./middleware/auth');

const CATEGORIAS_PERMITIDAS = ['tecnico', 'enfermeria', 'seguridad', 'limpieza'];
const URGENCIAS_PERMITIDAS = ['baja', 'media', 'alta', 'critica'];

// Crear una solicitud
app.post('/api/solicitudes', verificarToken, async (req, res) => {
  const { sala_id, descripcion, categoria, urgencia = 'media' } = req.body;
  const usuario_id = req.usuario.id;

  if (!sala_id || !descripcion || !categoria) {
    return res.status(400).json({ error: 'sala_id, descripcion y categoria son obligatorios' });
  }
  if (!CATEGORIAS_PERMITIDAS.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }
  if (!URGENCIAS_PERMITIDAS.includes(urgencia)) {
    return res.status(400).json({ error: 'Urgencia no válida' });
  }

  try {
    const usuarioResult = await pool.query('SELECT nombre, apellido FROM usuario WHERE id = $1', [usuario_id]);
    const nombre_solicitante = `${usuarioResult.rows[0].nombre} ${usuarioResult.rows[0].apellido}`;

    const result = await pool.query(
      `INSERT INTO solicitud (sala_id, usuario_id, nombre_solicitante, descripcion, categoria, urgencia)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [sala_id, usuario_id, nombre_solicitante, descripcion, categoria, urgencia]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en /api/solicitudes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Listar solicitudes asignadas, ordenadas por urgencia
app.get('/api/solicitudes/asignadas', verificarToken, async (req, res) => {
  const { rol } = req.usuario;

  const ORDEN_URGENCIA = `
    CASE s.urgencia
      WHEN 'critica' THEN 1
      WHEN 'alta'    THEN 2
      WHEN 'media'   THEN 3
      ELSE 4
    END,
    s.fecha_creacion ASC
  `;

  if (rol === 'administrador') {
    const result = await pool.query(`
      SELECT s.*, sa.nombre AS sala_nombre
      FROM solicitud s
      JOIN sala sa ON s.sala_id = sa.id
      ORDER BY ${ORDEN_URGENCIA}
    `);
    return res.json(result.rows);
  }

  try {
    const result = await pool.query(
      `SELECT s.*, sa.nombre AS sala_nombre
       FROM solicitud s
       JOIN sala sa ON s.sala_id = sa.id
       WHERE s.categoria = $1
       ORDER BY ${ORDEN_URGENCIA}`,
      [rol]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/solicitudes/asignadas:', err);
    res.status(500).json({ error: err.message });
  }
});

const ESTADOS_PERMITIDOS = ['pendiente', 'atendida', 'terminada'];

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

// Consulta de cobertura por categoría (para avisar al solicitante si no hay staff disponible)
app.get('/api/soporte/cobertura/:categoria', verificarToken, async (req, res) => {
  const { categoria } = req.params;
  if (!CATEGORIAS_PERMITIDAS.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM usuario WHERE rol = $1::rol_usuario AND disponible = true`,
      [categoria]
    );
    const hayDisponibles = parseInt(result.rows[0].count, 10) > 0;
    res.json({ hayDisponibles });
  } catch (err) {
    console.error('Error en /api/soporte/cobertura:', err);
    res.status(500).json({ error: err.message });
  }
});

const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const salasRoutes = require('./routes/salas');
app.use('/api/salas', salasRoutes);

const soporteRoutes = require('./routes/soporte');
app.use('/api/soporte', soporteRoutes);

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));