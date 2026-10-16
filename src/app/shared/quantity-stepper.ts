import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '../core/i18n/pipes';

/** − value + control. Emits the new value; the parent decides what to do with it. */
@Component({
  selector: 'app-quantity-stepper',
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <button
      mat-icon-button
      type="button"
      [disabled]="disabled() || (value() <= min() && !allowBelowMin())"
      (click)="valueChange.emit(value() - 1)"
      [attr.aria-label]="'table.decrease' | t"
    >
      <mat-icon>{{ allowBelowMin() && value() <= min() ? 'delete' : 'remove' }}</mat-icon>
    </button>
    <span class="value" aria-live="polite">{{ value() }}</span>
    <button
      mat-icon-button
      type="button"
      [disabled]="disabled() || value() >= max()"
      (click)="valueChange.emit(value() + 1)"
      [attr.aria-label]="'table.increase' | t"
    >
      <mat-icon>add</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 999px;
      background: var(--mat-sys-surface-container-low);
    }
    .value {
      min-width: 28px;
      text-align: center;
      font: var(--mat-sys-title-medium);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class QuantityStepper {
  readonly value = input.required<number>();
  readonly min = input(1);
  readonly max = input(99);
  readonly disabled = input(false);
  /** When true, pressing − at the minimum still emits (used to offer removing the line). */
  readonly allowBelowMin = input(false);
  readonly valueChange = output<number>();
}
