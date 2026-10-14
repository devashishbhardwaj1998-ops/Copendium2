import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../lib/safeStorage';
import { knowledgeBook } from './knowledgeBook';

describe('knowledgeBook store', () => {
  beforeEach(() => {
    knowledgeBook.resetToDefaults();
  });

  it('creates, updates and persists a case type', () => {
    const created = knowledgeBook.saveCaseType({ name: 'Test Case', sectionId: 'others', description: 'd' });
    expect(knowledgeBook.getSnapshot().caseTypes.some((c) => c.id === created.id)).toBe(true);

    const updated = knowledgeBook.saveCaseType({ ...created, name: 'Renamed' });
    expect(updated.id).toBe(created.id);
    expect(updated.createdDate).toBe(created.createdDate);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.data)!);
    expect(stored.caseTypes.find((c: { id: string }) => c.id === created.id).name).toBe('Renamed');
  });

  it('removes orphaned examples when a case type is deleted', () => {
    const a = knowledgeBook.saveCaseType({ name: 'A', sectionId: 'others', description: 'a' });
    const b = knowledgeBook.saveCaseType({ name: 'B', sectionId: 'others', description: 'b' });
    const onlyA = knowledgeBook.saveExample({ assetName: 'Only A', caseTypeIds: [a.id] });
    const both = knowledgeBook.saveExample({ assetName: 'Both', caseTypeIds: [a.id, b.id] });

    knowledgeBook.deleteCaseType(a.id);
    const { examples } = knowledgeBook.getSnapshot();
    expect(examples.find((e) => e.id === onlyA.id)).toBeUndefined();
    expect(examples.find((e) => e.id === both.id)?.caseTypeIds).toEqual([b.id]);
  });

  it('generates a Gain URL when none is given and normalizes bare domains', () => {
    expect(knowledgeBook.saveExample({ assetName: 'Acme Corp', caseTypeIds: ['x'] }).gainAssetUrl).toBe(
      'https://gain.ai/assets/acme-corp',
    );
    expect(knowledgeBook.saveExample({ assetName: 'B', gainAssetUrl: 'gain.ai/a/1', caseTypeIds: ['x'] }).gainAssetUrl).toBe(
      'https://gain.ai/a/1',
    );
  });

  it('moves a case type to the end of the target section', () => {
    const ct = knowledgeBook.saveCaseType({ name: 'Mover', sectionId: 'background', description: 'm' });
    expect(knowledgeBook.moveCaseType(ct.id, 'financials')).toBe(true);
    const moved = knowledgeBook.getSnapshot().caseTypes.find((c) => c.id === ct.id)!;
    const others = knowledgeBook.getSnapshot().caseTypes.filter((c) => c.sectionId === 'financials' && c.id !== ct.id);
    expect(moved.sectionId).toBe('financials');
    expect(moved.displayOrder).toBeGreaterThan(Math.max(...others.map((c) => c.displayOrder)));
  });

  it('round-trips export → import and rejects bad input', () => {
    const json = knowledgeBook.exportJson();
    expect(knowledgeBook.importJson(json)).toEqual({ success: true });
    expect(knowledgeBook.importJson('{nope').success).toBe(false);
    expect(knowledgeBook.importJson('{"sections":[],"caseTypes":[{}],"examples":[]}')).toMatchObject({
      success: false,
      error: expect.stringContaining('caseTypes[0]'),
    });
  });
});
