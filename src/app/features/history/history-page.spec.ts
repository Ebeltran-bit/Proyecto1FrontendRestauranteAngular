import { toIsoDate } from './history-page';

describe('toIsoDate', () => {
  it('uses the local day, not the UTC one', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
    expect(toIsoDate(new Date(2026, 11, 31, 0, 5))).toBe('2026-12-31');
  });
});
