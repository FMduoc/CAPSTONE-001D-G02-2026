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

const DRAWER_WIDTH = 240;

const opciones = [
  { texto: 'Usuarios', ruta: '/usuarios', icono: <PeopleIcon /> },
  { texto: 'Salas y QR', ruta: '/salas', icono: <MeetingRoomIcon /> },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
      <Toolbar>
        <Typography variant="h6" noWrap>
          AsisteQR Admin
        </Typography>
      </Toolbar>

      <Divider />

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