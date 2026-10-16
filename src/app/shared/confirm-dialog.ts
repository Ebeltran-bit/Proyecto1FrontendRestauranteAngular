import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { TranslatePipe } from '../core/i18n/pipes';

export interface ConfirmData {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
}

/** Yes/no question before an action that cannot be undone. Closes with true when confirmed. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | t }}</button>
      <button
        mat-flat-button
        [class.danger-button]="data.danger"
        [mat-dialog-close]="true"
        cdkFocusInitial
      >
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmData>(MAT_DIALOG_DATA);
}
