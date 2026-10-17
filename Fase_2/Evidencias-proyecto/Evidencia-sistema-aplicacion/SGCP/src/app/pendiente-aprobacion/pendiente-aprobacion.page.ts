import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-pendiente-aprobacion',
  templateUrl: './pendiente-aprobacion.page.html',
  styleUrls: ['./pendiente-aprobacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PendienteAprobacionPage {
  verificando = false;
  mensaje = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async verificarEstado() {
    this.verificando = true;
    this.mensaje = '';
    this.cdr.detectChanges();

    try {
      const usuario = await this.authService.obtenerPerfilActual();

      if (usuario.rol === 'staff') {
        this.mensaje = 'Tu cuenta todavía está pendiente de aprobación.';
      } else {
        this.redirigirSegunRol(usuario.rol);
      }
    } catch {
      this.mensaje = 'No se pudo verificar el estado. Intenta de nuevo.';
    } finally {
      this.verificando = false;
      this.cdr.detectChanges();
    }
  }

  private redirigirSegunRol(rol: string) {
    const rolesSoporte = ['tecnico', 'enfermeria', 'seguridad', 'limpieza'];

    let destino = '/login';
    if (rol === 'solicitante' || rol === 'administrador') destino = '/inicio-docente';
    else if (rolesSoporte.includes(rol)) destino = '/inicio-soporte';

    this.ngZone.run(() => this.router.navigate([destino]));
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.ngZone.run(() => this.router.navigate(['/login']));
  }
}
