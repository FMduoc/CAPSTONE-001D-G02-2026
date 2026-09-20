const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// Rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rutas de soporte
const soporteRoutes = require('./routes/soporte');
app.use('/api/soporte', soporteRoutes);

const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API SGCP funcionando correctamente'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});