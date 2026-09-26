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
  // Función para mostrar el historial de solicitudes en HistorialPage.
  async listarHistorial(): Promise<SolicitudHistorial[]> {
    const { data } = await api.get<SolicitudHistorial[]>('/admin/solicitudes');
    return data;
  },
  // Función para modificar estado a través de HistorialPage.
  async actualizarEstado(id: number, estado: string): Promise<SolicitudHistorial> {
    const { data } = await api.patch<SolicitudHistorial>(`/solicitudes/${id}/estado`, { estado });
    return data;
  },
};