// src/components/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LogoutIcon from '@mui/icons-material/Logout';
import { authService } from '../services/authService';
import HistoryIcon from '@mui/icons-material/History';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { useState } from 'react'; // Para información de usuario en localStorage
import logo from '../assets/logoDuoc.png'; 

const DRAWER_WIDTH = 240;

const opciones = [
  { texto: 'Usuarios', ruta: '/usuarios', icono: <PeopleIcon /> },
  { texto: 'Salas y QR', ruta: '/salas', icono: <MeetingRoomIcon /> },
  { texto: 'Historial', ruta: '/historial', icono: <HistoryIcon /> },
  { texto: 'Tablero', ruta: '/kanban', icono: <ViewKanbanIcon /> },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario] = useState(() => authService.getUsuario()); // Guarda información de localStorage en const usuario

  const cerrarSesion = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Box
          component="img"
          src={logo}
          alt="AsisteQR Admin"
          sx={{ maxWidth: '100%', maxHeight: 40, objectFit: 'contain' }}
        />
      </Toolbar>

      {usuario && (
        <Box
          sx={{
            m: 0,
            p: 2,
            borderRadius: 0,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {usuario.nombre} {usuario.apellido}
          </Typography>
          <Typography
            variant="body2"
            sx={{ opacity: 0.85, wordBreak: 'break-all' }}
          >
            {usuario.email}
          </Typography>
        </Box>
      )}

      <List>
        {opciones.map((opcion) => (
          <ListItemButton
            key={opcion.ruta}
            selected={location.pathname === opcion.ruta}
            onClick={() => navigate(opcion.ruta)}
          >
            <ListItemIcon>{opcion.icono}</ListItemIcon>
            <ListItemText primary={opcion.texto} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ marginTop: 'auto' }}>
        <Divider />
        <List>
          <ListItemButton onClick={cerrarSesion}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}