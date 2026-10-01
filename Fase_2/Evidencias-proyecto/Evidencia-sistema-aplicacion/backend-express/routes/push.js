const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

router.post('/registrar-token', verificarToken, async (req, res) => {
  const { token, plataforma } = req.body;
  const usuario_id = req.usuario.id;

  if (!token || !plataforma) {
    return res.status(400).json({ error: 'token y plataforma son obligatorios' });
  }

  const plataformasValidas = ['android', 'ios', 'web'];
  if (!plataformasValidas.includes(plataforma)) {
    return res.status(400).json({ error: 'Plataforma no válida' });
  }

  try {
    await pool.query(
      `INSERT INTO push_token (usuario_id, token, plataforma)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO UPDATE SET usuario_id = $1`,
      [usuario_id, token, plataforma]
    );
    res.status(201).json({ mensaje: 'Token registrado correctamente' });
  } catch (err) {
    console.error('Error al registrar token push:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/registrar-token', verificarToken, async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'token es obligatorio' });
  }
  try {
    await pool.query('DELETE FROM push_token WHERE token = $1', [token]);
    res.json({ mensaje: 'Token eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;