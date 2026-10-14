const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent);

/** Keyboard hint for the global search shortcut. */
export const shortcutLabel = isApple ? '⌘K' : 'Ctrl K';
