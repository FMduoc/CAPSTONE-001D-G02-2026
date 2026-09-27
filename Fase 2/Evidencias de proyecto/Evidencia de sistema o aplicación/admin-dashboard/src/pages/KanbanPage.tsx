import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { solicitudService, type SolicitudHistorial } from '../services/solicitudService';

const COLUMNAS = [
  { estado: 'pendiente', titulo: 'Pendiente', color: 'warning.main' },
  { estado: 'atendida', titulo: 'En progreso', color: 'info.main' },
  { estado: 'terminada', titulo: 'Finalizado', color: 'success.main' },
] as const;

// A qué estado avanza cada tarjeta al presionar el botón de acción
const SIGUIENTE_ESTADO: Record<string, string | null> = {
  pendiente: 'atendida',
  atendida: 'terminada',
  terminada: null, // ya no avanza más
};

const TEXTO_BOTON: Record<string, string> = {
  pendiente: 'Mover a en progreso',
  atendida: 'Marcar como finalizado',
};

export function KanbanPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [moviendoId, setMoviendoId] = useState<number | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await solicitudService.listarHistorial();
      setSolicitudes(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudieron cargar las solicitudes');
    } finally {
      setCargando(false);
    }
  };

  const avanzarEstado = async (solicitud: SolicitudHistorial) => {
    const nuevoEstado = SIGUIENTE_ESTADO[solicitud.estado];
    if (!nuevoEstado) return;

    setMoviendoId(solicitud.id);
    try {
      const actualizada = await solicitudService.actualizarEstado(solicitud.id, nuevoEstado);
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === solicitud.id ? { ...s, estado: actualizada.estado } : s))
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo actualizar el estado');
    } finally {
      setMoviendoId(null);
    }
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Tablero de solicitudes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {COLUMNAS.map((columna) => {
          const solicitudesColumna = solicitudes.filter((s) => s.estado === columna.estado);

          return (
            <Paper
              key={columna.estado}
              sx={{ flex: 1, minWidth: 280, bgcolor: 'grey.50', p: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
                <Box
                  sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: columna.color }}
                />
                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                  {columna.titulo}
                </Typography>
                <Chip label={solicitudesColumna.length} size="small" sx={{ ml: 'auto' }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {solicitudesColumna.map((s) => (
                  <Card key={s.id} variant="outlined">
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="subtitle2">{s.sala_nombre}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {s.descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{display: "block"}}>
                        {s.usuario_nombre ? `${s.usuario_nombre} ${s.usuario_apellido}` : 'Sin usuario'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatearFecha(s.fecha_creacion)}
                      </Typography>
                    </CardContent>
                    {SIGUIENTE_ESTADO[s.estado] && (
                      <CardActions>
                        <Button
                          size="small"
                          fullWidth
                          disabled={moviendoId === s.id}
                          onClick={() => avanzarEstado(s)}
                        >
                          {moviendoId === s.id ? 'Moviendo...' : TEXTO_BOTON[s.estado]}
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                ))}

                {solicitudesColumna.length === 0 && (
                  <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 2 }}>
                    Sin solicitudes
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </>
  );
}