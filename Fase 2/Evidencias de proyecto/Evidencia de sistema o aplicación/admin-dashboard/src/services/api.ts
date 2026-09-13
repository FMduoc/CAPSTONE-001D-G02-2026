// ESTE SERVICIO CONTIENE LA CONEXIÓN CON EL BACKEND.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // import.meta.env.VITE_API_URL expone a las variables de entorno, similar a environment.ts en Angular.
});

// Interceptor: agrega el token automáticamente a cada petición, si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;