import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() || inject(Router).createUrlTree(['/login']);
};

export const managerGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  return auth.isManager() || inject(Router).createUrlTree(['/']);
};

/** The login page is only for people who are not logged in yet. */
export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  return !auth.isLoggedIn() || inject(Router).createUrlTree(['/']);
};
