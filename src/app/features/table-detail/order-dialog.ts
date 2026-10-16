import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { MenuService } from '../../core/api/menu.service';
import { MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { MenuProduct, Order, OrderCreate, OrderUpdate } from '../../core/models';
import { QuantityStepper } from '../../shared/quantity-stepper';

export const MAX_QUANTITY = 99;
export const MAX_NOTES = 200;

export type OrderDialogData =
  { mode: 'add'; tableName: string } | { mode: 'edit'; tableName: string; order: Order };
export type OrderDialogResult = OrderCreate | OrderUpdate;

/** Pick a product, its presentation, how many and notes for the kitchen. Also edits an existing order. */
@Component({
  selector: 'app-order-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    QuantityStepper,
    TranslatePipe,
    MoneyPipe,
  ],
  templateUrl: './order-dialog.html',
  styleUrl: './order-dialog.scss',
})
export class OrderDialog {
  protected readonly data = inject<OrderDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<OrderDialog, OrderDialogResult>>(MatDialogRef);
  protected readonly menu = inject(MenuService);
  protected readonly maxNotes = MAX_NOTES;
  protected readonly maxQuantity = MAX_QUANTITY;

  private readonly editing = this.data.mode === 'edit' ? this.data.order : null;

  protected readonly search = signal('');
  /** 0 means every category. */
  protected readonly categoryId = signal(0);
  protected readonly product = signal<MenuProduct | null>(
    this.editing ? (this.menu.product(this.editing.product_id) ?? null) : null,
  );
  protected readonly presentationId = signal<number | null>(this.editing?.presentation_id ?? null);
  protected readonly quantity = signal(this.editing?.quantity ?? 1);
  protected readonly notes = signal(this.editing?.notes ?? '');

  protected readonly filteredProducts = computed(() => {
    const text = normalize(this.search());
    const category = this.categoryId();
    return this.menu
      .categories()
      .filter((c) => category === 0 || c.id === category)
      .flatMap((c) => c.products)
      .filter((p) => !text || normalize(p.name).includes(text));
  });

  protected readonly price = computed(() => {
    const product = this.product();
    return product?.presentations.find((p) => p.id === this.presentationId())?.price ?? 0;
  });

  protected readonly total = computed(
    () => (Math.round(this.price() * 100) * this.quantity()) / 100,
  );
  protected readonly canSubmit = computed(
    () =>
      this.product() !== null && this.presentationId() !== null && this.notes().length <= MAX_NOTES,
  );

  protected select(product: MenuProduct): void {
    this.product.set(product);
    // Most products have one presentation, or the waiter wants the first one.
    this.presentationId.set(product.presentations[0]?.id ?? null);
    this.quantity.set(1);
  }

  protected submit(): void {
    const product = this.product();
    const presentationId = this.presentationId();
    if (!this.canSubmit() || !product || presentationId === null) return;
    const notes = this.notes().trim() || null;

    if (this.editing) {
      const changes: OrderUpdate = {};
      if (presentationId !== this.editing.presentation_id) changes.presentation_id = presentationId;
      if (this.quantity() !== this.editing.quantity) changes.quantity = this.quantity();
      if (notes !== this.editing.notes) changes.notes = notes;
      this.dialogRef.close(changes);
    } else {
      this.dialogRef.close({
        product_id: product.id,
        presentation_id: presentationId,
        quantity: this.quantity(),
        notes,
      });
    }
  }
}

/** Lower case without accents, so "croqueta" finds "Croquetas" and "albondigas" finds "Albóndigas". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
