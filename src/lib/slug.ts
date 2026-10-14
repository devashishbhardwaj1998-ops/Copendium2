export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Ensures a URL has a protocol; returns '' for empty input. */
export function normalizeUrl(url: string | undefined): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
