const pool = require('../db'); // <-- Aquí importamos la conexión
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
    const { nombre, apellido, correo, contrasena, cargo, ubicacion, rol } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(contrasena, salt);

        const result = await pool.query(
            `INSERT INTO Usuario (Nombre, Apellido, correo, contraseña, Cargo, ubicación, rol) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombre, apellido, correo, hash, cargo, ubicacion, rol]
        );
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const result = await pool.query('SELECT * FROM Usuario WHERE correo = $1', [correo]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(contrasena, user.contraseña);
        if (!validPassword) return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign({ id_usuario: user.id_usuario, rol: user.rol }, 'tu_secreto', { expiresIn: '8h' });

        res.json({
            token,
            user: { id_usuario: user.id_usuario, nombre: user.Nombre, rol: user.rol, ubicacion: user.ubicación }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { registrarUsuario, loginUsuario };