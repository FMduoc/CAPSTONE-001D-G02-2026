export interface Solicitud {
  id?: number;
  sala_id: number;
  nombre_solicitante?: string;
  descripcion: string;
  estado?: string;
  fecha_creacion?: string;
}