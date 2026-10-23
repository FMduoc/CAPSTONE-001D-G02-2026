import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export interface SolicitudSoporte {
  id: number;
  sala_nombre: string;
  nombre_solicitante: string;
  descripcion: string;
  categoria: string;
  urgencia: string;
  estado: string;
  atendido_por: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

const CATEGORIAS: Record<string, string> = {
  tecnico: 'Servicio técnico',
  enfermeria: 'Emergencia médica',
  limpieza: 'Limpieza',
  seguridad: 'Seguridad',
};

const URGENCIAS: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

export const etiquetaCategoria = (categoria: string): string => CATEGORIAS[categoria] || categoria;
export const etiquetaUrgencia = (urgencia: string): string => URGENCIAS[urgencia] || urgencia;

@Injectable({ providedIn: 'root' })
export class SoporteService {
  private apiUrl = `${environment.apiUrl}/soporte`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private async headers(): Promise<HttpHeaders> {
    const token = await this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  async listarSolicitudes(): Promise<SolicitudSoporte[]> {
    const data = await firstValueFrom(
      this.http.get<SolicitudSoporte[]>(`${this.apiUrl}/solicitudes`, {
        headers: await this.headers(),
      })
    );
    return data || [];
  }

  async terminar(id: number): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.apiUrl}/solicitudes/${id}/terminar`, {}, {
        headers: await this.headers(),
      })
    );
  }
}
