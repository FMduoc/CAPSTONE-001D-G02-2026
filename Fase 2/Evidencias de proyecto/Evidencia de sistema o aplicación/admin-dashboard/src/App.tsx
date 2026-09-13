// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { SalasPage } from './pages/SalasPage';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Nivel 1: el guard decide si se puede pasar */}
        <Route element={<ProtectedRoute />}>
          {/* Nivel 2: si pasó el guard, se envuelve con el layout (sidebar) */}
          <Route element={<DashboardLayout />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/salas" element={<SalasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/usuarios" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;