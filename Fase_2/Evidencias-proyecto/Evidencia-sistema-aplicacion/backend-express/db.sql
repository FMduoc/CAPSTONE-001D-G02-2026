CREATE TYPE rol_usuario AS ENUM (
    'solicitante',
    'administrador',
    'tecnico',
    'staff',
    'seguridad',
    'limpieza',
    'enfermeria'
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'solicitante',
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
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
    categoria VARCHAR(30) CHECK (categoria IN ('tecnico', 'enfermeria', 'seguridad', 'limpieza')),
    urgencia VARCHAR(10) NOT NULL DEFAULT 'media'
      CHECK (urgencia IN ('baja', 'media', 'alta', 'critica')),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    atendido_por INTEGER REFERENCES usuario(id),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP
);

CREATE INDEX idx_solicitud_categoria_estado
  ON solicitud (categoria, estado);

CREATE TABLE push_token (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    plataforma VARCHAR(20) NOT NULL CHECK (plataforma IN ('android', 'ios', 'web')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_token_usuario ON push_token (usuario_id);

INSERT INTO sala (nombre, codigo_qr) VALUES ('Sala 204', 'QR-SALA-204');