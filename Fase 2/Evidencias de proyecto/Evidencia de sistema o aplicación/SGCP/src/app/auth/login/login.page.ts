import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
})
export class LoginPage implements OnInit {
  email = '';
  contrasena = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const autenticado = await this.authService.isAuthenticated();
    if (autenticado) {
      const usuario = await this.authService.getUsuario();
      this.redirigirSegunRol(usuario?.rol);
    }
  }

  iniciarSesion() {
    this.error = '';

    this.authService.login(this.email.trim().toLowerCase(), this.contrasena).subscribe({
      next: async () => {
        const usuario = await this.authService.getUsuario();
        if (!usuario) {
          this.error = 'No se pudo obtener la información del usuario';
          return;
        }
        this.redirigirSegunRol(usuario.rol);
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.error = err.error?.error || 'Email o contraseña incorrectos';
      },
    });
  }

  private redirigirSegunRol(rol?: string) {
    const rolesSoporte = ['tecnico', 'enfermeria', 'seguridad', 'limpieza'];

    if (rol === 'solicitante') {
      this.router.navigate(['/inicio-docente']);
    } else if (rol === 'staff') {
      this.router.navigate(['/pendiente-aprobacion']);
    } else if (rol && rolesSoporte.includes(rol)) {
      this.router.navigate(['/inicio-soporte']);
    } else if (rol === 'administrador') {
      this.router.navigate(['/inicio-docente']); // ajusta si el admin debe ir a otro lado
    } else {
      this.router.navigate(['/login']);
    }
  }
}
