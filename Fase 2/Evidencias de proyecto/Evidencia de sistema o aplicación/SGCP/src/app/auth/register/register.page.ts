import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterLink
  ],
})
export class RegisterPage {

  nombre = '';
  apellido = '';
  email = '';

  contrasena = '';
  confirmarContrasena = '';

  // Lo que el usuario selecciona visualmente
  tipoCuenta = 'solicitante';

  // Área cuando selecciona Personal
  areaSoporte = 'tecnico';

  error = '';
  cargando = false;


  tiposCuenta = [
    {
      valor: 'solicitante',
      etiqueta: 'Docente'
    },
    {
      valor: 'personal',
      etiqueta: 'Personal'
    }
  ];


  areasSoporte = [
    {
      valor: 'tecnico',
      etiqueta: 'Servicio técnico'
    },
    {
      valor: 'enfermeria',
      etiqueta: 'Enfermería'
    },
    {
      valor: 'limpieza',
      etiqueta: 'Limpieza'
    }
  ];


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  registrarse() {

    this.error = '';

    const nombre =
      this.nombre.trim();

    const apellido =
      this.apellido.trim();

    const email =
      this.email
        .trim()
        .toLowerCase();


    if (
      !nombre ||
      !apellido ||
      !email ||
      !this.contrasena ||
      !this.confirmarContrasena ||
      !this.tipoCuenta
    ) {

      this.error =
        'Todos los campos son obligatorios';

      return;

    }


    if (
      this.tipoCuenta === 'personal' &&
      !this.areaSoporte
    ) {

      this.error =
        'Debes seleccionar un área de soporte';

      return;

    }


    if (
      this.contrasena !==
      this.confirmarContrasena
    ) {

      this.error =
        'Las contraseñas no coinciden';

      return;

    }


    if (this.contrasena.length < 8) {

      this.error =
        'La contraseña debe tener al menos 8 caracteres';

      return;

    }


    // ==========================================
    // DEFINIR ROL REAL PARA EL BACKEND
    // ==========================================

    let rolBackend = 'solicitante';


    if (this.tipoCuenta === 'personal') {

      rolBackend =
        this.areaSoporte;

    }


    this.cargando = true;


    this.authService
      .register({

        nombre,
        apellido,
        email,

        contrasena:
          this.contrasena,

        rol:
          rolBackend

      })
      .subscribe({

        next: () => {

          this.cargando = false;

          this.router.navigate(
            ['/login'],
            {
              queryParams: {
                registrado: 'true'
              }
            }
          );

        },


        error: (err) => {

          this.cargando = false;

          this.error =
            err.error?.error ||
            'No se pudo completar el registro';

        }

      });

  }

}