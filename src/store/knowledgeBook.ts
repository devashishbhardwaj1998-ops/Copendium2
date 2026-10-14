import { useSyncExternalStore } from 'react';
import { INITIAL_KNOWLEDGE_BOOK_DATA } from '../data/seedData';
import { safeStorage, STORAGE_KEYS } from '../lib/safeStorage';
import { normalizeUrl, slugify, today } from '../lib/slug';
import type { CaseType, ExampleAsset, KnowledgeBookData } from '../types';

export type CaseTypeInput = Partial<CaseType> & { name: string; sectionId: string };
export type ExampleInput = Partial<ExampleAsset> & { assetName: string; caseTypeIds: string[] };

function isValidData(value: unknown): value is KnowledgeBookData {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  return Array.isArray(d.sections) && Array.isArray(d.caseTypes) && Array.isArray(d.examples);
}

function validateImport(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'File is not a JSON object.';
  const d = value as Record<string, unknown>;
  for (const key of ['sections', 'caseTypes', 'examples'] as const) {
    if (!Array.isArray(d[key])) return `Missing "${key}" array.`;
    const bad = (d[key] as unknown[]).findIndex((item) => !item || typeof (item as { id?: unknown }).id !== 'string');
    if (bad >= 0) return `"${key}[${bad}]" is missing a string "id".`;
  }
  return null;
}

function loadInitial(): KnowledgeBookData {
  const raw = safeStorage.get(STORAGE_KEYS.data);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isValidData(parsed)) return parsed;
    } catch (err) {
      console.warn('[compendium] Stored data was unreadable; falling back to seed data.', err);
    }
  }
  return INITIAL_KNOWLEDGE_BOOK_DATA;
}

const nextOrder = (items: CaseType[]) => (items.length ? Math.max(...items.map((c) => c.displayOrder)) + 1 : 1);

/**
 * Single source of truth for the knowledge book. Data is immutable: every
 * write produces a new snapshot, which is persisted to localStorage and
 * broadcast to React via useSyncExternalStore.
 */
class KnowledgeBookStore {
  private data: KnowledgeBookData = loadInitial();
  private listeners = new Set<() => void>();

  constructor() {
    // Keep multiple open tabs in sync.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key !== STORAGE_KEYS.data) return;
        this.data = loadInitial();
        this.emit();
      });
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.data;

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private commit(patch: Partial<KnowledgeBookData>) {
    this.data = { ...this.data, ...patch, lastUpdated: new Date().toISOString() };
    safeStorage.set(STORAGE_KEYS.data, JSON.stringify(this.data));
    this.emit();
  }

  // ---- Case types -------------------------------------------------------

  saveCaseType(input: CaseTypeInput): CaseType {
    const now = today();
    const existing = input.id ? this.data.caseTypes.find((c) => c.id === input.id) : undefined;

    if (!existing) {
      const created: CaseType = {
        id: `case-${slugify(input.name)}-${Date.now()}`,
        sectionId: input.sectionId,
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        whyComplicated: input.whyComplicated?.trim() ?? '',
        analystChecklist: input.analystChecklist?.trim() ?? '',
        displayOrder: input.displayOrder ?? nextOrder(this.data.caseTypes.filter((c) => c.sectionId === input.sectionId)),
        createdBy: input.createdBy || input.lastUpdatedBy || 'Analyst Contributor',
        createdDate: now,
        lastUpdated: now,
        lastUpdatedBy: input.lastUpdatedBy || 'Database Editor',
        tags: input.tags ?? [],
      };
      this.commit({ caseTypes: [...this.data.caseTypes, created] });
      return created;
    }

    const updated: CaseType = {
      ...existing,
      sectionId: input.sectionId || existing.sectionId,
      name: input.name.trim(),
      description: input.description?.trim() ?? existing.description,
      whyComplicated: input.whyComplicated?.trim() ?? existing.whyComplicated,
      analystChecklist: input.analystChecklist?.trim() ?? existing.analystChecklist,
      displayOrder: input.displayOrder ?? existing.displayOrder,
      tags: input.tags ?? existing.tags ?? [],
      lastUpdated: now,
      lastUpdatedBy: input.lastUpdatedBy || 'Database Editor',
    };
    this.commit({ caseTypes: this.data.caseTypes.map((c) => (c.id === updated.id ? updated : c)) });
    return updated;
  }

  /** Deletes a case type. Examples linked only to this case are removed too. */
  deleteCaseType(id: string): boolean {
    if (!this.data.caseTypes.some((c) => c.id === id)) return false;
    this.commit({
      caseTypes: this.data.caseTypes.filter((c) => c.id !== id),
      examples: this.data.examples
        .map((ex) => ({ ...ex, caseTypeIds: ex.caseTypeIds.filter((cid) => cid !== id) }))
        .filter((ex) => ex.caseTypeIds.length > 0),
    });
    return true;
  }

  moveCaseType(id: string, targetSectionId: string): boolean {
    const ct = this.data.caseTypes.find((c) => c.id === id);
    if (!ct || ct.sectionId === targetSectionId) return false;
    const moved: CaseType = {
      ...ct,
      sectionId: targetSectionId,
      displayOrder: nextOrder(this.data.caseTypes.filter((c) => c.sectionId === targetSectionId)),
      lastUpdated: today(),
      lastUpdatedBy: 'Database Editor',
    };
    this.commit({ caseTypes: this.data.caseTypes.map((c) => (c.id === id ? moved : c)) });
    return true;
  }

  // ---- Examples ---------------------------------------------------------

  saveExample(input: ExampleInput): ExampleAsset {
    const now = today();
    const url =
      normalizeUrl(input.gainAssetUrl) || `https://gain.ai/assets/${encodeURIComponent(slugify(input.assetName))}`;
    const existing = input.id ? this.data.examples.find((ex) => ex.id === input.id) : undefined;

    if (!existing) {
      const created: ExampleAsset = {
        id: `ex-${slugify(input.assetName)}-${Date.now()}`,
        caseTypeIds: input.caseTypeIds,
        assetName: input.assetName.trim(),
        gainAssetUrl: url,
        notes: input.notes?.trim() ?? '',
        tickerOrIdentifier: input.tickerOrIdentifier?.trim() || undefined,
        transactionYear: input.transactionYear?.trim() || undefined,
        keyTakeaway: input.keyTakeaway?.trim() || undefined,
        createdBy: input.createdBy || 'Analyst Contributor',
        createdDate: now,
        lastUpdated: now,
      };
      this.commit({ examples: [created, ...this.data.examples] });
      return created;
    }

    const updated: ExampleAsset = {
      ...existing,
      caseTypeIds: input.caseTypeIds.length ? input.caseTypeIds : existing.caseTypeIds,
      assetName: input.assetName.trim(),
      gainAssetUrl: url,
      notes: input.notes?.trim() ?? existing.notes,
      tickerOrIdentifier: input.tickerOrIdentifier !== undefined ? input.tickerOrIdentifier.trim() || undefined : existing.tickerOrIdentifier,
      transactionYear: input.transactionYear !== undefined ? input.transactionYear.trim() || undefined : existing.transactionYear,
      keyTakeaway: input.keyTakeaway !== undefined ? input.keyTakeaway.trim() || undefined : existing.keyTakeaway,
      lastUpdated: now,
    };
    this.commit({ examples: this.data.examples.map((ex) => (ex.id === updated.id ? updated : ex)) });
    return updated;
  }

  deleteExample(id: string): boolean {
    if (!this.data.examples.some((ex) => ex.id === id)) return false;
    this.commit({ examples: this.data.examples.filter((ex) => ex.id !== id) });
    return true;
  }

  // ---- Backup -----------------------------------------------------------

  exportJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importJson(json: string): { success: true } | { success: false; error: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch (err) {
      return { success: false, error: `Invalid JSON: ${(err as Error).message}` };
    }
    const problem = validateImport(parsed);
    if (problem) return { success: false, error: problem };
    const d = parsed as KnowledgeBookData;
    this.commit({ version: d.version || 1, sections: d.sections, caseTypes: d.caseTypes, examples: d.examples });
    return { success: true };
  }

  resetToDefaults() {
    this.commit({ ...INITIAL_KNOWLEDGE_BOOK_DATA });
  }
}

export const knowledgeBook = new KnowledgeBookStore();

/** Subscribes a component to the current knowledge-book snapshot. */
export function useKnowledgeBook(): KnowledgeBookData {
  return useSyncExternalStore(knowledgeBook.subscribe, knowledgeBook.getSnapshot, knowledgeBook.getSnapshot);
}
