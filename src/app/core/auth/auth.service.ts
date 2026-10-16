import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';

import { API_URL } from '../api/api-url';
import { MenuService } from '../api/menu.service';
import { LoginResponse, User } from '../models';
import { safeStorage } from '../storage';

const TOKEN_KEY = 'comanda.token';
const USER_KEY = 'comanda.user';

/** Who is logged in. The token is remembered so a page reload keeps the session. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly menu = inject(MenuService);
  private readonly url = `${inject(API_URL)}/auth`;

  private readonly _token = signal<string | null>(safeStorage.get(TOKEN_KEY));
  private readonly _user = signal<User | null>(readStoredUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null && this._user() !== null);
  readonly isManager = computed(() => this._user()?.role === 'manager');

  login(username: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.url}/login`, { username, password }).pipe(
      tap((response) => this.startSession(response.access_token, response.user)),
      map((response) => response.user),
    );
  }

  logout(): void {
    if (this._token()) {
      // The local session ends whatever the server answers.
      this.http
        .post(`${this.url}/logout`, null)
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.endSession();
    void this.router.navigate(['/login']);
  }

  /** Called when the API rejects the token (expired, user deleted...). */
  expire(): void {
    this.endSession();
    void this.router.navigate(['/login'], { queryParams: { expired: 1 } });
  }

  /** On start-up, confirm the remembered token is still valid and refresh the user. */
  restore(): Promise<void> {
    if (!this._token()) return Promise.resolve();
    return firstValueFrom(
      this.http.get<User>(`${this.url}/me`).pipe(
        tap((user) => this.storeUser(user)),
        map(() => undefined),
        catchError(() => {
          this.endSession();
          return of(undefined);
        }),
      ),
    );
  }

  private startSession(token: string, user: User): void {
    safeStorage.set(TOKEN_KEY, token);
    this._token.set(token);
    this.storeUser(user);
  }

  private storeUser(user: User): void {
    safeStorage.set(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private endSession(): void {
    safeStorage.remove(TOKEN_KEY);
    safeStorage.remove(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.menu.clear();
  }
}

function readStoredUser(): User | null {
  const raw = safeStorage.get(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
