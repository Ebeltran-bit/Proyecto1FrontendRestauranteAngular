import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => backend.verify());

  function logIn(): void {
    auth.login('ana', 'camarero123').subscribe();
    backend.expectOne('/api/auth/login').flush({
      access_token: 'abc',
      token_type: 'bearer',
      user: { id: 2, username: 'ana', full_name: 'Ana Martín', role: 'waiter' },
    });
  }

  it('sends the session token to the API', () => {
    logIn();
    http.get('/api/tables').subscribe();
    expect(backend.expectOne('/api/tables').request.headers.get('Authorization')).toBe(
      'Bearer abc',
    );
  });

  it('does not send the token to other servers', () => {
    logIn();
    http.get('https://example.com/data').subscribe();
    expect(backend.expectOne('https://example.com/data').request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('ends the session when the API rejects the token', () => {
    logIn();
    expect(auth.isLoggedIn()).toBe(true);
    http.get('/api/tables').subscribe({ error: () => undefined });
    backend
      .expectOne('/api/tables')
      .flush({ detail: 'x' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('comanda.token')).toBeNull();
  });
});
