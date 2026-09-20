import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  solicitudes: any[] = [];

  constructor() {}

  crearPrueba() {
    console.log('Crear solicitud de prueba');
  }

}