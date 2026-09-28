import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  IonicModule
} from '@ionic/angular/lazy';

import {
  Router
} from '@angular/router';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  FormsModule
} from '@angular/forms';

import {
  firstValueFrom
} from 'rxjs';

import {
  AuthService
} from '../services/auth';


@Component({
  selector: 'app-inicio-soporte',
  templateUrl: './inicio-soporte.page.html',
  styleUrls: ['./inicio-soporte.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
})
export class InicioSoportePage {

  solicitudes: any[] = [];

  usuario: any = null;

  cargando = false;
  error = '';

  reportes: {
    [id: number]: string
  } = {};

  private apiUrl =
    'http://localhost:3000/api/soporte';


  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // IMPORTANTE PARA IONIC
  // Se ejecuta CADA VEZ que entras a la página
  // ==========================================

  ionViewWillEnter() {

    this.usuario =
      this.authService.getUsuario();

    this.solicitudes = [];

    this.error = '';

    this.cargarSolicitudes();

  }


  // ==========================================
  // SOLICITUDES ACTIVAS
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
  // ==========================================

  get solicitudesHistorial(): any[] {

    return this.solicitudes.filter(
      solicitud =>
        solicitud.estado === 'terminada'
    );

  }


  // ==========================================
  // HEADERS JWT
  // ==========================================

  private obtenerHeaders(): HttpHeaders {

    const token =
      this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }


  // ==========================================
  // CARGAR SOLICITUDES
  // ==========================================

  async cargarSolicitudes() {

    if (this.cargando) {
      return;
    }

    const token =
      this.authService.getToken();

    if (!token) {

      this.router.navigateByUrl(
        '/login',
        {
          replaceUrl: true
        }
      );

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
              headers:
                this.obtenerHeaders()
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
            headers:
              this.obtenerHeaders()
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
  // TERMINAR + REPORTE
  // ==========================================

  async terminarSolicitud(id: number) {

    this.error = '';

    const reporte =
      this.reportes[id]?.trim() || '';

    try {

      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/solicitudes/${id}/terminar`,
          {
            reporte_soporte: reporte
          },
          {
            headers:
              this.obtenerHeaders()
          }
        )
      );

      delete this.reportes[id];

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
  // MOSTRAR ESTADO PROFESIONAL
  // ==========================================

  mostrarEstado(
    estado: string
  ): string {

    const estados: any = {

      pendiente:
        'Pendiente',

      atendida:
        'En curso',

      terminada:
        'Finalizada'

    };

    return estados[estado] || estado;

  }


  // ==========================================
  // MOSTRAR CATEGORÍA
  // ==========================================

  mostrarCategoria(
    categoria: string
  ): string {

    const categorias: any = {

      servicio_tecnico:
        'Servicio técnico',

      emergencia_medica:
        'Emergencia médica',

      limpieza:
        'Limpieza'

    };

    return categorias[categoria]
      || categoria;

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  cerrarSesion() {

    this.authService.logout();

    this.usuario = null;

    this.solicitudes = [];

    this.router.navigateByUrl(
      '/login',
      {
        replaceUrl: true
      }
    );

  }

}