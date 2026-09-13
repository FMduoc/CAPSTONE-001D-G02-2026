import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

// canActivate: [authGuard] tiene el propósito de requerir una sesión activa para acceder a estas páginas.

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage) },
  { path: 'home', canActivate: [authGuard], loadChildren: () => import('./home/home.module').then(m => m.HomePageModule), },
  { path: 'pendiente-aprobacion', loadComponent: () => import('./pendiente-aprobacion/pendiente-aprobacion.page').then(m => m.PendienteAprobacionPage), },
  { path: 'inicio-docente', canActivate: [authGuard], loadComponent: () => import('./docente/inicio-docente/inicio-docente.page').then(m => m.InicioDocentePage), },
  { path: 'escanear-qr', canActivate: [authGuard], loadComponent: () => import('./docente/escanear-qr/escanear-qr.page').then(m => m.EscanearQrPage), },
  { path: 'docente/detalle-solicitud', canActivate: [authGuard], loadComponent: () => import('./docente/detalle-solicitud/detalle-solicitud.page').then(m => m.DetalleSolicitudPage), },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})

export class AppRoutingModule { }