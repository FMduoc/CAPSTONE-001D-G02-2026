import api from './api';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  //activo: boolean; En caso de agregar estados de usuarios
  fecha_creacion: string;
}

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const { data } = await api.get<Usuario[]>('/usuarios');
    return data;
  },

  async actualizarRol(id: number, rol: string): Promise<Usuario> {
    const { data } = await api.patch<Usuario>(`/usuarios/${id}/rol`, { rol });
    return data;
  },
};