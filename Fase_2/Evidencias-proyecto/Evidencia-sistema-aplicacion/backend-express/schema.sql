-- backend-express/schema.sql

CREATE TYPE rol_usuario AS ENUM (
    'administrador',
    'solicitante',
    'staff',         -- registrado, pendiente de asignación de categoría
    'tecnico',
    'enfermeria',
    'seguridad',
    'limpieza'
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    disponible BOOLEAN NOT NULL DEFAULT TRUE
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
    categoria VARCHAR(30),
    urgencia VARCHAR(10) NOT NULL DEFAULT 'media',
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',  -- pendiente, atendida, terminada
    atendido_por INTEGER REFERENCES usuario(id),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    CONSTRAINT solicitud_categoria_check
        CHECK (categoria IN ('tecnico', 'enfermeria', 'seguridad', 'limpieza')),
    CONSTRAINT solicitud_urgencia_check
        CHECK (urgencia IN ('baja', 'media', 'alta', 'critica'))
);

CREATE INDEX idx_solicitud_categoria_estado ON solicitud (categoria, estado);


-- CREACION USUARIO ADMIN
-- Para conseguir la contraseña hash, correr el siguiente script en CMD/powershell backend-express
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('CAMBIAR-CONTRASEÑA-ADMIN', 10).then(console.log)"
-- El resultado debe ser pegado en las comillas para contrasena_hash.
--INSERT INTO usuario (nombre, apellido, email, contrasena_hash, rol)
--VALUES ('', '', '', '', 'administrador');

