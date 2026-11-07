import { App } from '@capacitor/app';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Preferences } from '@capacitor/preferences';

constructor(private router: Router) {
  App.addListener('appRestoredResult', async (data) => {
    if (data.pluginId === 'BarcodeScanner' && data.methodName === 'scan') {
      await Preferences.remove({ key: 'escaneo_en_curso' });

      if (data.success && data.data?.barcodes?.[0]?.rawValue) {
        const codigo = data.data.barcodes[0].rawValue;
        this.router.navigate(['/escanear-qr'], {
          queryParams: { codigoRestaurado: codigo },
          replaceUrl: true,
        });
      } else {
        this.router.navigate(['/escanear-qr'], {
          queryParams: { interrumpido: 1 },
          replaceUrl: true,
        });
      }
    }
  });
}