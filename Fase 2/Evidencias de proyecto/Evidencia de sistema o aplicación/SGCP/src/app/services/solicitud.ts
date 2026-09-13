// src/app/services/solicitud.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Solicitud } from '../models/solicitud.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async crear(datos: { sala_id: number; descripcion: string }): Promise<Solicitud> {
    const token = await this.authService.getToken();
    return await import('rxjs').then(({ firstValueFrom }) =>
      firstValueFrom(
        this.http.post<Solicitud>(this.apiUrl, datos, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
  }

  listar(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.apiUrl);
  }
}