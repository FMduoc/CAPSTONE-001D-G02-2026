import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // LOGIN
  // ==========================================

  login(
    email: string,
    contrasena: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        email,
        contrasena
      }
    ).pipe(

      tap((respuesta) => {

        if (respuesta.token) {

          localStorage.setItem(
            'token',
            respuesta.token
          );

        }

        if (respuesta.usuario) {

          localStorage.setItem(
            'usuario',
            JSON.stringify(
              respuesta.usuario
            )
          );

        }

      })

    );

  }

  // ==========================================
  // REGISTRO
  // ==========================================

  register(datos: {
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
    rol: string;
  }): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/register`,
      datos
    );

  }

  // ==========================================
  // SABER SI HAY SESIÓN
  // ==========================================

  async isAuthenticated(): Promise<boolean> {

    const token =
      localStorage.getItem('token');

    return !!token;

  }

  // ==========================================
  // OBTENER TOKEN
  // ==========================================

  getToken(): string | null {

    return localStorage.getItem(
      'token'
    );

  }

  // ==========================================
  // OBTENER USUARIO
  // ==========================================

  getUsuario(): any {

    const usuario =
      localStorage.getItem('usuario');

    if (!usuario) {
      return null;
    }

    return JSON.parse(usuario);

  }

  // ==========================================
  // OBTENER ROL
  // ==========================================

  getRol(): string | null {

    const usuario =
      this.getUsuario();

    return usuario?.rol || null;

  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

  }

}