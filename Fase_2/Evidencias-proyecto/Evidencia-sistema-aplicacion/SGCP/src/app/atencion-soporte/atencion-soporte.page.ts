import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import {
  SoporteService,
  SolicitudSoporte,
  etiquetaCategoria,
  etiquetaUrgencia,
} from '../services/soporte';

@Component({
  selector: 'app-atencion-soporte',
  templateUrl: './atencion-soporte.page.html',
  styleUrls: ['./atencion-soporte.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AtencionSoportePage {
  solicitudes: SolicitudSoporte[] = [];
  usuarioId: number | null = null;
  idDestacado: number | null = null;
  cargando = false;
  terminandoId: number | null = null;
  error = '';

  // Se exponen para poder usarlas desde el template
  readonly etiquetaCategoria = etiquetaCategoria;
  readonly etiquetaUrgencia = etiquetaUrgencia;

  constructor(
    private authService: AuthService,
    private soporteService: SoporteService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  // Ionic mantiene las páginas en caché: ngOnInit solo corre la primera vez,
  // ionViewWillEnter corre cada vez que la pantalla vuelve a mostrarse.
  async ionViewWillEnter() {
    const usuario = await this.authService.getUsuario();
    this.usuarioId = usuario?.id ?? null;

    const idParam = this.route.snapshot.queryParamMap.get('id');
    this.idDestacado = idParam ? Number(idParam) : null;

    await this.cargar();
  }

  // Solicitudes que este usuario aceptó y aún no termina.
  // La que se acaba de aceptar (si viene en la URL) se muestra primero.
  get enAtencion(): SolicitudSoporte[] {
    return this.solicitudes
      .filter((s) => s.estado === 'atendida' && s.atendido_por === this.usuarioId)
      .sort((a, b) => Number(b.id === this.idDestacado) - Number(a.id === this.idDestacado));
  }

  async cargar() {
    if (this.cargando) return;

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      this.solicitudes = await this.soporteService.listarSolicitudes();
    } catch (err) {
      console.error('Error al cargar solicitudes en atención:', err);
      this.error = 'No se pudieron cargar las solicitudes';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async terminar(id: number) {
    this.error = '';
    this.terminandoId = id;
    this.cdr.detectChanges();

    try {
      await this.soporteService.terminar(id);
    } catch (err: any) {
      console.error('Error al terminar solicitud:', err);
      this.error = err.error?.error || 'No se pudo terminar la solicitud.';
    } finally {
      this.terminandoId = null;
    }

    // Se recarga siempre: si falló, puede que otro usuario ya la haya modificado
    await this.cargar();
  }

  volverAPendientes() {
    this.router.navigate(['/inicio-soporte']);
  }
}
