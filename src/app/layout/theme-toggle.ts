import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslatePipe } from '../core/i18n/pipes';
import { ThemeService } from '../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe],
  template: `
    @let dark = theme.theme() === 'dark';
    <button
      mat-icon-button
      type="button"
      (click)="theme.toggle()"
      [attr.aria-label]="(dark ? 'nav.lightMode' : 'nav.darkMode') | t"
      [matTooltip]="(dark ? 'nav.lightMode' : 'nav.darkMode') | t"
    >
      <mat-icon>{{ dark ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
