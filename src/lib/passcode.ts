import { safeStorage, STORAGE_KEYS } from './safeStorage';

/**
 * Editor passcode handling.
 *
 * IMPORTANT: this is a *soft lock* that keeps casual readers from editing by
 * accident. The app is fully client-side, so anyone with dev tools can bypass
 * it. Do not treat it as access control for sensitive data.
 *
 * The default passcode comes from the VITE_EDITOR_PASSCODE build variable
 * (falls back to "gain"). If a user changes it in the UI, only a SHA-256 hash
 * is stored in their browser.
 */
const DEFAULT_PASSCODE = import.meta.env.VITE_EDITOR_PASSCODE?.trim() || 'gain';

export const MIN_PASSCODE_LENGTH = 3;

async function sha256(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    // crypto.subtle only exists in secure contexts (https / localhost).
    return `plain:${text}`;
  }
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function getStoredHash(): Promise<string> {
  const stored = safeStorage.get(STORAGE_KEYS.passcodeHash);
  if (stored) return stored;

  // Migrate a plain-text passcode saved by the original build.
  const legacy = safeStorage.get(STORAGE_KEYS.legacyPasscode);
  if (legacy) {
    const hash = await sha256(legacy.trim());
    safeStorage.set(STORAGE_KEYS.passcodeHash, hash);
    safeStorage.remove(STORAGE_KEYS.legacyPasscode);
    return hash;
  }

  return sha256(DEFAULT_PASSCODE);
}

export async function verifyPasscode(attempt: string): Promise<boolean> {
  const [expected, actual] = await Promise.all([getStoredHash(), sha256(attempt.trim())]);
  return expected === actual;
}

export async function changePasscode(next: string): Promise<boolean> {
  const value = next.trim();
  if (value.length < MIN_PASSCODE_LENGTH) return false;
  return safeStorage.set(STORAGE_KEYS.passcodeHash, await sha256(value));
}
