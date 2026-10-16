import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.setItem('comanda.theme', 'light');
    TestBed.configureTestingModule({});
  });

  it('switches between light and dark and remembers it', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);

    service.toggle();
    TestBed.tick();
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(localStorage.getItem('comanda.theme')).toBe('dark');
  });
});
