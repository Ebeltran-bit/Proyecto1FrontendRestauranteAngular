import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, Observable, switchMap } from 'rxjs';

import { MenuService } from '../../core/api/menu.service';
import { TablesApi } from '../../core/api/tables-api.service';
import { UsersApi } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { TranslationService } from '../../core/i18n/translation.service';
import { Bill, Order, OrderCreate, TableStatus, User } from '../../core/models';
import { Notifier } from '../../core/ui/notifier.service';
import { ConfirmData, ConfirmDialog } from '../../shared/confirm-dialog';
import { QuantityStepper } from '../../shared/quantity-stepper';
import { TicketDialog } from '../../shared/ticket-dialog';
import { OrderDialog, OrderDialogData, OrderDialogResult } from './order-dialog';

interface OrderRow {
  order: Order;
  productName: string;
  presentationName: string;
  lineTotal: number;
}

/**
 * One table: choose who serves it, list its orders, add, change or remove them,
 * and mark it as paid (which prints the ticket and leaves it free).
 */
@Component({
  selector: 'app-table-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    QuantityStepper,
    TranslatePipe,
    MoneyPipe,
  ],
  templateUrl: './table-page.html',
  styleUrl: './table-page.scss',
})
export class TablePage {
  private readonly tablesApi = inject(TablesApi);
  private readonly usersApi = inject(UsersApi);
  private readonly menu = inject(MenuService);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);
  private readonly i18n = inject(TranslationService);
  protected readonly auth = inject(AuthService);

  /** From the route /sala/mesa/:tableId. */
  readonly tableId = input.required<string>();
  private readonly id = computed(() => Number(this.tableId()));

  protected readonly table = signal<TableStatus | null>(null);
  protected readonly orders = signal<Order[]>([]);
  protected readonly waiters = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly busy = signal(false);
  protected readonly waiterMissing = signal(false);

  protected readonly rows = computed<OrderRow[]>(() => {
    this.menu.categories(); // names appear as soon as the menu arrives
    return this.orders().map((order) => {
      const product = this.menu.product(order.product_id);
      return {
        order,
        productName: product?.name ?? `#${order.product_id}`,
        presentationName:
          this.menu.presentation(order.product_id, order.presentation_id)?.name ?? '',
        lineTotal: (Math.round(order.unit_price * 100) * order.quantity) / 100,
      };
    });
  });

  protected readonly itemCount = computed(() =>
    this.orders().reduce((sum, order) => sum + order.quantity, 0),
  );
  protected readonly total = computed(
    () =>
      this.orders().reduce(
        (sum, order) => sum + Math.round(order.unit_price * 100) * order.quantity,
        0,
      ) / 100,
  );

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.notFound.set(false);
    forkJoin({
      table: this.tablesApi.get(id),
      orders: this.tablesApi.listOrders(id),
      waiters: this.usersApi.list('waiter'),
      menu: this.menu.load(),
    }).subscribe({
      next: ({ table, orders, waiters }) => {
        this.table.set(table);
        this.orders.set(orders);
        this.waiters.set(waiters);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422))
          this.notFound.set(true);
        else this.notifier.error(error);
      },
    });
  }

  private refreshTable(): void {
    this.tablesApi.get(this.id()).subscribe((table) => this.table.set(table));
  }

  protected assignWaiter(waiterId: number | null): void {
    const table = this.table();
    if (!table) return;
    this.waiterMissing.set(false);
    this.tablesApi.assignWaiter(table.id, waiterId).subscribe({
      next: (updated) => {
        this.table.set(updated);
        this.notifier.success(
          updated.waiter_name
            ? this.i18n.t('table.waiterSaved', { waiter: updated.waiter_name, table: updated.name })
            : this.i18n.t('table.waiterRemoved', { table: updated.name }),
        );
      },
      error: (error: unknown) => {
        this.notifier.error(error);
        this.refreshTable(); // put the select back to the real value
      },
    });
  }

  protected openAdd(): void {
    const table = this.table();
    if (!table) return;
    this.openOrderDialog({ mode: 'add', tableName: table.name })
      .pipe(switchMap((body) => this.tablesApi.addOrder(table.id, body as OrderCreate)))
      .subscribe({
        next: (order) => {
          this.orders.update((orders) => [...orders, order]);
          this.notifier.success(
            this.i18n.t('table.added', {
              product: this.menu.product(order.product_id)?.name ?? '',
            }),
          );
          this.refreshTable();
        },
        error: (error: unknown) => this.notifier.error(error),
      });
  }

  protected openEdit(order: Order): void {
    const table = this.table();
    if (!table) return;
    this.openOrderDialog({ mode: 'edit', tableName: table.name, order })
      .pipe(filter((changes) => Object.keys(changes).length > 0))
      .subscribe((changes) => this.update(order, changes));
  }

  protected changeQuantity(row: OrderRow, quantity: number): void {
    if (quantity < 1) this.remove(row);
    else this.update(row.order, { quantity });
  }

  private update(order: Order, changes: OrderDialogResult): void {
    this.busy.set(true);
    this.tablesApi.updateOrder(order.table_id, order.id, changes).subscribe({
      next: (updated) => {
        this.orders.update((orders) => orders.map((o) => (o.id === updated.id ? updated : o)));
        this.busy.set(false);
        this.refreshTable();
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.notifier.error(error);
      },
    });
  }

  protected remove(row: OrderRow): void {
    this.confirm({
      title: this.i18n.t('table.deleteTitle'),
      message: this.i18n.t('table.deleteText', { product: row.productName }),
      confirmLabel: this.i18n.t('table.delete'),
      danger: true,
    })
      .pipe(switchMap(() => this.tablesApi.deleteOrder(row.order.table_id, row.order.id)))
      .subscribe({
        next: () => {
          this.orders.update((orders) => orders.filter((o) => o.id !== row.order.id));
          this.notifier.success(this.i18n.t('table.deleted'));
          this.refreshTable();
        },
        error: (error: unknown) => this.notifier.error(error),
      });
  }

  protected pay(): void {
    const table = this.table();
    if (!table || !this.orders().length) return;
    if (table.waiter_id === null) {
      this.waiterMissing.set(true);
      return;
    }
    this.confirm({
      title: this.i18n.t('table.payTitle', { table: table.name }),
      message: this.i18n.t('table.payText'),
      confirmLabel: this.i18n.t('table.confirmPay', { total: this.i18n.formatMoney(this.total()) }),
    })
      .pipe(switchMap(() => this.tablesApi.pay(table.id)))
      .subscribe({
        next: (bill) => {
          this.notifier.success(this.i18n.t('table.paid', { table: table.name }));
          this.showTicket(bill);
          this.load(table.id); // the table is free again and can take a new order straight away
        },
        error: (error: unknown) => {
          this.notifier.error(error);
          this.load(table.id);
        },
      });
  }

  private showTicket(bill: Bill): void {
    this.dialog.open(TicketDialog, {
      data: bill,
      autoFocus: 'dialog',
      panelClass: 'ticket-dialog',
    });
  }

  private openOrderDialog(data: OrderDialogData): Observable<OrderDialogResult> {
    return this.dialog
      .open<OrderDialog, OrderDialogData, OrderDialogResult>(OrderDialog, {
        data,
        width: '640px',
        maxWidth: '96vw',
        panelClass: 'responsive-dialog',
        autoFocus: data.mode === 'add' ? 'first-tabbable' : 'dialog',
      })
      .afterClosed()
      .pipe(filter((result): result is OrderDialogResult => !!result));
  }

  private confirm(data: ConfirmData): Observable<true> {
    return this.dialog
      .open<ConfirmDialog, ConfirmData, boolean>(ConfirmDialog, { data, width: '420px' })
      .afterClosed()
      .pipe(filter((ok): ok is true => ok === true));
  }
}
