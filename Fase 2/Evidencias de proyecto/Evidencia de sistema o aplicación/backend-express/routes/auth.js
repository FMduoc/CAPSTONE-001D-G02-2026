const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Registro de usuarios
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, contrasena, rol } = req.body;

  if (!nombre || !apellido || !email || !contrasena || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (contrasena.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  const rolesPermitidos = ['docente', 'staff']; // Antes era ['solicitante', 'tecnico', 'personal_salud']
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  try {
    const existente = await pool.query('SELECT id FROM usuario WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      `INSERT INTO usuario (nombre, apellido, email, contrasena_hash, rol)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, apellido, email, rol`,
      [nombre, apellido, email, contrasena_hash, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login de usuarios
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    // En caso de tener estados de usuario. Activos, suspendidos, ocupado, etcétera.
    //const result = await pool.query('SELECT * FROM usuario WHERE email = $1 AND activo = TRUE', [email]);
    const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Verificación del rol. Cuando un usuario crea su cuenta de staff, su token estará vinculado a esa existencia.
// Esto se debe resetear al momento de cambiar su rol dentro del admin dashboard, para volver a generar un token.
// Este método consulta el rol ACTUAL en la sesión y el rol REAL directo de la base de datos, que fue cambiado por el admin.
// Esto se comunica con SGCP/src/app/services/auth.js
const verificarToken = require('../middleware/auth');

router.get('/me', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, rol FROM usuario WHERE id = $1', //  AND activo = TRUE
      [req.usuario.id]
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