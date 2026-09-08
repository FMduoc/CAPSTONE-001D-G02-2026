const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares necesarios
app.use(cors());
app.use(express.json()); // Permite recibir JSON en el req.body

// Importar rutas
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});