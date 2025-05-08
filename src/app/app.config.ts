import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { CanActivateFn, provideRouter, Router, withHashLocation } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes,  withHashLocation()), provideAnimationsAsync(), provideHttpClient()]
};


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Almacenar la URL que intentaba visitar para redirigir después del login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};