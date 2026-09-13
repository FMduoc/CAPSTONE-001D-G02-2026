import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-inicio-docente',
  templateUrl: './inicio-docente.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class InicioDocentePage implements OnInit {
  nombre = '';

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const usuario = await this.authService.getUsuario();
    this.nombre = usuario?.nombre || '';
  }

  realizarPeticion() {
    this.router.navigate(['/escanear-qr']); // aún no existe, la construimos en el próximo paso
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}