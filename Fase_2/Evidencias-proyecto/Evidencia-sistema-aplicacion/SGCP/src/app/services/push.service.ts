import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class PushService {
  private apiUrl = `${environment.apiUrl}/push`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async inicializar() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications: entorno web, se omite registro');
      return;
    }

    const permiso = await PushNotifications.requestPermissions();
    if (permiso.receive !== 'granted') {
      console.warn('Permiso de notificaciones no otorgado');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      const plataforma = Capacitor.getPlatform() as 'android' | 'ios';
      await this.registrarToken(token.value, plataforma);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Error al registrar para push:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación recibida en primer plano:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Notificación tocada:', action.notification);
    });
  }

  private async registrarToken(token: string, plataforma: 'android' | 'ios' | 'web') {
    const authToken = await this.authService.getToken();
    return firstValueFrom(
      this.http.post(
        `${this.apiUrl}/registrar-token`,
        { token, plataforma },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
    );
  }
}
