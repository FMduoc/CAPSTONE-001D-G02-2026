import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme.ts';
// index.css y app.css son vestigios generados por VITE.
//import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <StrictMode>
      <App />
    </StrictMode>,
  </ThemeProvider>,
)
