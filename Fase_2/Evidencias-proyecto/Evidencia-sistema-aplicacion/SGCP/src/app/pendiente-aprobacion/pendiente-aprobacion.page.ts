// src/app/pendiente-aprobacion/pendiente-aprobacion.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-pendiente-aprobacion',
  templateUrl: './pendiente-aprobacion.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PendienteAprobacionPage {
  verificando = false;
  mensaje = '';

  constructor(private authService: AuthService, private router: Router) {}

  async verificarEstado() {
    this.verificando = true;
    this.mensaje = '';
    try {
      const usuario = await this.authService.obtenerPerfilActual();
      if (usuario.rol === 'staff') {
        this.mensaje = 'Tu cuenta todavía está pendiente de aprobación.';
      } else {
        // Ya fue asignado a un rol específico — redirige a la app normal
        this.router.navigate(['/home']);
      }
    } catch {
      this.mensaje = 'No se pudo verificar el estado. Intenta de nuevo.';
    } finally {
      this.verificando = false;
    }
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}