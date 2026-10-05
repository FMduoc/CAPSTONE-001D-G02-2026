const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();


// =====================================================
// ROLES PERMITIDOS
// =====================================================

const rolesPermitidos = [
  'solicitante',
  'staff',
  'tecnico',
  'enfermeria',
  'limpieza'
];


// =====================================================
// REGISTRO DE USUARIOS
// =====================================================

router.post(
  '/register',
  async (req, res) => {

    const {
      nombre,
      apellido,
      email,
      contrasena,
      rol
    } = req.body;


    // VALIDAR CAMPOS OBLIGATORIOS
    if (
      !nombre ||
      !apellido ||
      !email ||
      !contrasena ||
      !rol
    ) {

      return res.status(400).json({
        error:
          'Todos los campos son obligatorios'
      });

    }


    // VALIDAR CONTRASEÑA
    if (contrasena.length < 8) {

      return res.status(400).json({
        error:
          'La contraseña debe tener al menos 8 caracteres'
      });

    }


    // VALIDAR ROL
    if (!rolesPermitidos.includes(rol)) {

      return res.status(400).json({
        error:
          'Rol no válido'
      });

    }


    try {

      // NORMALIZAR DATOS
      const nombreNormalizado =
        nombre.trim();

      const apellidoNormalizado =
        apellido.trim();

      const correoNormalizado =
        email
          .trim()
          .toLowerCase();


      // VERIFICAR SI EL EMAIL YA EXISTE
      const existente =
        await pool.query(
          `
          SELECT id
          FROM usuario
          WHERE LOWER(email) = $1
          `,
          [
            correoNormalizado
          ]
        );


      if (existente.rows.length > 0) {

        return res.status(409).json({
          error:
            'Ese email ya está registrado'
        });

      }


      // ENCRIPTAR CONTRASEÑA
      const contrasena_hash =
        await bcrypt.hash(
          contrasena,
          10
        );


      // CREAR USUARIO
      const result =
        await pool.query(
          `
          INSERT INTO usuario (
            nombre,
            apellido,
            email,
            contrasena_hash,
            rol
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
          )

          RETURNING
            id,
            nombre,
            apellido,
            email,
            rol,
            fecha_creacion
          `,
          [
            nombreNormalizado,
            apellidoNormalizado,
            correoNormalizado,
            contrasena_hash,
            rol
          ]
        );


      // RESPUESTA CORRECTA
      res.status(201).json(
        result.rows[0]
      );

    } catch (err) {

      console.error(
        'Error al registrar usuario:',
        err
      );


      res.status(500).json({
        error:
          err.message
      });

    }

  }
);


// =====================================================
// LOGIN DE USUARIOS
// =====================================================

router.post(
  '/login',
  async (req, res) => {

    const {
      email,
      contrasena
    } = req.body;


    // VALIDAR CAMPOS
    if (
      !email ||
      !contrasena
    ) {

      return res.status(400).json({
        error:
          'Email y contraseña son obligatorios'
      });

    }


    try {

      // NORMALIZAR EMAIL
      const correoNormalizado =
        email
          .trim()
          .toLowerCase();


      // BUSCAR USUARIO
      const result =
        await pool.query(
          `
          SELECT *
          FROM usuario
          WHERE LOWER(email) = $1
          `,
          [
            correoNormalizado
          ]
        );


      const usuario =
        result.rows[0];


      // USUARIO NO EXISTE
      if (!usuario) {

        return res.status(401).json({
          error:
            'Credenciales inválidas'
        });

      }


      // COMPARAR CONTRASEÑA
      const coincide =
        await bcrypt.compare(
          contrasena,
          usuario.contrasena_hash
        );


      if (!coincide) {

        return res.status(401).json({
          error:
            'Credenciales inválidas'
        });

      }


      // GENERAR TOKEN JWT
      const token =
        jwt.sign(
          {
            id:
              usuario.id,

            rol:
              usuario.rol,

            email:
              usuario.email
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              process.env.JWT_EXPIRES_IN || '8h'
          }
        );


      // RESPUESTA LOGIN
      res.json({

        token,

        usuario: {

          id:
            usuario.id,

          nombre:
            usuario.nombre,

          apellido:
            usuario.apellido,

          email:
            usuario.email,

          rol:
            usuario.rol

        }

      });

    } catch (err) {

      console.error(
        'Error al iniciar sesión:',
        err
      );


      res.status(500).json({
        error:
          err.message
      });

    }

  }
);


module.exports = router;