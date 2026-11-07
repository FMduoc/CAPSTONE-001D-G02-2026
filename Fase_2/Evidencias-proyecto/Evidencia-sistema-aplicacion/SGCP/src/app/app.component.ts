import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {
  constructor(private router: Router) {
    this.escucharResultadoRestaurado();
  }

  // Android pudo matar la app mientras la cámara estaba abierta.
  // Capacitor avisa aquí cuando la app renace.
  private escucharResultadoRestaurado() {
    App.addListener('appRestoredResult', async (data) => {
      if (data.pluginId !== 'BarcodeScanner' || data.methodName !== 'scan') return;

      await Preferences.remove({ key: 'escaneo_en_curso' });

      const codigo = data.success ? (data.data as any)?.barcodes?.[0]?.rawValue : null;

      this.router.navigate(['/escanear-qr'], {
        queryParams: codigo ? { codigoRestaurado: codigo } : { interrumpido: 1 },
        replaceUrl: true,
      });
    });
  }
}