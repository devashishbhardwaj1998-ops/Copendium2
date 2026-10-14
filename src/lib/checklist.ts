/**
 * Turns a free-text checklist ("• item", "- item", "1. item", "2) item") into
 * clean list items.
 */
export function parseChecklist(text: string | undefined): string[] {
  return (text ?? '')
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[•\-*–]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
}

export const FALLBACK_CHECKLIST = [
  "Verify the 'Target' vs 'Shell' / legal vs operating entity identities in Gain.",
  'Check for consolidated historical financials and stub periods pre-deal.',
  'Validate effective transaction date vs announcement/closing dates.',
  'Reconcile derivative liabilities, earn-outs, and share class structures.',
];
