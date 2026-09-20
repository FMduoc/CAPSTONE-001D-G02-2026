export interface Solicitud {
  id?: number;
  sala_id: number;
  usuario_id?: number;
  nombre_solicitante?: string;
  descripcion: string;
  categoria?: string;
  estado?: string;
  fecha_creacion?: string;
  sala_nombre?: string; // viene del JOIN en el backend
}
