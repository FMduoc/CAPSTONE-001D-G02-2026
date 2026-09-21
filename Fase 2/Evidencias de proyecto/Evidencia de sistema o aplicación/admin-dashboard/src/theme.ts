import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' }, //  Identidad de la aplicación.
    background: { default: '#f4f6f8' }, // Gris suave, menos agresivo en los ojos.
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 600, backgroundColor: '#f8fafc' } },
    },
  },
});