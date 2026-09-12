CREATE TABLE sala (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo_qr VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE solicitud (
    id SERIAL PRIMARY KEY,
    sala_id INTEGER NOT NULL REFERENCES sala(id),
    nombre_solicitante VARCHAR(100),
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO sala (nombre, codigo_qr) VALUES ('Sala 204', 'QR-SALA-204');

-- Creación de tabla de usuarios.
CREATE TYPE rol_usuario AS ENUM ('administrador', 'tecnico', 'personal_salud');
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    --activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);