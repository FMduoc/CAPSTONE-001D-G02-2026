export interface Solicitud {
  id?: number;
  sala_id: number;
  usuario_id?: number;
  nombre_solicitante?: string;
  descripcion: string;
  categoria?: string;
  estado?: string;
  atendido_por?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  sala_nombre?: string;
}
