import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Language } from '../core/i18n/dictionary';
import { TranslatePipe } from '../core/i18n/pipes';
import { TranslationService } from '../core/i18n/translation.service';
import { Flag } from '../shared/flag';

/** UK and Spanish flags: one click changes the language of the whole app at once. */
@Component({
  selector: 'app-language-switch',
  imports: [MatButtonModule, MatTooltipModule, Flag, TranslatePipe],
  template: `
    <div class="switch" role="group" [attr.aria-label]="'nav.language' | t">
      @for (option of options; track option.language) {
        <button
          type="button"
          class="flag-button"
          [class.active]="i18n.language() === option.language"
          [attr.aria-pressed]="i18n.language() === option.language"
          [attr.aria-label]="option.label | t"
          [matTooltip]="option.label | t"
          (click)="i18n.use(option.language)"
        >
          <app-flag [language]="option.language" />
        </button>
      }
    </div>
  `,
  styles: `
    .switch {
      display: inline-flex;
      gap: 4px;
      padding: 3px;
      border-radius: 999px;
      background: var(--mat-sys-surface-container-high);
    }
    .flag-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 5px 7px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      cursor: pointer;
      opacity: 0.55;
      filter: saturate(0.6);
      transition:
        opacity 0.15s,
        background-color 0.15s,
        filter 0.15s;
    }
    .flag-button:hover {
      opacity: 0.9;
    }
    .flag-button.active {
      opacity: 1;
      filter: none;
      background: var(--mat-sys-surface);
      box-shadow: var(--mat-sys-level1);
    }
    .flag-button:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: 1px;
    }
  `,
})
export class LanguageSwitch {
  protected readonly i18n = inject(TranslationService);
  protected readonly options: { language: Language; label: 'nav.english' | 'nav.spanish' }[] = [
    { language: 'en', label: 'nav.english' },
    { language: 'es', label: 'nav.spanish' },
  ];
}
