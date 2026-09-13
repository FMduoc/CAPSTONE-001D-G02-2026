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
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { salaService, type Sala } from '../services/salasService';

export function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [nombreNueva, setNombreNueva] = useState('');
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');

  const [qrAbierto, setQrAbierto] = useState<{ sala: Sala; imagen: string } | null>(null);

  useEffect(() => {
    cargarSalas();
  }, []);

  const cargarSalas = async () => {
    setCargando(true);
    try {
      const data = await salaService.listar();
      setSalas(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudieron cargar las salas');
    } finally {
      setCargando(false);
    }
  };

  const crearSala = async () => {
    if (!nombreNueva.trim()) return;
    setCreando(true);
    setError('');
    try {
      const nueva = await salaService.crear(nombreNueva.trim());
      setSalas((prev) => [...prev, nueva]);
      setNombreNueva('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear la sala');
    } finally {
      setCreando(false);
    }
  };

  const verQR = async (sala: Sala) => {
    try {
      const imagen = await salaService.obtenerQR(sala.id);
      setQrAbierto({ sala, imagen });
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo generar el QR');
    }
  };

  const descargarQR = () => {
    if (!qrAbierto) return;
    const link = document.createElement('a');
    link.href = qrAbierto.imagen;
    link.download = `QR-${qrAbierto.sala.nombre.replace(/\s+/g, '-')}.png`;
    link.click();
  };

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
        Gestión de salas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Nombre de la sala"
          value={nombreNueva}
          onChange={(e) => setNombreNueva(e.target.value)}
          placeholder="ej. Sala 204"
          size="small"
          onKeyDown={(e) => e.key === 'Enter' && crearSala()}
        />
        <Button variant="contained" onClick={crearSala} disabled={creando}>
          {creando ? 'Creando...' : 'Crear sala'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salas.map((sala) => (
              <TableRow key={sala.id}>
                <TableCell>{sala.nombre}</TableCell>
                <TableCell>
                  <code>{sala.codigo_qr}</code>
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => verQR(sala)}>
                    Ver / Descargar QR
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!qrAbierto} onClose={() => setQrAbierto(null)}>
        <DialogTitle>QR — {qrAbierto?.sala.nombre}</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
          {qrAbierto && <img src={qrAbierto.imagen} alt={`QR de ${qrAbierto.sala.nombre}`} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrAbierto(null)}>Cerrar</Button>
          <Button variant="contained" onClick={descargarQR}>
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}