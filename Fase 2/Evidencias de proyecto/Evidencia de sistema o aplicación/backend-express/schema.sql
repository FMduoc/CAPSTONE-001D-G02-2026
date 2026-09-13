-- backend-express/schema.sql

CREATE TYPE rol_usuario AS ENUM (
    'administrador',
    'docente',
    'staff',
    'tecnico',
    'enfermeria',
    'limpieza'
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sala (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo_qr VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE solicitud (
    id SERIAL PRIMARY KEY,
    sala_id INTEGER NOT NULL REFERENCES sala(id),
    usuario_id INTEGER REFERENCES usuario(id),
    nombre_solicitante VARCHAR(100),
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CREACION USUARIO ADMIN
-- Para conseguir la contraseña hash, correr el siguiente script en CMD/powershell backend-express
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('CAMBIAR-CONTRASEÑA-ADMIN', 10).then(console.log)"
-- El resultado debe ser pegado en las comillas para contrasena_hash.
--INSERT INTO usuario (nombre, apellido, email, contrasena_hash, rol)
--VALUES ('', '', '', '', 'administrador');