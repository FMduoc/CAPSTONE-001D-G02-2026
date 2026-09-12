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

  iniciarSesion() {
    this.error = '';
    this.authService.login(this.email, this.contrasena).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => (this.error = 'Email o contraseña incorrectos'),
    });
  }
}
