const admin = require('../firebase');
const pool = require('../db');

async function notificarStaffDisponible(categoria, solicitud) {
  try {
    const result = await pool.query(
      `SELECT pt.token
       FROM push_token pt
       JOIN usuario u ON u.id = pt.usuario_id
       WHERE u.rol = $1::rol_usuario AND u.disponible = true`,
      [categoria]
    );

    const tokens = result.rows.map((r) => r.token);
    if (tokens.length === 0) {
      console.log(`No hay tokens de staff disponible para categoría: ${categoria}`);
      return;
    }

    const mensaje = {
      notification: {
        title: `Nueva solicitud: ${solicitud.sala_nombre}`,
        body: solicitud.descripcion,
      },
      data: {
        solicitud_id: String(solicitud.id),
        categoria: solicitud.categoria,
        urgencia: solicitud.urgencia,
      },
      tokens,
    };

    const respuesta = await admin.messaging().sendEachForMulticast(mensaje);

    const tokensInvalidos = [];
    respuesta.responses.forEach((r, i) => {
      if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
        tokensInvalidos.push(tokens[i]);
      }
    });

    if (tokensInvalidos.length > 0) {
      await pool.query('DELETE FROM push_token WHERE token = ANY($1)', [tokensInvalidos]);
    }

    console.log(`Notificaciones enviadas: ${respuesta.successCount}, fallidas: ${respuesta.failureCount}`);
  } catch (err) {
    console.error('Error al enviar notificación push:', err);
  }
}

module.exports = { notificarStaffDisponible };