import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUserValue;
  if (user && user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPERADMIN'))) {
    return true;
  }

  window.alert('You do not have permission to access this page.');
  return false;
};