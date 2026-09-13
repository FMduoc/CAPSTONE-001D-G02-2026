/* VESTIGIO
import { Service } from '@angular/core';

@Service()
export class Auth {
}
*/
/* auth.ts(service)
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  usuario: { id: number; nombre: string; apellido: string; email: string; rol: string };
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
}
