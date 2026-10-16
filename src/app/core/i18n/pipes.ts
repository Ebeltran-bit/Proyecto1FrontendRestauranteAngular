import { inject, Pipe, PipeTransform } from '@angular/core';

import { TranslationKey, TranslationParams } from './dictionary';
import { TranslationService } from './translation.service';

// The pipes are impure because their output depends on the current language
// as well as on their input. They only do a dictionary lookup or reuse a cached
// Intl formatter, so running them on every change detection is cheap.

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}

@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(amount: number | null | undefined): string {
    return amount == null ? '' : this.i18n.formatMoney(amount);
  }
}

const DATE_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  time: { hour: '2-digit', minute: '2-digit' },
  short: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
};

@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(
    value: string | Date | null | undefined,
    format: keyof typeof DATE_FORMATS = 'short',
  ): string {
    return value ? this.i18n.formatDate(value, DATE_FORMATS[format]) : '';
  }
}
