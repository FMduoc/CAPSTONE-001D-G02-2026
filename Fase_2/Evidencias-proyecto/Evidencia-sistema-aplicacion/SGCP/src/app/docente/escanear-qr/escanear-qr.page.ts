import { Component, ViewChild, ElementRef, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { SalaService } from '../../services/sala';

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

  private procesando = false; // evita resolver dos veces el mismo escaneo
  private codeReader = new BrowserQRCodeReader();
  private controlsWeb?: IScannerControls;

  constructor(
    private salaService: SalaService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

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

    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });
      const valor = barcodes[0]?.rawValue;

      // Al volver de la pantalla nativa hay que reentrar a la zona de Angular
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
    }
  }

  private async solicitarPermisoNativo(): Promise<boolean> {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted') return true;

    const { camera: resultado } = await BarcodeScanner.requestPermissions();
    return resultado === 'granted';
  }

  // ===== MÉTODO WEB (sin cambios de lógica) =====
  private async escanearConCamaraWeb() {
    this.escaneandoWeb = true;

    setTimeout(async () => {
      try {
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

        this.controlsWeb = await this.codeReader.decodeFromConstraints(
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
          this.buscando = false;
          this.procesando = false;
          // Datos en la URL (sobreviven a una recreación del WebView) y en state
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
