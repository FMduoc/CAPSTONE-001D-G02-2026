import { Component } from '@angular/core';
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
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterLink
  ],
})
export class LoginPage {

  email = '';
  contrasena = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  iniciarSesion() {

    this.error = '';

    const email =
      this.email.trim().toLowerCase();

    if (!email || !this.contrasena) {

      this.error =
        'Ingresa tu correo y contraseña';

      return;

    }

    this.authService
      .login(
        email,
        this.contrasena
      )
      .subscribe({

        next: (respuesta) => {

          const rol =
            respuesta.usuario?.rol;

          this.redirigirSegunRol(rol);

        },

        error: (err) => {

          console.error(
            'Error al iniciar sesión:',
            err
          );

          this.error =
            err.error?.error ||
            'Email o contraseña incorrectos';

        }

      });

  }


  // ==========================================
  // REDIRECCIÓN SEGÚN ROL
  // ==========================================

  private redirigirSegunRol(
    rol: string | null
  ) {

    const rolesSoporte = [
      'tecnico',
      'enfermeria',
      'limpieza'
    ];

    if (
      rol &&
      rolesSoporte.includes(rol)
    ) {

      this.router.navigateByUrl(
        '/inicio-soporte',
        {
          replaceUrl: true
        }
      );

      return;

    }


    this.router.navigateByUrl(
      '/home',
      {
        replaceUrl: true
      }
    );

  }

}