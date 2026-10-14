import { useCallback, useEffect, useState } from 'react';
import { safeStorage, STORAGE_KEYS } from '../lib/safeStorage';
import type { ThemeMode, UserRole } from '../types';

function initialTheme(): ThemeMode {
  const stored = safeStorage.get(STORAGE_KEYS.theme);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      safeStorage.set(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}

export function useRole() {
  const [role, setRoleState] = useState<UserRole>(() =>
    safeStorage.get(STORAGE_KEYS.role) === 'editor' ? 'editor' : 'analyst',
  );

  const setRole = useCallback((next: UserRole) => {
    safeStorage.set(STORAGE_KEYS.role, next);
    setRoleState(next);
  }, []);

  return { role, setRole };
}
