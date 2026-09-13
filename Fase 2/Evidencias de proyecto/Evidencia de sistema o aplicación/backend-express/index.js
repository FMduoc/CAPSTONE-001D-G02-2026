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

// Crear una solicitud
app.post('/api/solicitudes', verificarToken, async (req, res) => {
  const { sala_id, descripcion } = req.body;
  const usuario_id = req.usuario.id; // viene del token verificado, no del body

  if (!sala_id || !descripcion) {
    return res.status(400).json({ error: 'sala_id y descripcion son obligatorios' });
  }

  try {
    // Trae el nombre del usuario autenticado para guardarlo como respaldo
    const usuarioResult = await pool.query('SELECT nombre, apellido FROM usuario WHERE id = $1', [usuario_id]);
    const nombre_solicitante = `${usuarioResult.rows[0].nombre} ${usuarioResult.rows[0].apellido}`;

    const result = await pool.query(
      `INSERT INTO solicitud (sala_id, usuario_id, nombre_solicitante, descripcion)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sala_id, usuario_id, nombre_solicitante, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar solicitudes (con nombre de sala incluido)
app.get('/api/solicitudes', async (req, res) => {
  const result = await pool.query(`
    SELECT s.*, sa.nombre AS sala_nombre
    FROM solicitud s
    JOIN sala sa ON s.sala_id = sa.id
    ORDER BY s.fecha_creacion DESC
  `);
  res.json(result.rows);
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