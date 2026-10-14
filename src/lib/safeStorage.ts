/**
 * localStorage wrapper that never throws. Storage can be unavailable in
 * private windows, sandboxed iframes or when the quota is exhausted; the app
 * should keep working (in-memory) in all of those cases.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.warn(`[compendium] Could not write "${key}" to localStorage`, err);
      return false;
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  data: 'gain_private_markets_knowledge_book_v1',
  role: 'gain_knowledge_book_role_v1',
  theme: 'gain_compendium_theme_v1',
  passcodeHash: 'compendium_editor_passcode_sha256_v2',
  /** Plain-text passcode written by the original AI Studio build; migrated on first read. */
  legacyPasscode: 'gain_compendium_editor_password_v1',
} as const;
