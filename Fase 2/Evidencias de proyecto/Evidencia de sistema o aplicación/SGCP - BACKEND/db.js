const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',           // Tu usuario
    host: 'localhost',
    database: 'SGCP',        // El nombre exacto de tu BD
    password: 'admin123',  // Tu contraseña de pgAdmin
    port: 5432,
});

pool.connect((err, client, release) => {
    if (err) return console.error('Error al conectar a la BD:', err.stack);
    console.log('Conexión exitosa a PostgreSQL');
    release();
});

module.exports = pool;