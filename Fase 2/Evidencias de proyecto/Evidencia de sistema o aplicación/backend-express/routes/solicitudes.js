const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');
const soloAdmin = require('../middleware/adminAuth');

const router = express.Router();

// Historial completo de solicitudes, con nombre de sala y del solicitante (solo admin)
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.descripcion,
        s.estado,
        s.fecha_creacion,
        sa.nombre AS sala_nombre,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido,
        u.rol AS usuario_rol
      FROM solicitud s
      JOIN sala sa ON s.sala_id = sa.id
      LEFT JOIN usuario u ON s.usuario_id = u.id
      ORDER BY s.fecha_creacion DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;