// Seguridad para asegurar que solo los administradores tengan acceso al admin-dashboard.
function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'administrador') {
    return res.status(403).json({ error: 'Solo un administrador puede realizar esta acción' });
  }
  next();
}

module.exports = soloAdmin;