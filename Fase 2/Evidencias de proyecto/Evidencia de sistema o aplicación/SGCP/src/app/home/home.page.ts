/*

import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor() {}

}

*/

// src/app/home/home.page.ts
import { Component, OnInit } from '@angular/core';
import { SolicitudService } from '../services/solicitud';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Solicitud } from '../models/solicitud.model';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage implements OnInit {
  solicitudes: Solicitud[] = [];

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.solicitudService.listar().subscribe({
      next: (data: Solicitud[]) => (this.solicitudes = data),
      error: (err: unknown) => console.error('Error al cargar solicitudes:', err)
    });
  }

  crearPrueba() {
    this.solicitudService.crear({
      sala_id: 1,
      nombre_solicitante: 'Prueba desde Ionic',
      descripcion: 'Proyector no enciende'
    }).subscribe({
      next: () => this.cargarSolicitudes(),
      error: (err: unknown) => console.error('Error al crear:', err)
    });
  }
}
