import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

// canActivate: [authGuard] tiene el propósito de requerir una sesión activa para acceder a estas páginas.

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage) },
  { path: 'pendiente-aprobacion', loadComponent: () => import('./pendiente-aprobacion/pendiente-aprobacion.page').then(m => m.PendienteAprobacionPage) },

  // Usuario solicitante / Docente
  { path: 'inicio-docente', canActivate: [authGuard], loadComponent: () => import('./docente/inicio-docente/inicio-docente.page').then(m => m.InicioDocentePage) },
  { path: 'escanear-qr', canActivate: [authGuard], loadComponent: () => import('./docente/escanear-qr/escanear-qr.page').then(m => m.EscanearQrPage) },
  { path: 'docente/detalle-solicitud', canActivate: [authGuard], loadComponent: () => import('./docente/detalle-solicitud/detalle-solicitud.page').then(m => m.DetalleSolicitudPage) },
  { path: 'historial-peticiones', canActivate: [authGuard], loadComponent: () => import('./docente/historial-peticiones/historial-peticiones.page').then(m => m.HistorialPeticionesPage) },

  // Usuario receptor / Soporte
  { path: 'inicio-soporte', canActivate: [authGuard], loadComponent: () => import('./soporte/inicio-soporte.page').then(m => m.InicioSoportePage) },
  { path: 'atencion-soporte', canActivate: [authGuard], loadComponent: () => import('./atencion-soporte/atencion-soporte.page').then(m => m.AtencionSoportePage) },

  // Cualquier ruta que no exista
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
