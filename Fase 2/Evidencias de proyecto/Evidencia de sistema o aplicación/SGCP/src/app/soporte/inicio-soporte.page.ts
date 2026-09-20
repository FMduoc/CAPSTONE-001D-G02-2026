import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-inicio-soporte',
  templateUrl: './inicio-soporte.page.html',
  styleUrls: ['./inicio-soporte.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class InicioSoportePage implements OnInit {
  solicitudes: any[] = [];
  usuario: any = null;
  cargando = false;
  error = '';

  private apiUrl = `${environment.apiUrl}/soporte`;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.usuario = await this.authService.getUsuario(); // <-- ahora con await
    await this.cargarSolicitudes();
  }

  get solicitudesActivas(): any[] {
    return this.solicitudes.filter(
      (solicitud) => solicitud.estado === 'pendiente' || solicitud.estado === 'atendida'
    );
  }

  get solicitudesHistorial(): any[] {
    return this.solicitudes.filter((solicitud) => solicitud.estado === 'terminada');
  }

  private async obtenerHeaders(): Promise<HttpHeaders> {
    const token = await this.authService.getToken(); // <-- ahora con await
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  async cargarSolicitudes() {
    if (this.cargando) return;

    const token = await this.authService.getToken(); // <-- ahora con await
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/solicitudes`, {
          headers: await this.obtenerHeaders(),
        })
      );
      this.solicitudes = data || [];
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      this.error = 'No se pudieron cargar las solicitudes';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async atenderSolicitud(id: number) {
    this.error = '';
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/solicitudes/${id}/atender`,
          {},
          { headers: await this.obtenerHeaders() }
        )
      );
      await this.cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al atender solicitud:', err);
      this.error = err.error?.error || 'No se pudo atender la solicitud';
    }
  }

  async terminarSolicitud(id: number) {
    this.error = '';
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/solicitudes/${id}/terminar`,
          {},
          { headers: await this.obtenerHeaders() }
        )
      );
      await this.cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al terminar solicitud:', err);
      this.error = err.error?.error || 'No se pudo terminar la solicitud';
    }
  }

  mostrarCategoria(categoria: string): string {
    const categorias: any = {
      tecnico: 'Servicio técnico',
      enfermeria: 'Emergencia médica',
      limpieza: 'Limpieza',
      seguridad: 'Seguridad', // agregado, faltaba en la versión original
    };
    return categorias[categoria] || categoria;
  }

  async cerrarSesion() {
    await this.authService.logout(); // <-- ahora con await
    this.router.navigate(['/login']);
  }
}
