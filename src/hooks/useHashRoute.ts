import { useCallback, useSyncExternalStore } from 'react';

/**
 * Minimal hash router. Hash URLs (#/case/abc) work on every static host —
 * including GitHub Pages — without 404 fallbacks, and give us deep links,
 * refresh-safe pages and working browser back/forward buttons.
 */
export type Route =
  | { view: 'home' }
  | { view: 'section'; sectionId: string }
  | { view: 'case'; caseTypeId: string };

export function parseHash(hash: string): Route {
  const [kind, rawId] = hash.replace(/^#\/?/, '').split('/');
  const id = rawId ? decodeURIComponent(rawId) : '';
  if (kind === 'section' && id) return { view: 'section', sectionId: id };
  if (kind === 'case' && id) return { view: 'case', caseTypeId: id };
  return { view: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.view) {
    case 'section':
      return `#/section/${encodeURIComponent(route.sectionId)}`;
    case 'case':
      return `#/case/${encodeURIComponent(route.caseTypeId)}`;
    default:
      return '#/';
  }
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};
const getHash = () => window.location.hash;

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  const route = parseHash(hash);

  const navigate = useCallback((next: Route, { replace = false } = {}) => {
    const target = routeToHash(next);
    if (replace) {
      window.history.replaceState(null, '', target);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else if (window.location.hash !== target) {
      window.location.hash = target;
    }
  }, []);

  return { route, navigate };
}
