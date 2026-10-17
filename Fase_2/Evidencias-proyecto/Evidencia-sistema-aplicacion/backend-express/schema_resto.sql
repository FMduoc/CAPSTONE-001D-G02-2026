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