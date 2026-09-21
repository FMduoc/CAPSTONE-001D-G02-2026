import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

export function ProtectedRoute() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />; // deja pasar a la siguiente ruta anidada, sea cual sea
}

/*
La lógica es la misma que en el componente Ionic, pero la mecánica 
es distinta por cómo funciona React Router versus Angular Router:

En Angular, authGuard es una función que el router ejecuta antes de 
activar una ruta (canActivate: [authGuard]) — nunca renderiza nada por sí mismo, 
solo permite o bloquea la navegación.

En React Router, ProtectedRoute es en sí mismo un componente que se 
renderiza como parte del árbol de rutas. Si el usuario no está autenticado, renderiza 
<Navigate to="/login" /> (que redirige); si está autenticado, 
renderiza <Outlet /> — un placeholder especial de React Router que 
dice "aquí va la ruta hija que corresponda".
*/