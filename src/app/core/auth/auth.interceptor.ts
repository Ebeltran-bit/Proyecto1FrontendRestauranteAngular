import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { API_URL } from '../api/api-url';
import { AuthService } from './auth.service';

/** Adds the session token to API calls and sends the user to the login page when it is no longer valid. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const apiUrl = inject(API_URL);
  if (!request.url.startsWith(apiUrl)) return next(request);

  const token = auth.token();
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
  const isAuthCall = request.url.startsWith(`${apiUrl}/auth/`);

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthCall) auth.expire();
      return throwError(() => error);
    }),
  );
};
