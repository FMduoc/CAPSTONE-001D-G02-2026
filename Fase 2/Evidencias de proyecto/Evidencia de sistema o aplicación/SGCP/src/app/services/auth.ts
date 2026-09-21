import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { Observable, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, contrasena }).pipe(
      tap(async (res) => {
        await Preferences.set({ key: 'auth_token', value: res.token });
        await Preferences.set({ key: 'usuario', value: JSON.stringify(res.usuario) });
      })
    );
  }

  register(datos: { nombre: string; apellido: string; email: string; contrasena: string; rol: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datos);
  }

  async logout() {
    await Preferences.remove({ key: 'auth_token' });
    await Preferences.remove({ key: 'usuario' });
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'auth_token' });
    return value;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async getUsuario(): Promise<Usuario | null> {
    const { value } = await Preferences.get({ key: 'usuario' });
    return value ? JSON.parse(value) : null;
  }

  // Versión async, ya que Preferences no permite acceso síncrono
  async getRol(): Promise<string | null> {
    const usuario = await this.getUsuario();
    return usuario?.rol ?? null;
  }

  // Conexión con verificación de rol en backend-express/routes/auth.js
  async obtenerPerfilActual(): Promise<Usuario> {
    const response = await firstValueFrom(
      this.http.get<Usuario>(`${environment.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${await this.getToken()}` },
      })
    );
    await Preferences.set({ key: 'usuario', value: JSON.stringify(response) });
    return response;
  }
}
