import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PushService } from '../../services/push.service';

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
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private pushService: PushService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const autenticado = await this.authService.isAuthenticated();
    if (autenticado) {
      const usuario = await this.authService.getUsuario();
      this.redirigirSegunRol(usuario?.rol);
    }
  }

  iniciarSesion() {
    if (this.cargando) return;

    this.error = '';
    this.cargando = true;
    this.cdr.detectChanges();

    this.authService.login(this.email.trim().toLowerCase(), this.contrasena).subscribe({
      next: async () => {
        try {
          const usuario = await this.authService.getUsuario();
          if (!usuario) {
            this.error = 'No se pudo obtener la información del usuario. Por favor intente nuevamente';
            return;
          }

          // Push en segundo plano, sin bloquear la navegación
          this.pushService.inicializar().catch((err) =>
            console.error('Error al inicializar push:', err)
          );

          this.redirigirSegunRol(usuario.rol);
        } catch (err) {
          console.error('Error tras el login:', err);
          this.error = 'Ocurrió un error al iniciar sesión';
        } finally {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.error = err.error?.error || 'Email o contraseña incorrectos';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private redirigirSegunRol(rol?: string) {
    const rolesSoporte = ['tecnico', 'enfermeria', 'seguridad', 'limpieza'];

    let destino = '/login';
    if (rol === 'solicitante') destino = '/inicio-docente';
    else if (rol === 'staff') destino = '/pendiente-aprobacion';
    else if (rol && rolesSoporte.includes(rol)) destino = '/inicio-soporte';
    else if (rol === 'administrador') destino = '/inicio-docente';

    // ngZone.run garantiza que la navegación actualice la vista
    this.ngZone.run(() => this.router.navigate([destino]));
  }
}
