// admin-dashboard/src/pages/HistorialPage.tsx
import { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Box,
  TextField,
  MenuItem,
} from '@mui/material';
import { solicitudService, type SolicitudHistorial } from '../services/solicitudService';

const coloresEstado: Record<string, 'warning' | 'success' | 'default'> = {
  pendiente: 'warning',
  atendida: 'success',
};

export function HistorialPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const data = await solicitudService.listarHistorial();
      setSolicitudes(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  const solicitudesFiltradas =
    filtroEstado === 'todos'
      ? solicitudes
      : solicitudes.filter((s) => s.estado === filtroEstado);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  // Consiguiendo pendientes y atendidas para KPIs.

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente').length;
  const atendidas = solicitudes.filter((s) => s.estado === 'atendida').length;

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">{pendientes}</Typography>
          <Typography variant="body2" color="text.secondary">Pendientes</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">{atendidas}</Typography>
          <Typography variant="body2" color="text.secondary">Atendidas</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
          <Typography variant="h4">{solicitudes.length}</Typography>
          <Typography variant="body2" color="text.secondary">Total</Typography>
        </Paper>
      </Box>

      <Typography variant="h4" gutterBottom>
        Historial de solicitudes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TextField
        select
        label="Filtrar por estado"
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
        size="small"
        sx={{ mb: 2, minWidth: 200 }}
      >
        <MenuItem value="todos">Todos</MenuItem>
        <MenuItem value="pendiente">Pendiente</MenuItem>
        <MenuItem value="atendida">Atendida</MenuItem>
      </TextField>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Sala</TableCell>
              <TableCell>Solicitante</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solicitudesFiltradas.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{formatearFecha(s.fecha_creacion)}</TableCell>
                <TableCell>{s.sala_nombre}</TableCell>
                <TableCell>
                  {s.usuario_nombre ? `${s.usuario_nombre} ${s.usuario_apellido}` : '—'}
                </TableCell>
                <TableCell>{s.descripcion}</TableCell>
                <TableCell>
                  <Chip
                    label={s.estado}
                    color={coloresEstado[s.estado] || 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {solicitudesFiltradas.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No hay solicitudes para mostrar.
        </Typography>
      )}
    </>
  );
}