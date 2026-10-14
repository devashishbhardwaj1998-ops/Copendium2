import { useMemo, useState, type FormEvent } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import type { ExampleInput } from '../store/knowledgeBook';
import type { CaseType, ExampleAsset } from '../types';
import { Field, FormFooter, TextArea, TextInput } from './ui/Field';
import { Modal } from './ui/Modal';

interface ExampleModalProps {
  onClose: () => void;
  onSave: (input: ExampleInput) => void;
  initialData: ExampleAsset | null;
  defaultCaseTypeId?: string;
  allCaseTypes: CaseType[];
}

export function ExampleModal({ onClose, onSave, initialData, defaultCaseTypeId, allCaseTypes }: ExampleModalProps) {
  const [form, setForm] = useState(() => ({
    assetName: initialData?.assetName ?? '',
    gainAssetUrl: initialData?.gainAssetUrl ?? '',
    notes: initialData?.notes ?? '',
    ticker: initialData?.tickerOrIdentifier ?? '',
    year: initialData?.transactionYear ?? '',
    takeaway: initialData?.keyTakeaway ?? '',
    author: initialData?.createdBy ?? 'Senior Database Analyst',
  }));
  const [caseTypeIds, setCaseTypeIds] = useState<string[]>(
    () => initialData?.caseTypeIds ?? (defaultCaseTypeId ? [defaultCaseTypeId] : []),
  );
  const [filter, setFilter] = useState('');
  const [errors, setErrors] = useState<{ assetName?: string; caseTypeIds?: string }>({});

  const set = <K extends keyof typeof form>(key: K) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === 'assetName') setErrors((er) => ({ ...er, assetName: undefined }));
  };

  const toggle = (id: string) => {
    setCaseTypeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    setErrors((er) => ({ ...er, caseTypeIds: undefined }));
  };

  const visibleCaseTypes = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const sorted = [...allCaseTypes].sort((a, b) => a.name.localeCompare(b.name));
    return q ? sorted.filter((c) => c.name.toLowerCase().includes(q)) : sorted;
  }, [allCaseTypes, filter]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      assetName: form.assetName.trim() ? undefined : 'Asset or company name is required',
      caseTypeIds: caseTypeIds.length ? undefined : 'Select at least one case type for this asset',
    };
    if (nextErrors.assetName || nextErrors.caseTypeIds) return setErrors(nextErrors);

    onSave({
      id: initialData?.id,
      assetName: form.assetName,
      gainAssetUrl: form.gainAssetUrl,
      notes: form.notes,
      tickerOrIdentifier: form.ticker,
      transactionYear: form.year,
      keyTakeaway: form.takeaway,
      caseTypeIds,
      createdBy: form.author.trim() || 'Senior Database Analyst',
    });
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="max-w-2xl"
      title={initialData ? 'Edit Gain Asset Example' : 'Add Real Example from Gain'}
      subtitle="Add a real company example for analysts to reference in Gain."
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
        <Field label="Asset / Company Name" required error={errors.assetName}>
          {(p) => (
            <TextInput {...p} data-autofocus value={form.assetName} onChange={set('assetName')} placeholder="e.g. Lucid Group, Inc. (formerly Churchill Capital IV)" />
          )}
        </Field>

        <Field label="Gain Asset URL" icon={<LinkIcon className="w-3.5 h-3.5 text-indigo-500" />} hint="Leave blank to generate a gain.ai/assets/… link from the name.">
          {(p) => (
            <TextInput {...p} type="url" inputMode="url" value={form.gainAssetUrl} onChange={set('gainAssetUrl')} placeholder="https://gain.ai/assets/your-company-identifier" />
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ticker / Identifier">
            {(p) => <TextInput {...p} value={form.ticker} onChange={set('ticker')} placeholder="e.g. NASDAQ: LCID" />}
          </Field>
          <Field label="Transaction Year / Period">
            {(p) => <TextInput {...p} value={form.year} onChange={set('year')} placeholder="e.g. 2021, 2020–2023" />}
          </Field>
        </div>

        <Field label="Why this is a useful example (notes)">
          {(p) => (
            <TextArea
              {...p}
              value={form.notes}
              onChange={set('notes')}
              placeholder="How does this company exemplify the case? (e.g. PIPE anchor commitments, reverse Morris trust, debt-for-equity swap)…"
            />
          )}
        </Field>

        <Field label="Key database takeaway (optional)">
          {(p) => (
            <TextInput {...p} value={form.takeaway} onChange={set('takeaway')} placeholder="e.g. Review how the conversion price and derivative overlay were recorded in Gain." />
          )}
        </Field>

        <Field label="Contributor">
          {(p) => <TextInput {...p} value={form.author} onChange={set('author')} />}
        </Field>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Linked case types <span className="text-rose-500">*</span>{' '}
              <span className="normal-case font-medium text-slate-400">({caseTypeIds.length} selected)</span>
            </span>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              aria-label="Filter case types"
              className="w-32 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div
            role="group"
            aria-label="Linked case types"
            className={`max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1 bg-slate-50/50 dark:bg-slate-800/60 ${
              errors.caseTypeIds ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            {visibleCaseTypes.map((ct) => {
              const selected = caseTypeIds.includes(ct.id);
              return (
                <button
                  key={ct.id}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggle(ct.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    selected
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="truncate">{ct.name}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })}
            {visibleCaseTypes.length === 0 && <p className="text-xs text-slate-400 p-2">No case types match.</p>}
          </div>
          {errors.caseTypeIds && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.caseTypeIds}</p>}
        </div>

        <FormFooter onCancel={onClose} submitLabel={initialData ? 'Save Example' : 'Add Example'} />
      </form>
    </Modal>
  );
}
