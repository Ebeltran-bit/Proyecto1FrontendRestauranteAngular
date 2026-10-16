import { TestBed } from '@angular/core/testing';

import { TranslationService } from '../core/i18n/translation.service';
import { LanguageSwitch } from './language-switch';

describe('LanguageSwitch', () => {
  it('changes the language when a flag is clicked', async () => {
    localStorage.setItem('comanda.language', 'es');
    const fixture = TestBed.createComponent(LanguageSwitch);
    await fixture.whenStable();
    const i18n = TestBed.inject(TranslationService);
    const [uk, spain] = fixture.nativeElement.querySelectorAll('button') as HTMLButtonElement[];

    expect(spain.getAttribute('aria-pressed')).toBe('true');
    uk.click();
    await fixture.whenStable();
    expect(i18n.language()).toBe('en');
    expect(uk.getAttribute('aria-pressed')).toBe('true');
    expect(spain.getAttribute('aria-label')).toBe('Spanish');
  });
});
