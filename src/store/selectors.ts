import type { CaseType, ExampleAsset, KnowledgeBookData, Section } from '../types';

const byOrder = <T extends { displayOrder: number }>(a: T, b: T) => a.displayOrder - b.displayOrder;

export const getSections = (d: KnowledgeBookData): Section[] => [...d.sections].sort(byOrder);

export const getCaseTypes = (d: KnowledgeBookData): CaseType[] => [...d.caseTypes].sort(byOrder);

export const getCaseTypesBySection = (d: KnowledgeBookData, sectionId: string): CaseType[] =>
  d.caseTypes.filter((c) => c.sectionId === sectionId).sort(byOrder);

export const getCaseType = (d: KnowledgeBookData, id: string | null | undefined): CaseType | undefined =>
  id ? d.caseTypes.find((c) => c.id === id) : undefined;

export const getExamplesForCase = (d: KnowledgeBookData, caseTypeId: string): ExampleAsset[] =>
  d.examples
    .filter((ex) => ex.caseTypeIds.includes(caseTypeId))
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

export const countExamplesForCase = (d: KnowledgeBookData, caseTypeId: string): number =>
  d.examples.reduce((n, ex) => n + (ex.caseTypeIds.includes(caseTypeId) ? 1 : 0), 0);

export const getRecentlyUpdated = (d: KnowledgeBookData, limit = 4): CaseType[] =>
  [...d.caseTypes].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, limit);
