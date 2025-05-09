import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { CanActivateFn, provideRouter, Router, withHashLocation } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes,  withHashLocation()), provideAnimationsAsync(), provideHttpClient()]
};
