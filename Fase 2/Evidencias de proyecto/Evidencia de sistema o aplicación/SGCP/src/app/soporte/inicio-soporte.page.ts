import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-inicio-soporte',
  templateUrl: './inicio-soporte.page.html',
  styleUrls: ['./inicio-soporte.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
})
export class InicioSoportePage implements OnInit {

  solicitudes: any[] = [];

  usuario: any = null;

  cargando = false;
  error = '';

  private apiUrl =
    'http://localhost:3000/api/soporte';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.usuario =
      this.authService.getUsuario();

    this.cargarSolicitudes();

  }

  // ==========================================
  // SOLICITUDES ACTIVAS
  // pendiente + atendida
  // ==========================================

  get solicitudesActivas(): any[] {

    return this.solicitudes.filter(
      solicitud =>
        solicitud.estado === 'pendiente' ||
        solicitud.estado === 'atendida'
    );

  }

  // ==========================================
  // HISTORIAL
  // terminadas
  // ==========================================

  get solicitudesHistorial(): any[] {

    return this.solicitudes.filter(
      solicitud =>
        solicitud.estado === 'terminada'
    );

  }

  // ==========================================
  // HEADERS CON JWT
  // ==========================================

  private obtenerHeaders(): HttpHeaders {

    const token =
      this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }

  // ==========================================
  // ACTUALIZAR SOLICITUDES
  // ==========================================

  async cargarSolicitudes() {

    if (this.cargando) {
      return;
    }

    const token =
      this.authService.getToken();

    if (!token) {

      this.router.navigate(['/login']);
      return;

    }

    this.cargando = true;
    this.error = '';

    this.cdr.detectChanges();

    try {

      const data =
        await firstValueFrom(
          this.http.get<any[]>(
            `${this.apiUrl}/solicitudes`,
            {
              headers: this.obtenerHeaders()
            }
          )
        );

      this.solicitudes =
        data || [];

    } catch (err) {

      console.error(
        'Error al cargar solicitudes:',
        err
      );

      this.error =
        'No se pudieron cargar las solicitudes';

    } finally {

      this.cargando = false;

      this.cdr.detectChanges();

    }

  }

  // ==========================================
  // ATENDER
  // ==========================================

  async atenderSolicitud(id: number) {

    this.error = '';

    try {

      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/solicitudes/${id}/atender`,
          {},
          {
            headers: this.obtenerHeaders()
          }
        )
      );

      await this.cargarSolicitudes();

    } catch (err: any) {

      console.error(
        'Error al atender solicitud:',
        err
      );

      this.error =
        err.error?.error ||
        'No se pudo atender la solicitud';

    }

  }

  // ==========================================
  // TERMINAR
  // ==========================================

  async terminarSolicitud(id: number) {

    this.error = '';

    try {

      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/solicitudes/${id}/terminar`,
          {},
          {
            headers: this.obtenerHeaders()
          }
        )
      );

      await this.cargarSolicitudes();

    } catch (err: any) {

      console.error(
        'Error al terminar solicitud:',
        err
      );

      this.error =
        err.error?.error ||
        'No se pudo terminar la solicitud';

    }

  }

  // ==========================================
  // MOSTRAR CATEGORÍA BONITA
  // ==========================================

  mostrarCategoria(categoria: string): string {

    const categorias: any = {
      servicio_tecnico: 'Servicio técnico',
      emergencia_medica: 'Emergencia médica',
      limpieza: 'Limpieza'
    };

    return categorias[categoria] || categoria;

  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  cerrarSesion() {

    this.authService.logout();

    this.router.navigate(['/login']);

  }

}