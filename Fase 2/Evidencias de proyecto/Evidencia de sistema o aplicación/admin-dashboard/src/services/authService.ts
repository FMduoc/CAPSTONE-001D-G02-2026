// src/services/authService.ts
import api from './api';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export const authService = {
  async login(email: string, contrasena: string): Promise<Usuario> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, contrasena });

    // El backend no distingue "para qué app" es el login — el mismo endpoint
    // sirve tanto para la app Ionic (docentes/staff) como para este dashboard.
    // Por eso, aquí en el frontend del dashboard rechazamos explícitamente
    // cualquier rol que no sea administrador, aunque el login en sí haya sido válido.
    if (data.usuario.rol !== 'administrador') {
      throw new Error('Esta cuenta no tiene permisos de administrador');
    }
    // Deben existir endpoints protegidos en backend-express también.

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    return data.usuario;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUsuario(): Usuario | null {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};