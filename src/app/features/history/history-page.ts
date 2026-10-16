import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { BillsApi } from '../../core/api/bills-api.service';
import { LocalDatePipe, MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { Bill, DailyReport } from '../../core/models';
import { Notifier } from '../../core/ui/notifier.service';
import { TicketDialog } from '../../shared/ticket-dialog';

/** Manager only: the bills paid on a day and the summary of that day's service. */
@Component({
  selector: 'app-history-page',
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    MoneyPipe,
    LocalDatePipe,
  ],
  templateUrl: './history-page.html',
  styleUrl: './history-page.scss',
})
export class HistoryPage {
  private readonly api = inject(BillsApi);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);

  protected readonly today = startOfDay(new Date());
  protected readonly day = signal(this.today);
  protected readonly report = signal<DailyReport | null>(null);
  protected readonly bills = signal<Bill[]>([]);
  protected readonly loading = signal(true);

  protected readonly isToday = computed(() => this.day().getTime() === this.today.getTime());
  protected readonly bestWaiterTotal = computed(() =>
    Math.max(1, ...(this.report()?.by_waiter.map((w) => w.total) ?? [])),
  );

  constructor() {
    effect(() => {
      const day = this.day();
      untracked(() => this.load(day));
    });
  }

  protected setDay(value: Date | null): void {
    if (value) this.day.set(startOfDay(value));
  }

  protected shiftDay(days: number): void {
    const next = new Date(this.day());
    next.setDate(next.getDate() + days);
    if (next <= this.today) this.day.set(next);
  }

  protected showTicket(bill: Bill): void {
    this.dialog.open(TicketDialog, { data: bill, autoFocus: 'dialog' });
  }

  protected barWidth(total: number): string {
    return `${Math.max(4, (total / this.bestWaiterTotal()) * 100)}%`;
  }

  private load(day: Date): void {
    this.loading.set(true);
    const iso = toIsoDate(day);
    forkJoin({ report: this.api.dailyReport(iso), bills: this.api.listByDay(iso) }).subscribe({
      next: ({ report, bills }) => {
        this.report.set(report);
        this.bills.set(bills);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.notifier.error(error);
      },
    });
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** YYYY-MM-DD in local time (toISOString would use UTC and could change the day). */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
