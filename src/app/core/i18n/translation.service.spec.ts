import { TestBed } from '@angular/core/testing';

import { en } from './en';
import { es } from './es';
import { TranslationService } from './translation.service';

function keys(node: object, prefix = ''): string[] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === 'string' ? [prefix + key] : keys(value as object, `${prefix}${key}.`),
  );
}

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
    service.use('es');
  });

  it('has the same texts in Spanish and English', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it('changes every text at once when the language changes', () => {
    expect(service.t('nav.floor')).toBe('Sala');
    service.use('en');
    expect(service.t('nav.floor')).toBe('Floor');
  });

  it('fills in the values of a text', () => {
    expect(service.t('table.payTitle', { table: 'Mesa 2' })).toBe('Cobrar Mesa 2');
  });

  it('formats money for the current language', () => {
    expect(service.formatMoney(1234.5).replace(/\s/g, ' ')).toBe('1234,50 €');
    service.use('en');
    expect(service.formatMoney(1234.5)).toBe('€1,234.50');
  });

  it('remembers the language and sets it on the page', () => {
    service.use('en');
    TestBed.tick();
    expect(localStorage.getItem('comanda.language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
