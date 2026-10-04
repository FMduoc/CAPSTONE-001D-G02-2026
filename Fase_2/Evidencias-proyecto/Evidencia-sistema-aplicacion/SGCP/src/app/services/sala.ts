import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sala {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class SalaService {
  private apiUrl = `${environment.apiUrl}/salas`;

  constructor(private http: HttpClient) {}

  buscarPorCodigo(codigo: string): Observable<Sala> {
    return this.http.get<Sala>(`${this.apiUrl}/by-codigo/${codigo}`);
  }
}