const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const pool = require('../db');
const verificarToken = require('../middleware/auth');
const soloAdmin = require('../middleware/adminAuth');

const router = express.Router();

// Crear una sala (solo admin) — genera codigo_qr automáticamente
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la sala es obligatorio' });
  }

  const codigo_qr = crypto.randomBytes(8).toString('hex'); // ej. "a3f9c21b8e4d6f10"

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

// Listar todas las salas (solo admin)
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sala ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generar la imagen del QR para una sala específica (solo admin, para mostrar/descargar)
router.get('/:id/qr', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT codigo_qr FROM sala WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }

    const dataUrl = await QRCode.toDataURL(result.rows[0].codigo_qr, { width: 300 });
    res.json({ qr: dataUrl }); // string base64 tipo "data:image/png;base64,..."
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolver una sala a partir del código escaneado (PÚBLICO — sin auth, lo usa el docente al escanear)
router.get('/by-codigo/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const result = await pool.query('SELECT id, nombre FROM sala WHERE codigo_qr = $1', [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Código QR no reconocido' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;