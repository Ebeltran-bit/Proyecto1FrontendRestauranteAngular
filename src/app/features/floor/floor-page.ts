import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { filter, interval } from 'rxjs';

import { TablesApi } from '../../core/api/tables-api.service';
import { LocalDatePipe, MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { TableStatus } from '../../core/models';
import { Notifier } from '../../core/ui/notifier.service';

/** Other devices change the tables too, so the floor refreshes itself while it is on screen. */
const REFRESH_MS = 20_000;

@Component({
  selector: 'app-floor-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslatePipe,
    MoneyPipe,
    LocalDatePipe,
  ],
  templateUrl: './floor-page.html',
  styleUrl: './floor-page.scss',
})
export class FloorPage implements OnInit {
  private readonly api = inject(TablesApi);
  private readonly notifier = inject(Notifier);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tables = signal<TableStatus[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly updatedAt = signal<Date | null>(null);

  protected readonly occupied = computed(
    () => this.tables().filter((t) => t.status === 'occupied').length,
  );
  protected readonly free = computed(() => this.tables().length - this.occupied());
  protected readonly openTotal = computed(
    () => this.tables().reduce((sum, table) => sum + Math.round(table.total * 100), 0) / 100,
  );

  ngOnInit(): void {
    this.load();
    interval(REFRESH_MS)
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.load(true));
  }

  protected load(silent = false): void {
    if (!silent) this.loading.set(true);
    this.api.list().subscribe({
      next: (tables) => {
        this.tables.set(tables);
        this.failed.set(false);
        this.loading.set(false);
        this.updatedAt.set(new Date());
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (!silent) {
          this.failed.set(true);
          this.notifier.error(error);
        }
      },
    });
  }
}
