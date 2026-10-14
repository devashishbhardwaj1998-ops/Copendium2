import type { KnowledgeBookData, SearchResultItem } from '../types';

function excerpt(text: string, query: string, before = 40, after = 80): string {
  const idx = text.toLowerCase().indexOf(query);
  if (idx < 0) return truncate(text, 160);
  const start = Math.max(0, idx - before);
  const end = Math.min(text.length, idx + query.length + after);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

const has = (value: string | undefined, q: string) => !!value && value.toLowerCase().includes(q);

/**
 * Full-text search across case types and example assets. Each case type
 * appears at most once (reporting its strongest match); each example asset
 * appears once per case type it is linked to.
 */
export function searchKnowledgeBook(data: KnowledgeBookData, rawQuery: string): SearchResultItem[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];
  const sectionName = new Map(data.sections.map((s) => [s.id, s.name]));
  const caseById = new Map(data.caseTypes.map((c) => [c.id, c]));

  for (const ct of data.caseTypes) {
    const section = sectionName.get(ct.sectionId) ?? 'General';
    const base = {
      type: 'case_type' as const,
      sectionId: ct.sectionId,
      sectionName: section,
      caseTypeId: ct.id,
      caseTypeName: ct.name,
      title: ct.name,
    };

    if (has(ct.name, q)) {
      results.push({ ...base, id: `ct-name-${ct.id}`, subtitle: `${section} • Case Type`, snippet: truncate(ct.description, 160), matchField: 'Case Name' });
    } else if (has(ct.description, q)) {
      results.push({ ...base, id: `ct-desc-${ct.id}`, subtitle: `${section} • Description`, snippet: excerpt(ct.description, q), matchField: 'Description' });
    } else if (has(ct.whyComplicated, q)) {
      results.push({ ...base, id: `ct-why-${ct.id}`, subtitle: `${section} • Complexity Context`, snippet: excerpt(ct.whyComplicated!, q), matchField: 'Description' });
    } else if (has(ct.analystChecklist, q)) {
      results.push({ ...base, id: `ct-chk-${ct.id}`, subtitle: `${section} • Analyst Checklist`, snippet: excerpt(ct.analystChecklist!, q), matchField: 'Checklist' });
    } else if (ct.tags?.some((t) => has(t, q))) {
      results.push({ ...base, id: `ct-tag-${ct.id}`, subtitle: `${section} • Tag`, snippet: truncate(ct.description, 140), matchField: 'Case Name' });
    }
  }

  for (const ex of data.examples) {
    const nameMatch = has(ex.assetName, q) || has(ex.tickerOrIdentifier, q);
    const takeawayMatch = has(ex.keyTakeaway, q);
    const noteMatch = has(ex.notes, q);
    if (!nameMatch && !takeawayMatch && !noteMatch) continue;

    for (const caseTypeId of ex.caseTypeIds) {
      const ct = caseById.get(caseTypeId);
      if (!ct) continue;
      const section = sectionName.get(ct.sectionId) ?? 'General';

      let snippet: string;
      let matchField: SearchResultItem['matchField'];
      if (nameMatch) {
        matchField = 'Asset Name';
        snippet = ex.notes || `Real Gain asset example in ${ct.name}`;
      } else if (takeawayMatch) {
        matchField = 'Example Note';
        snippet = `Takeaway: ${ex.keyTakeaway}`;
      } else {
        matchField = 'Example Note';
        snippet = excerpt(ex.notes, q);
      }

      results.push({
        id: `ex-${ex.id}-${ct.id}`,
        type: 'example_asset',
        sectionId: ct.sectionId,
        sectionName: section,
        caseTypeId: ct.id,
        caseTypeName: ct.name,
        assetName: ex.assetName,
        title: ex.assetName,
        subtitle: `${section} → ${ct.name} → Example Asset`,
        snippet,
        gainAssetUrl: ex.gainAssetUrl,
        matchField,
      });
    }
  }

  return results;
}
