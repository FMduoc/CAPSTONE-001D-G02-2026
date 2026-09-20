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
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterLink
  ],
})
export class LoginPage implements OnInit {

  email = '';
  contrasena = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {

    const autenticado =
      await this.authService.isAuthenticated();

    if (autenticado) {
      this.redirigirSegunRol();
    }

  }


  iniciarSesion() {

    this.error = '';

    this.authService
      .login(
        this.email.trim().toLowerCase(),
        this.contrasena
      )
      .subscribe({

        next: () => {
          this.redirigirSegunRol();
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


  private redirigirSegunRol() {

    const rol =
      this.authService.getRol();

    const rolesSoporte = [
      'tecnico',
      'enfermeria',
      'limpieza'
    ];

    if (
      rol &&
      rolesSoporte.includes(rol)
    ) {

      this.router.navigate([
        '/inicio-soporte'
      ]);

      return;

    }

    this.router.navigate([
      '/home'
    ]);

  }

}