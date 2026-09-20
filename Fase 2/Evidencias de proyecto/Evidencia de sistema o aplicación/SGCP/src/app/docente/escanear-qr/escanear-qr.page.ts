import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
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

  private codeReader = new BrowserQRCodeReader();
  private controlsWeb?: IScannerControls;

  constructor(private salaService: SalaService, private router: Router) {}

  // Punto de entrada único: decide qué método usar según la plataforma
  async escanear() {
    this.error = '';

    if (Capacitor.isNativePlatform()) {
      await this.escanearConCamaraNativa();
    } else {
      await this.escanearConCamaraWeb();
    }
  }

  // ===== MÉTODO NATIVO (Android/iOS empaquetado) =====
  private async escanearConCamaraNativa() {
    const permitido = await this.solicitarPermisoNativo();
    if (!permitido) {
      this.error = 'Se requiere permiso de cámara para escanear el código';
      return;
    }

    try {
      const { barcodes } = await BarcodeScanner.scan();
      const valor = barcodes[0]?.rawValue;

      if (!valor) {
        this.error = 'No se pudo leer el contenido del código';
        return;
      }

      this.resolverCodigo(valor);
    } catch (err) {
      this.error = 'Ocurrió un error al escanear. Intenta de nuevo.';
    }
  }

  private async solicitarPermisoNativo(): Promise<boolean> {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted') return true;

    const { camera: resultado } = await BarcodeScanner.requestPermissions();
    return resultado === 'granted';
  }

  // ===== MÉTODO WEB (navegador, celular o computador) =====
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
        videoInputDevices.find(d => /back|rear|trasera/i.test(d.label))?.deviceId
        ?? videoInputDevices[0].deviceId;

      const constraints: MediaStreamConstraints = {
          video: {
          deviceId: { exact: deviceId },
          width: { ideal: 800 },
          height: { ideal: 600 },
    // Pide auto-enfoque continuo si el navegador/cámara lo soporta
          advanced: [{ focusMode: 'continuous' } as any],
  },
};

      // Dejamos que ZXing maneje todo el ciclo de vida del stream/video
      this.controlsWeb = await this.codeReader.decodeFromConstraints(
        constraints,
        this.videoElement!.nativeElement,
        (result, err) => {
          if (result) {
            console.log('QR detectado:', result.getText());
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
    this.buscando = true;
    this.error = '';

    this.salaService.buscarPorCodigo(codigo).subscribe({
      next: (sala) => {
        this.buscando = false;
        this.router.navigate(['/docente/detalle-solicitud'], {
          state: { salaId: sala.id, salaNombre: sala.nombre },
        });
      },
      error: () => {
        this.buscando = false;
        this.error = 'Código QR no reconocido. Verifica que sea el código correcto de la sala.';
      },
    });
  }

volver() {
  this.router.navigate(['/inicio-docente']);
}

  ngOnDestroy() {
    this.controlsWeb?.stop();
  }
}
