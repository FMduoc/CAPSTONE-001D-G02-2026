import { NgModule } from '@angular/core';
import {
  PreloadAllModules,
  RouterModule,
  Routes
} from '@angular/router';

const routes: Routes = [

  // LOGIN
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.page')
        .then(m => m.LoginPage)
  },

  // REGISTRO
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.page')
        .then(m => m.RegisterPage)
  },

  // HOME ACTUAL
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module')
        .then(m => m.HomePageModule)
  },

  // SOPORTE
  {
    path: 'inicio-soporte',
    loadComponent: () =>
      import('./soporte/inicio-soporte.page')
        .then(m => m.InicioSoportePage)
  },

  // INICIO DE LA APP
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // CUALQUIER RUTA QUE NO EXISTA
  {
    path: '**',
    redirectTo: 'login'
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        preloadingStrategy: PreloadAllModules
      }
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}