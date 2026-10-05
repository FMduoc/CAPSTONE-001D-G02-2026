// src/app/services/solicitud.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Solicitud } from '../models/solicitud.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async crear(datos: {
      sala_id: number;
      descripcion: string;
      categoria: string;
      urgencia?: string; // opcional: si no se envía, el backend usa 'media' por defecto
    }): Promise<Solicitud> {
      const token = await this.authService.getToken();
      return firstValueFrom(
        this.http.post<Solicitud>(this.apiUrl, datos, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
  }

  listar(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.apiUrl);
  }

  async listarAsignadas(): Promise<Solicitud[]> {
    const token = await this.authService.getToken();
    return firstValueFrom(
      this.http.get<Solicitud[]>(`${this.apiUrl}/asignadas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  }

  async listarMias(): Promise<Solicitud[]> {
    const token = await this.authService.getToken();
    return firstValueFrom(
      this.http.get<Solicitud[]>(`${this.apiUrl}/mias`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  }

  // Nuevo: marca como "en proceso" y asigna el usuario responsable
  async atender(id: number): Promise<{ mensaje: string; solicitud: Solicitud }> {
    const token = await this.authService.getToken();
    return firstValueFrom(
      this.http.patch<{ mensaje: string; solicitud: Solicitud }>(
        `${this.apiUrl}/${id}/atender`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );
  }

  // Nuevo: marca como "resuelta", solo si el mismo usuario la atendió
  async terminar(id: number): Promise<{ mensaje: string; solicitud: Solicitud }> {
    const token = await this.authService.getToken();
    return firstValueFrom(
      this.http.patch<{ mensaje: string; solicitud: Solicitud }>(
        `${this.apiUrl}/${id}/terminar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );
  }

async consultarCobertura(categoria: string): Promise<{ categoria: string; hayDisponibles: boolean }> {
    const token = await this.authService.getToken();
    return firstValueFrom(
      this.http.get<{ categoria: string; hayDisponibles: boolean }>(
        `${environment.apiUrl}/soporte/cobertura/${categoria}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );
  }
}

