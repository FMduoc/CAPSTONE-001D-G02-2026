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

  const rolesPermitidos = ['solicitante', 'tecnico', 'personal_salud', 'staff'];
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

module.exports = router;