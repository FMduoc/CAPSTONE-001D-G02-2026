import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud';
import { Solicitud } from '../../models/solicitud.model';

@Component({
  selector: 'app-historial-peticiones',
  templateUrl: './historial-peticiones.page.html',
  styleUrls: ['./historial-peticiones.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HistorialPeticionesPage implements OnInit {
  solicitudes: Solicitud[] = [];
  cargando = true;
  error = '';

  private iconos: Record<string, string> = {
    tecnico: 'construct-outline',
    enfermeria: 'medkit-outline',
    seguridad: 'shield-checkmark-outline',
    limpieza: 'sparkles-outline',
  };

  private etiquetasEstado: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    resuelta: 'Resuelta',
  };

  private etiquetasCategoria: Record<string, string> = {
    tecnico: 'Servicio técnico',
    enfermeria: 'Emergencia médica',
    seguridad: 'Seguridad',
    limpieza: 'Limpieza',
  };

  constructor(
    private solicitudService: SolicitudService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarSolicitudes();
  }

  async cargarSolicitudes() {
    this.cargando = true;
    this.error = '';
    try {
      this.solicitudes = await this.solicitudService.listarMias();
    } catch (err) {
      this.error = 'No se pudo cargar el historial. Intenta de nuevo.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  iconoPorCategoria(categoria?: string): string {
    return this.iconos[categoria ?? ''] || 'help-circle-outline';
  }

  etiquetaCategoria(categoria?: string): string {
    return this.etiquetasCategoria[categoria ?? ''] || categoria || '';
  }

  etiquetaEstado(estado?: string): string {
    return this.etiquetasEstado[estado ?? ''] || estado || '';
  }

  volver() {
    this.router.navigate(['/inicio-docente']);
  }
}
