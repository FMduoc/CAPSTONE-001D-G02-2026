// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { authService } from '../services/authService';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault(); // evita que el form recargue la página, comportamiento HTML por defecto
    setError('');
    setCargando(true);

    try {
      await authService.login(email, contrasena);
      navigate('/usuarios');
    } catch (err: any) {
      // Si el backend devolvió un error (401, 403, etc.), axios lo expone en err.response.data
      const mensaje = err.response?.data?.error || err.message || 'No se pudo iniciar sesión';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          SGCP — Panel de administración
        </Typography>

        <Box component="form" onSubmit={iniciarSesion} sx={{ width: '100%', mt: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={cargando}
          >
            {cargando ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}