import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DateAdapter } from '@angular/material/core';

import { safeStorage } from '../storage';
import { Dictionary, Language, TranslationKey, TranslationParams } from './dictionary';
import { en } from './en';
import { es } from './es';

const STORAGE_KEY = 'comanda.language';
const DICTIONARIES: Record<Language, Dictionary> = { es, en };
const LOCALES: Record<Language, string> = { es: 'es-ES', en: 'en-GB' };

/**
 * Runtime translations. The language is a signal: every text, price and date
 * that reads it updates at once when it changes, without reloading the page.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly document = inject(DOCUMENT);
  private readonly dateAdapter = inject(DateAdapter, { optional: true });

  readonly language = signal<Language>(initialLanguage());
  readonly locale = computed(() => LOCALES[this.language()]);

  private readonly money = computed(
    () => new Intl.NumberFormat(this.locale(), { style: 'currency', currency: 'EUR' }),
  );

  constructor() {
    effect(() => {
      const language = this.language();
      safeStorage.set(STORAGE_KEY, language);
      this.document.documentElement.lang = language;
      this.dateAdapter?.setLocale(this.locale());
    });
  }

  use(language: Language): void {
    this.language.set(language);
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const text = lookup(DICTIONARIES[this.language()], key) ?? lookup(es, key) ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  }

  formatMoney(amount: number): string {
    return this.money().format(amount);
  }

  formatDate(value: string | Date, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale(), options).format(new Date(value));
  }
}

function lookup(dictionary: Dictionary, key: string): string | undefined {
  let node: unknown = dictionary;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function initialLanguage(): Language {
  const stored = safeStorage.get(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('en') ? 'en' : 'es';
}
