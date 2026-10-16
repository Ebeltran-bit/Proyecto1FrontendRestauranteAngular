import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Bill, Order, OrderCreate, OrderUpdate, TableStatus } from '../models';
import { API_URL } from './api-url';

/** Tables and everything that hangs from a table: its waiter, its orders and its payment. */
@Injectable({ providedIn: 'root' })
export class TablesApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/tables`;

  list(): Observable<TableStatus[]> {
    return this.http.get<TableStatus[]>(this.url);
  }

  get(tableId: number): Observable<TableStatus> {
    return this.http.get<TableStatus>(`${this.url}/${tableId}`);
  }

  assignWaiter(tableId: number, waiterId: number | null): Observable<TableStatus> {
    return this.http.put<TableStatus>(`${this.url}/${tableId}/waiter`, { waiter_id: waiterId });
  }

  pay(tableId: number): Observable<Bill> {
    return this.http.post<Bill>(`${this.url}/${tableId}/pay`, null);
  }

  listOrders(tableId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.url}/${tableId}/orders`);
  }

  addOrder(tableId: number, body: OrderCreate): Observable<Order> {
    return this.http.post<Order>(`${this.url}/${tableId}/orders`, body);
  }

  updateOrder(tableId: number, orderId: number, changes: OrderUpdate): Observable<Order> {
    return this.http.patch<Order>(`${this.url}/${tableId}/orders/${orderId}`, changes);
  }

  deleteOrder(tableId: number, orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${tableId}/orders/${orderId}`);
  }
}
