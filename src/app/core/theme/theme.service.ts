import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

import { safeStorage } from '../storage';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'comanda.theme';

/**
 * Light or dark mode. The choice is a class on <html>; the Material theme and
 * the app styles read their colours from CSS variables that follow it.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(initialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      const root = this.document.documentElement;
      root.classList.toggle('dark-theme', theme === 'dark');
      root.classList.toggle('light-theme', theme === 'light');
      safeStorage.set(STORAGE_KEY, theme);
    });
  }

  toggle(): void {
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }
}

function initialTheme(): Theme {
  const stored = safeStorage.get(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
