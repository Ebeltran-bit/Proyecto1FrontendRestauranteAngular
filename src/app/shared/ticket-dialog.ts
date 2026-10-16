import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { LocalDatePipe, MoneyPipe, TranslatePipe } from '../core/i18n/pipes';
import { Bill } from '../core/models';

/** Receipt of a paid bill, laid out like a till roll so it prints on 80 mm paper. */
@Component({
  selector: 'app-ticket-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    MoneyPipe,
    LocalDatePipe,
  ],
  template: `
    <mat-dialog-content class="ticket-wrap">
      <article class="ticket">
        <header>
          <strong class="brand">{{ 'app.name' | t }}</strong>
          <span>{{ 'ticket.number' | t: { id: bill.id } }}</span>
        </header>
        <dl class="info">
          <dt>{{ 'ticket.table' | t }}</dt>
          <dd>{{ bill.table_name }}</dd>
          <dt>{{ 'ticket.waiter' | t }}</dt>
          <dd>{{ bill.waiter_name }}</dd>
          <dt>{{ 'ticket.chargedBy' | t }}</dt>
          <dd>{{ bill.paid_by }}</dd>
          <dt>{{ 'ticket.date' | t }}</dt>
          <dd>{{ bill.paid_at | localDate: 'short' }}</dd>
        </dl>
        <table class="lines">
          <tbody>
            @for (line of bill.lines; track $index) {
              <tr>
                <td class="qty">{{ line.quantity }}×</td>
                <td>
                  {{ line.product_name }}
                  <small>{{ line.presentation_name }} · {{ line.unit_price | money }}</small>
                  @if (line.notes) {
                    <small class="note">{{ line.notes }}</small>
                  }
                </td>
                <td class="amount money">{{ line.line_total | money }}</td>
              </tr>
            }
          </tbody>
        </table>
        <div class="total">
          <span>{{ 'table.total' | t }}</span>
          <strong class="money">{{ bill.total | money }}</strong>
        </div>
        <footer>
          <span>{{ 'ticket.vatIncluded' | t }}</span>
          <span>{{ 'ticket.thanks' | t }}</span>
        </footer>
      </article>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="no-print">
      <button mat-button mat-dialog-close>{{ 'ticket.close' | t }}</button>
      <button mat-flat-button (click)="print()">
        <mat-icon>print</mat-icon>
        {{ 'ticket.print' | t }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .ticket-wrap {
      padding-top: 24px !important;
    }
    .ticket {
      width: 300px;
      max-width: 100%;
      margin: 0 auto;
      padding: 20px 18px;
      background: #fff;
      color: #1b1b1b;
      font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
      font-size: 13px;
      line-height: 1.45;
      border-radius: 4px;
      box-shadow: 0 1px 6px rgb(0 0 0 / 0.18);
    }
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px dashed #999;
    }
    .brand {
      font-size: 18px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .info {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2px 12px;
      margin: 10px 0;
    }
    dt {
      color: #666;
    }
    dd {
      margin: 0;
      text-align: right;
    }
    .lines {
      width: 100%;
      border-collapse: collapse;
      border-top: 1px dashed #999;
      border-bottom: 1px dashed #999;
    }
    td {
      padding: 6px 0;
      vertical-align: top;
    }
    small {
      display: block;
      color: #666;
      font-size: 11px;
    }
    .note {
      font-style: italic;
    }
    .qty {
      width: 32px;
    }
    .amount {
      text-align: right;
    }
    .total {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 16px;
    }
    footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding-top: 8px;
      border-top: 1px dashed #999;
      color: #666;
      font-size: 12px;
    }
    @media print {
      .ticket {
        width: 100%;
        box-shadow: none;
        padding: 0;
      }
    }
  `,
})
export class TicketDialog {
  protected readonly bill = inject<Bill>(MAT_DIALOG_DATA);

  protected print(): void {
    window.print();
  }
}
