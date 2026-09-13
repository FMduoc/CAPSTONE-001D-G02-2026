import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud';

@Component({
  selector: 'app-detalle-solicitud',
  templateUrl: './detalle-solicitud.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class DetalleSolicitudPage implements OnInit {
  salaId: number | null = null;
  salaNombre = '';
  descripcion = '';
  error = '';
  enviando = false;
  enviado = false;

  constructor(private solicitudService: SolicitudService, private router: Router) {}

  ngOnInit() {
    const state = history.state;
    if (!state?.salaId) {
      this.error = 'No se pudo identificar la sala. Vuelve a escanear el código.';
      return;
    }
    this.salaId = state.salaId;
    this.salaNombre = state.salaNombre;
  }

  async enviarSolicitud() {
    if (!this.descripcion.trim()) {
      this.error = 'Describe brevemente el problema antes de enviar';
      return;
    }
    if (!this.salaId) return;

    this.enviando = true;
    this.error = '';

    try {
      await this.solicitudService.crear({
        sala_id: this.salaId,
        descripcion: this.descripcion.trim(),
      });
      this.enviado = true;
    } catch (err) {
      this.error = 'No se pudo enviar la solicitud. Intenta de nuevo.';
    } finally {
      this.enviando = false;
    }
  }

  volverAlInicio() {
    this.router.navigate(['/inicio-docente']);
  }
}