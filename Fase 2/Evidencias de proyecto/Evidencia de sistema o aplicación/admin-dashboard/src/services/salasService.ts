import api from './api';

export interface Sala {
  id: number;
  nombre: string;
  codigo_qr: string;
}

export const salaService = {
  async listar(): Promise<Sala[]> {
    const { data } = await api.get<Sala[]>('/salas');
    return data;
  },

  async crear(nombre: string): Promise<Sala> {
    const { data } = await api.post<Sala>('/salas', { nombre });
    return data;
  },

  async obtenerQR(id: number): Promise<string> {
    const { data } = await api.get<{ qr: string }>(`/salas/${id}/qr`);
    return data.qr; // data URL base64, listo para usar directo en un <img src="...">
  },
};