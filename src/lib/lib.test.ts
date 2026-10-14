import { describe, expect, it } from 'vitest';
import { INITIAL_KNOWLEDGE_BOOK_DATA } from '../data/seedData';
import { parseHash, routeToHash } from '../hooks/useHashRoute';
import { parseChecklist } from './checklist';
import { searchKnowledgeBook } from './search';
import { normalizeUrl, slugify } from './slug';

describe('parseChecklist', () => {
  it('strips bullets and numbering', () => {
    expect(parseChecklist('• one\n- two\n* three\n1. four\n12) five\n\n  six  ')).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
    ]);
  });

  it('handles empty input', () => {
    expect(parseChecklist(undefined)).toEqual([]);
  });
});

describe('slug helpers', () => {
  it('slugifies', () => {
    expect(slugify('  SPAC Deals & De-SPAC!  ')).toBe('spac-deals-de-spac');
  });
  it('normalizes URLs', () => {
    expect(normalizeUrl('gain.ai/assets/x')).toBe('https://gain.ai/assets/x');
    expect(normalizeUrl('http://a.b')).toBe('http://a.b');
    expect(normalizeUrl('  ')).toBe('');
  });
});

describe('hash routing', () => {
  it('round-trips routes', () => {
    for (const route of [
      { view: 'home' as const },
      { view: 'section' as const, sectionId: 'financials' },
      { view: 'case' as const, caseTypeId: 'case with spaces/slash' },
    ]) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
  });
  it('falls back to home for unknown hashes', () => {
    expect(parseHash('#/nope/x')).toEqual({ view: 'home' });
    expect(parseHash('')).toEqual({ view: 'home' });
  });
});

describe('searchKnowledgeBook', () => {
  const data = INITIAL_KNOWLEDGE_BOOK_DATA;

  it('returns nothing for blank queries', () => {
    expect(searchKnowledgeBook(data, '   ')).toEqual([]);
  });

  it('finds case types by name, case-insensitively', () => {
    const results = searchKnowledgeBook(data, 'spac');
    expect(results.some((r) => r.type === 'case_type' && r.caseTypeId === 'case-spac-deals')).toBe(true);
  });

  it('lists each case type at most once', () => {
    const ids = searchKnowledgeBook(data, 'a')
      .filter((r) => r.type === 'case_type')
      .map((r) => r.caseTypeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every result a unique id', () => {
    const ids = searchKnowledgeBook(data, 'e').map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('seed data integrity', () => {
  const { sections, caseTypes, examples } = INITIAL_KNOWLEDGE_BOOK_DATA;
  const sectionIds = new Set(sections.map((s) => s.id));
  const caseIds = new Set(caseTypes.map((c) => c.id));

  it('has unique ids', () => {
    expect(caseIds.size).toBe(caseTypes.length);
    expect(new Set(examples.map((e) => e.id)).size).toBe(examples.length);
  });

  it('only references existing sections and case types', () => {
    for (const c of caseTypes) expect(sectionIds.has(c.sectionId), c.id).toBe(true);
    for (const e of examples) for (const id of e.caseTypeIds) expect(caseIds.has(id), `${e.id} → ${id}`).toBe(true);
  });
});
