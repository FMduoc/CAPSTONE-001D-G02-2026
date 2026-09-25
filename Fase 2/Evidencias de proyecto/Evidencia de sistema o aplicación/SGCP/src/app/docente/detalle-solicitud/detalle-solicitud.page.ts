//detalle-solicitud.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { SolicitudService } from '../../services/solicitud';

@Component({
  selector: 'app-detalle-solicitud',
  templateUrl: './detalle-solicitud.page.html',
  styleUrls: ['./detalle-solicitud.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class DetalleSolicitudPage implements OnInit {
  salaId: number | null = null;
  salaNombre = '';
  descripcion = '';
  categoria = '';
  motivoSeleccionado = '';
  urgencia = 'media'; // valor por defecto
  error = '';
  enviando = false;
  enviado = false;
  avisoCobertura = ''; // mensaje si no hay staff disponible

  categorias = [
    { valor: 'tecnico', etiqueta: 'Servicio técnico', icono: 'construct-outline' },
    { valor: 'enfermeria', etiqueta: 'Emergencia médica', icono: 'medkit-outline' },
    { valor: 'seguridad', etiqueta: 'Seguridad', icono: 'shield-checkmark-outline' },
    { valor: 'limpieza', etiqueta: 'Limpieza', icono: 'sparkles-outline' },
  ];

  sugerenciasPorCategoria: Record<string, string[]> = {
    tecnico: [
      'El proyector no enciende',
      'No hay conexión a internet',
      'El computador no enciende',
      'El aire acondicionado no funciona',
    ],
    enfermeria: [
      'Alumno con malestar general',
      'Accidente o caída',
      'Persona con dificultad para respirar',
      'Necesita primeros auxilios',
    ],
    seguridad: [
      'Persona ajena a la institución en el lugar',
      'Conflicto o alteración de orden',
      'Objeto sospechoso',
      'Necesito apoyo de seguridad',
    ],
    limpieza: [
      'Derrame de líquido',
      'Sala con basura acumulada',
      'Baño necesita limpieza',
      'Vidrio roto o algo que limpiar',
    ],
  };

  // Urgencia sugerida automáticamente según el motivo elegido
  urgenciaPorMotivo: Record<string, string> = {
    'El proyector no enciende': 'baja',
    'No hay conexión a internet': 'media',
    'El computador no enciende': 'media',
    'El aire acondicionado no funciona': 'baja',

    'Alumno con malestar general': 'media',
    'Accidente o caída': 'alta',
    'Persona con dificultad para respirar': 'critica',
    'Necesita primeros auxilios': 'alta',

    'Persona ajena a la institución en el lugar': 'alta',
    'Conflicto o alteración de orden': 'alta',
    'Objeto sospechoso': 'critica',
    'Necesito apoyo de seguridad': 'alta',

    'Derrame de líquido': 'media',
    'Sala con basura acumulada': 'baja',
    'Baño necesita limpieza': 'baja',
    'Vidrio roto o algo que limpiar': 'media',
  };

  // Opciones para el selector manual (motivo "otro")
  opcionesUrgencia = [
    { valor: 'baja', etiqueta: 'Baja' },
    { valor: 'media', etiqueta: 'Media' },
    { valor: 'alta', etiqueta: 'Alta' },
    { valor: 'critica', etiqueta: 'Crítica' },
  ];

  constructor(
    private solicitudService: SolicitudService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const state = history.state;
    if (!state?.salaId) {
      this.error = 'No se pudo identificar la sala. Vuelve a escanear el código.';
      return;
    }
    this.salaId = state.salaId;
    this.salaNombre = state.salaNombre;
  }

  get sugerenciasActuales(): string[] {
    return this.sugerenciasPorCategoria[this.categoria] || [];
  }

  get mostrarCampoDescripcion(): boolean {
    return this.motivoSeleccionado === 'otro';
  }

  seleccionarCategoria(valor: string) {
    this.categoria = valor;
    this.motivoSeleccionado = '';
    this.descripcion = '';
    this.urgencia = 'media';
    this.error = '';
  }

  seleccionarMotivo(texto: string) {
    this.motivoSeleccionado = texto;
    this.descripcion = texto;
    this.urgencia = this.urgenciaPorMotivo[texto] || 'media';
    this.error = '';
  }

  seleccionarOtro() {
    this.motivoSeleccionado = 'otro';
    this.descripcion = '';
    this.urgencia = 'media'; // el usuario la ajusta manualmente
    this.error = '';
  }

  async enviarSolicitud() {
    if (!this.categoria) {
      this.error = 'Selecciona una categoría antes de enviar';
      return;
    }
    if (!this.descripcion.trim()) {
      this.error = 'Describe brevemente el problema antes de enviar';
      return;
    }
    if (!this.salaId) return;

    this.enviando = true;
    this.error = '';
    this.avisoCobertura = '';
    this.cdr.detectChanges();

    try {
      await this.solicitudService.crear({
        sala_id: this.salaId,
        descripcion: this.descripcion.trim(),
        categoria: this.categoria,
        urgencia: this.urgencia,
      });
      this.enviado = true;

      // Consulta no bloqueante: avisa si no hay staff disponible ahora
      this.solicitudService.consultarCobertura(this.categoria).then((res) => {
        if (!res.hayDisponibles) {
          this.avisoCobertura =
            'Tu solicitud fue registrada, pero actualmente no hay personal disponible en esta área. Podría tardar más de lo habitual.';
        }
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.error = 'No se pudo enviar la solicitud. Intenta de nuevo.';
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }

  volverAlInicio() {
    this.router.navigate(['/inicio-docente']);
  }

  cancelar() {
    this.router.navigate(['/escanear-qr']);
  }
}
