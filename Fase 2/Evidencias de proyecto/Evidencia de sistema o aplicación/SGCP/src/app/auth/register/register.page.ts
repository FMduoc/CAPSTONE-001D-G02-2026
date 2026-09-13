import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
})
export class RegisterPage {
  nombre = '';
  apellido = '';
  email = '';
  contrasena = '';
  confirmarContrasena = '';
  rol: 'solicitante' | 'staff' = 'solicitante'; // valor por defecto
  error = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}


seleccionarRol(valor: 'solicitante' | 'staff') {
  this.rol = valor;
}

  registrarse() {
    console.log({
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      contrasena: this.contrasena,
      rol: this.rol,
  });
    this.error = '';

    if (!this.nombre || !this.apellido || !this.email || !this.contrasena) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.contrasena.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.cargando = true;

    this.authService.register({
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      contrasena: this.contrasena,
      rol: this.rol,
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/login'], { queryParams: { registrado: 'true' } });
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.error || 'No se pudo completar el registro';
      },
    });
  }
}
