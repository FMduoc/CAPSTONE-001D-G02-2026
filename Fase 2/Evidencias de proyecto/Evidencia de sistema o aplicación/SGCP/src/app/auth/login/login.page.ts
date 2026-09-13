import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
})
export class LoginPage {
  email = '';
  contrasena = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    // Si ya hay sesión activa, saltar directo a Home
    const autenticado = await this.authService.isAuthenticated();
    if (autenticado) this.router.navigate(['/home']);
  }


  // Redirección al hacer login. Contiene verififación según usuario clase "docente", "staff" u otros que son asignados por el admin.
  iniciarSesion() {
    this.error = '';
    this.authService.login(this.email, this.contrasena).subscribe({
      next: async () => {
        const usuario = await this.authService.getUsuario();
        if (!usuario) {
          this.error = 'No se pudo obtener la información del usuario';
          return;
        }
        if (usuario.rol === 'docente') {
          this.router.navigate(['/inicio-docente']);
        } else if (usuario.rol === 'staff') {
          this.router.navigate(['/pendiente-aprobacion']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => (this.error = 'Email o contraseña incorrectos'),
    });
  }
}

/*
// Navegar al usuario en caso de ser docente o staff
if (usuario.rol === 'docente') {
  this.router.navigate(['/enviar-solicitud']);
}
*/
