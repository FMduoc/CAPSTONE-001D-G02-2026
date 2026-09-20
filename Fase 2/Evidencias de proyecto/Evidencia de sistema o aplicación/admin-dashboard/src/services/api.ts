// ESTE SERVICIO CONTIENE LA CONEXIÓN CON EL BACKEND.
console.log('ESTE ARCHIVO SE ESTÁ CARGANDO');
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

console.log('baseURL configurado:', import.meta.env.VITE_API_URL); // temporal, para debug
// Interceptor: agrega el token automáticamente a cada petición, si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;