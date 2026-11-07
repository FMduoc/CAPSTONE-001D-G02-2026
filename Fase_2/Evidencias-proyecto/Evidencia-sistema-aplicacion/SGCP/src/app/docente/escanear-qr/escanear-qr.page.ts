import { Component, ViewChild, ElementRef, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router, ActivatedRoute } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
// Solo el tipo: no carga la librería en tiempo de ejecución
import type { IScannerControls } from '@zxing/browser';
import { SalaService } from '../../services/sala';

// Marca que se guarda antes de abrir la cámara. Si Android cierra la app
// durante el escaneo, la marca sigue ahí y el login devuelve al usuario aquí.
const CLAVE_ESCANEO = 'escaneo_en_curso';

@Component({
  selector: 'app-escanear-qr',
  templateUrl: './escanear-qr.page.html',
  styleUrls: ['./escanear-qr.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class EscanearQrPage implements OnDestroy {
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;

  error = '';
  buscando = false;
  escaneandoWeb = false;
  codigoManual = '';

  private procesando = false;
  private controlsWeb?: IScannerControls;

  constructor(
    private salaService: SalaService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  // Ionic conserva esta pantalla en memoria al navegar al detalle.
  // Cada vez que se vuelve a mostrar, partimos de un estado limpio.
  ionViewWillEnter() {
    this.controlsWeb?.stop();
    this.buscando = false;
    this.procesando = false;
    this.escaneandoWeb = false;
    this.error = '';
    this.codigoManual = '';

    // La app se reinició mientras la cámara estaba abierta
    if (this.route.snapshot.queryParamMap.get('interrumpido')) {
      this.error = 'El escaneo se interrumpió porque el celular cerró la app. Intenta de nuevo.';
      // Limpia el parámetro para que no reaparezca al volver desde otra pantalla
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }

    this.cdr.detectChanges();
  }

  async escanear() {
    if (this.procesando) return;
    this.error = '';

    if (Capacitor.isNativePlatform()) {
      await this.escanearConCamaraNativa();
    } else {
      await this.escanearConCamaraWeb();
    }
  }

  // ===== MÉTODO NATIVO =====
  private async escanearConCamaraNativa() {
    const permitido = await this.solicitarPermisoNativo();
    if (!permitido) {
      this.ngZone.run(() => {
        this.error = 'Se requiere permiso de cámara para escanear el código';
        this.cdr.detectChanges();
      });
      return;
    }

    // Se guarda antes de abrir la cámara; si la app muere, queda registrada
    await Preferences.set({ key: CLAVE_ESCANEO, value: String(Date.now()) });

    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });
      const valor = barcodes[0]?.rawValue;

      this.ngZone.run(() => {
        if (!valor) {
          this.error = 'No se pudo leer el contenido del código';
          this.cdr.detectChanges();
          return;
        }
        this.resolverCodigo(valor);
      });
    } catch (err) {
      this.ngZone.run(() => {
        this.error = 'Ocurrió un error al escanear. Intenta de nuevo.';
        this.cdr.detectChanges();
      });
    } finally {
      // Si llegamos aquí, la app no murió: ya no hace falta la marca
      await Preferences.remove({ key: CLAVE_ESCANEO });
    }
  }

  private async solicitarPermisoNativo(): Promise<boolean> {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted') return true;

    const { camera: resultado } = await BarcodeScanner.requestPermissions();
    return resultado === 'granted';
  }

  // ===== MÉTODO WEB =====
  private async escanearConCamaraWeb() {
    this.escaneandoWeb = true;

    setTimeout(async () => {
      try {
        // La librería se descarga solo cuando se escanea desde un navegador
        const { BrowserQRCodeReader } = await import('@zxing/browser');

        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          this.error = 'No se detectó ninguna cámara en este dispositivo.';
          this.escaneandoWeb = false;
          return;
        }

        const deviceId =
          videoInputDevices.find((d) => /back|rear|trasera/i.test(d.label))?.deviceId
          ?? videoInputDevices[0].deviceId;

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 800 },
            height: { ideal: 600 },
            advanced: [{ focusMode: 'continuous' } as any],
          },
        };

        const lector = new BrowserQRCodeReader();
        this.controlsWeb = await lector.decodeFromConstraints(
          constraints,
          this.videoElement!.nativeElement,
          (result) => {
            if (result && !this.procesando) {
              this.detenerEscaneoWeb();
              this.resolverCodigo(result.getText());
            }
          }
        );
      } catch (err) {
        console.error('Error al iniciar cámara:', err);
        this.error = 'No se pudo acceder a la cámara. Revisa los permisos del navegador.';
        this.escaneandoWeb = false;
      }
    }, 150);
  }

  detenerEscaneoWeb() {
    this.controlsWeb?.stop();
    this.escaneandoWeb = false;
  }

  buscarManual() {
    if (!this.codigoManual.trim()) return;
    this.resolverCodigo(this.codigoManual.trim());
  }

  private resolverCodigo(codigo: string) {
    if (this.procesando) return;
    this.procesando = true;
    this.buscando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.salaService.buscarPorCodigo(codigo).subscribe({
      next: (sala) => {
        this.ngZone.run(() => {
          // Se limpia el estado antes de navegar, para que no quede pegado al volver
          this.buscando = false;
          this.procesando = false;
          this.cdr.detectChanges();

          this.router.navigate(['/docente/detalle-solicitud'], {
            queryParams: { salaId: sala.id, salaNombre: sala.nombre },
            state: { salaId: sala.id, salaNombre: sala.nombre },
          });
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.buscando = false;
          this.procesando = false;
          this.error = 'Código QR no reconocido. Verifica que sea el código correcto de la sala.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  volver() {
    this.ngZone.run(() => this.router.navigate(['/inicio-docente']));
  }

  ngOnDestroy() {
    this.controlsWeb?.stop();
  }
}