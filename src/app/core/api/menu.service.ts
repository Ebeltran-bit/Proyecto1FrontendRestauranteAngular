import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';

import { MenuCategory, MenuProduct, ProductPresentation } from '../models';
import { API_URL } from './api-url';

/** The menu changes rarely, so it is loaded once per session and kept in memory. */
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/menu`;
  private request$?: Observable<MenuCategory[]>;

  readonly categories = signal<MenuCategory[]>([]);

  private readonly products = computed(() => {
    const byId = new Map<number, MenuProduct>();
    for (const category of this.categories()) {
      for (const product of category.products) byId.set(product.id, product);
    }
    return byId;
  });

  load(): Observable<MenuCategory[]> {
    if (this.categories().length) return of(this.categories());
    this.request$ ??= this.http.get<MenuCategory[]>(this.url).pipe(
      tap({
        next: (menu) => this.categories.set(menu),
        error: () => (this.request$ = undefined),
      }),
      shareReplay(1),
    );
    return this.request$;
  }

  clear(): void {
    this.categories.set([]);
    this.request$ = undefined;
  }

  product(productId: number): MenuProduct | undefined {
    return this.products().get(productId);
  }

  presentation(productId: number, presentationId: number): ProductPresentation | undefined {
    return this.product(productId)?.presentations.find((p) => p.id === presentationId);
  }
}
