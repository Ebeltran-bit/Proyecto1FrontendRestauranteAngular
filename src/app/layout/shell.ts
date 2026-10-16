import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth/auth.service';
import { roleKey, TranslationKey } from '../core/i18n/dictionary';
import { TranslatePipe } from '../core/i18n/pipes';
import { Brand } from './brand';
import { LanguageSwitch } from './language-switch';
import { ThemeToggle } from './theme-toggle';

interface NavLink {
  path: string;
  label: TranslationKey;
  icon: string;
  managerOnly: boolean;
}

/** Frame of the logged-in app: top bar (navigation, language, theme, user) and the page below. */
@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    Brand,
    LanguageSwitch,
    ThemeToggle,
    TranslatePipe,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly roleKey = roleKey;

  private readonly links: NavLink[] = [
    { path: '/sala', label: 'nav.floor', icon: 'table_restaurant', managerOnly: false },
    { path: '/historial', label: 'nav.history', icon: 'receipt_long', managerOnly: true },
    { path: '/equipo', label: 'nav.staff', icon: 'group', managerOnly: true },
  ];

  protected visibleLinks(): NavLink[] {
    return this.links.filter((link) => !link.managerOnly || this.auth.isManager());
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
