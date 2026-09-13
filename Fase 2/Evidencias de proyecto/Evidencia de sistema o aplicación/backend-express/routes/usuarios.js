const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');
const soloAdmin = require('../middleware/adminAuth');

const router = express.Router();

// Listar todos los usuarios (protegido, solo admin)
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, apellido, email, rol, fecha_creacion
       FROM usuario ORDER BY fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reasignar el rol de un usuario staff (protegido, solo admin)
router.patch('/:id/rol', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  const rolesAsignables = ['tecnico', 'enfermeria', 'limpieza'];
  if (!rolesAsignables.includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido para asignar a personal staff' });
  }

  try {
    const result = await pool.query(
      `UPDATE usuario SET rol = $1 WHERE id = $2
       RETURNING id, nombre, apellido, email, rol`,
      [rol, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;