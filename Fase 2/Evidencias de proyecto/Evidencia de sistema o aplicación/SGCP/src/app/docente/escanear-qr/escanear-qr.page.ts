import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { SalaService } from '../../services/sala';

@Component({
  selector: 'app-escanear-qr',
  templateUrl: './escanear-qr.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class EscanearQrPage {
  error = '';
  buscando = false;
  codigoManual = ''; // solo para pruebas sin cámara/dispositivo real

  constructor(private salaService: SalaService, private router: Router) {}

  async escanearConCamara() {
    this.error = '';

    const permitido = await this.solicitarPermiso();
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

  buscarManual() {
    if (!this.codigoManual.trim()) return;
    this.resolverCodigo(this.codigoManual.trim());
  }

  private async solicitarPermiso(): Promise<boolean> {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted') return true;

    const { camera: resultado } = await BarcodeScanner.requestPermissions();
    return resultado === 'granted';
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
}