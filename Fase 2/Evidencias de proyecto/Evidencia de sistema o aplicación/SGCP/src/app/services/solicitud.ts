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

  async crear(datos: { sala_id: number; descripcion: string; categoria: string }): Promise<Solicitud> {
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

  async actualizarEstado(id: number, estado: string): Promise<Solicitud> {
    const token = await this.authService.getToken();
    return firstValueFrom(
      this.http.patch<Solicitud>(`${this.apiUrl}/${id}/estado`, { estado }, {
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
}
