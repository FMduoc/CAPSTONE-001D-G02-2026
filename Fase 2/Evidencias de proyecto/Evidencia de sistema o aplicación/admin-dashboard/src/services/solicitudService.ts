import api from './api';

export interface SolicitudHistorial {
  id: number;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
  sala_nombre: string;
  usuario_nombre: string | null;
  usuario_apellido: string | null;
  usuario_rol: string | null;
}

export const solicitudService = {
  async listarHistorial(): Promise<SolicitudHistorial[]> {
    const { data } = await api.get<SolicitudHistorial[]>('/admin/solicitudes');
    return data;
  },
};