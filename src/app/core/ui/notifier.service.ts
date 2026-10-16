import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslationService } from '../i18n/translation.service';

/** Short messages at the bottom of the screen, and readable texts for API errors. */
@Injectable({ providedIn: 'root' })
export class Notifier {
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(TranslationService);

  success(message: string): void {
    this.snackBar.open(message, undefined, { duration: 2500, panelClass: 'snack-success' });
  }

  /** Shows an API error, or a text that is already translated. */
  error(error: unknown): void {
    const message = typeof error === 'string' ? error : this.describe(error);
    this.snackBar.open(message, this.i18n.t('common.close'), {
      duration: 6000,
      panelClass: 'snack-error',
    });
  }

  /**
   * The API explains its errors in Spanish. Those explanations are shown as
   * they are in Spanish; in English a translated text for the status is shown.
   */
  describe(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return this.i18n.t('errors.generic');
    if (error.status === 0) return this.i18n.t('errors.network');
    const detail: unknown = error.error?.detail;
    if (this.i18n.language() === 'es' && typeof detail === 'string') return detail;
    switch (error.status) {
      case 403:
        return this.i18n.t('errors.forbidden');
      case 404:
        return this.i18n.t('errors.notFound');
      case 409:
        return this.i18n.t('errors.conflict');
      case 422:
        return this.i18n.t('errors.invalid');
      default:
        return error.status >= 500 || error.status === 504
          ? this.i18n.t('errors.network')
          : this.i18n.t('errors.generic');
    }
  }
}
