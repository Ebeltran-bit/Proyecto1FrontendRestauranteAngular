import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Bill, DailyReport } from '../models';
import { API_URL } from './api-url';

/** Paid bills and the daily summary (manager only, except reading one bill). */
@Injectable({ providedIn: 'root' })
export class BillsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_URL);

  listByDay(day: string): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.base}/bills`, {
      params: new HttpParams().set('day', day),
    });
  }

  dailyReport(day: string): Observable<DailyReport> {
    return this.http.get<DailyReport>(`${this.base}/reports/daily`, {
      params: new HttpParams().set('day', day),
    });
  }
}
