//soporte.js
const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

// =====================================================
// RELACIÓN ENTRE ROL DEL PERSONAL Y CATEGORÍA
// =====================================================

const categoriaPorRol = {
  tecnico: 'tecnico',
  enfermeria: 'enfermeria',
  limpieza: 'limpieza',
  seguridad: 'seguridad'
};

function obtenerCategoriaPorRol(rol) {
  return categoriaPorRol[rol];
}

// =====================================================
// LISTAR SOLICITUDES SEGÚN EL ROL DEL USUARIO
// =====================================================

router.get('/solicitudes', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const rol = req.usuario.rol;

  const categoria = obtenerCategoriaPorRol(rol);

  if (!categoria) {
    return res.status(403).json({
      error: 'El usuario no posee un rol de soporte válido'
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.sala_id,
        sa.nombre AS sala_nombre,
        s.usuario_id,
        s.nombre_solicitante,
        s.descripcion,
        s.categoria,
        s.estado,
        s.atendido_por,
        s.fecha_creacion,
        s.fecha_actualizacion
      FROM solicitud s
      JOIN sala sa
        ON s.sala_id = sa.id
      WHERE s.categoria = $1
      ORDER BY
        CASE
          WHEN s.estado = 'pendiente' THEN 1
          WHEN s.estado = 'atendida' THEN 2
          WHEN s.estado = 'terminada' THEN 3
          ELSE 4
        END,
        s.fecha_creacion DESC
      `,
      [categoria]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Error al obtener solicitudes de soporte:', err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =====================================================
// NOTIFICACIONES / SOLICITUDES PENDIENTES SEGÚN ROL
// =====================================================

router.get('/notificaciones', verificarToken, async (req, res) => {
  const rol = req.usuario.rol;

  const categoria = obtenerCategoriaPorRol(rol);

  if (!categoria) {
    return res.status(403).json({
      error: 'El usuario no posee un rol de soporte válido'
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.descripcion,
        s.categoria,
        s.estado,
        s.fecha_creacion,
        sa.nombre AS sala_nombre
      FROM solicitud s
      JOIN sala sa
        ON s.sala_id = sa.id
      WHERE
        s.categoria = $1
        AND s.estado = 'pendiente'
      ORDER BY s.fecha_creacion DESC
      `,
      [categoria]
    );

    res.json({
      cantidad: result.rows.length,
      solicitudes: result.rows
    });

  } catch (err) {
    console.error('Error al obtener notificaciones:', err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =====================================================
// MARCAR SOLICITUD COMO ATENDIDA
// =====================================================

router.patch(
  '/solicitudes/:id/atender',
  verificarToken,
  async (req, res) => {

    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const rol = req.usuario.rol;

    const categoria = obtenerCategoriaPorRol(rol);

    if (!categoria) {
      return res.status(403).json({
        error: 'El usuario no posee un rol de soporte válido'
      });
    }

    try {
      const result = await pool.query(
        `
        UPDATE solicitud
        SET
          estado = 'atendida',
          atendido_por = $1,
          fecha_actualizacion = NOW()
        WHERE
          id = $2
          AND categoria = $3
          AND estado = 'pendiente'
        RETURNING *
        `,
        [
          usuarioId,
          id,
          categoria
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            'Solicitud no encontrada, ya fue atendida o no corresponde a tu área'
        });
      }

      res.json({
        mensaje: 'Solicitud marcada como atendida',
        solicitud: result.rows[0]
      });

    } catch (err) {
      console.error('Error al atender solicitud:', err);

      res.status(500).json({
        error: err.message
      });
    }
  }
);

// =====================================================
// MARCAR SOLICITUD COMO TERMINADA
// =====================================================

router.patch(
  '/solicitudes/:id/terminar',
  verificarToken,
  async (req, res) => {

    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const rol = req.usuario.rol;

    const categoria = obtenerCategoriaPorRol(rol);

    if (!categoria) {
      return res.status(403).json({
        error: 'El usuario no posee un rol de soporte válido'
      });
    }

    try {
      const result = await pool.query(
        `
        UPDATE solicitud
        SET
          estado = 'terminada',
          fecha_actualizacion = NOW()
        WHERE
          id = $1
          AND categoria = $2
          AND estado = 'atendida'
          AND atendido_por = $3
        RETURNING *
        `,
        [
          id,
          categoria,
          usuarioId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            'La solicitud no existe, no está atendida o está asignada a otro usuario'
        });
      }

      res.json({
        mensaje: 'Solicitud marcada como terminada',
        solicitud: result.rows[0]
      });

    } catch (err) {
      console.error('Error al terminar solicitud:', err);

      res.status(500).json({
        error: err.message
      });
    }
  }
);

module.exports = router;