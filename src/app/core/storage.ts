/**
 * localStorage can be unavailable (private mode, blocked site data), so every
 * access is wrapped and the app keeps working, only without remembering.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* not persisted */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* nothing to remove */
    }
  },
};
