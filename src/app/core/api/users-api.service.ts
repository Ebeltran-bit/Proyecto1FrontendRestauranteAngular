import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Role, User, UserCreate } from '../models';
import { API_URL } from './api-url';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/users`;

  list(role?: Role): Observable<User[]> {
    const params = role ? new HttpParams().set('role', role) : undefined;
    return this.http.get<User[]>(this.url, { params });
  }

  create(body: UserCreate): Observable<User> {
    return this.http.post<User>(this.url, body);
  }

  delete(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}`);
  }
}
