import { useState, type FormEvent } from 'react';
import { AlertTriangle, CheckSquare, HelpCircle } from 'lucide-react';
import type { CaseTypeInput } from '../store/knowledgeBook';
import type { CaseType, Section } from '../types';
import { Field, FormFooter, TextArea, TextInput } from './ui/Field';
import { Modal } from './ui/Modal';

interface CaseTypeModalProps {
  onClose: () => void;
  onSave: (input: CaseTypeInput) => void;
  initialData: CaseType | null;
  sections: Section[];
  defaultSectionId: string;
}

export function CaseTypeModal({ onClose, onSave, initialData, sections, defaultSectionId }: CaseTypeModalProps) {
  const [form, setForm] = useState(() => ({
    name: initialData?.name ?? '',
    sectionId: initialData?.sectionId ?? defaultSectionId,
    description: initialData?.description ?? '',
    whyComplicated: initialData?.whyComplicated ?? '',
    analystChecklist: initialData?.analystChecklist ?? '',
    tags: (initialData?.tags ?? []).join(', '),
    author: initialData?.lastUpdatedBy ?? 'Senior Database Analyst',
  }));
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const set = <K extends keyof typeof form>(key: K) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key in errors) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      name: form.name.trim() ? undefined : 'Case type name is required',
      description: form.description.trim() ? undefined : 'Description is required',
    };
    if (nextErrors.name || nextErrors.description) return setErrors(nextErrors);

    onSave({
      id: initialData?.id,
      name: form.name.trim(),
      sectionId: form.sectionId,
      description: form.description.trim(),
      whyComplicated: form.whyComplicated.trim(),
      analystChecklist: form.analystChecklist.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      lastUpdatedBy: form.author.trim() || 'Database Editor',
    });
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="max-w-2xl"
      title={initialData ? 'Edit Case Type' : 'Add New Case Type'}
      subtitle="Define the complexity concept and guidance for junior analysts."
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Section" required>
            {(p) => (
              <select {...p} value={form.sectionId} onChange={set('sectionId')}>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Editor / Author">
            {(p) => <TextInput {...p} value={form.author} onChange={set('author')} placeholder="e.g. Senior Database Analyst" />}
          </Field>
        </div>

        <Field label="Case Type Name" required error={errors.name}>
          {(p) => (
            <TextInput
              {...p}
              data-autofocus
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Reverse Mergers, Mezzanine Financing, VIE Structures"
            />
          )}
        </Field>

        <Field label="1. What is this situation?" required error={errors.description} icon={<HelpCircle className="w-3.5 h-3.5 text-indigo-500" />}>
          {(p) => (
            <TextArea
              {...p}
              value={form.description}
              onChange={set('description')}
              placeholder="Explain what happens in this corporate transaction or situation in clear, accessible language…"
            />
          )}
        </Field>

        <Field label="2. Why is it complicated & difficult to update?" icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}>
          {(p) => (
            <TextArea
              {...p}
              value={form.whyComplicated}
              onChange={set('whyComplicated')}
              placeholder="Cap table distortions, predecessor vs successor periods, dilution, warrant liabilities…"
            />
          )}
        </Field>

        <Field
          label="3. Analyst checklist (what to look out for in Gain)"
          hint="One item per line. Bullets (•, -) or numbers (1.) are optional."
          icon={<CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
        >
          {(p) => (
            <TextArea
              {...p}
              rows={4}
              value={form.analystChecklist}
              onChange={set('analystChecklist')}
              placeholder={'• Check accounting acquirer vs legal acquirer\n• Verify share count adjustment ratio\n• Ensure warrant liabilities are recorded correctly'}
            />
          )}
        </Field>

        <Field label="Topic tags (comma-separated)">
          {(p) => <TextInput {...p} value={form.tags} onChange={set('tags')} placeholder="e.g. M&A, Public Listing, PIPE, Shell Entity" />}
        </Field>

        <FormFooter onCancel={onClose} submitLabel={initialData ? 'Save Changes' : 'Create Case Type'} />
      </form>
    </Modal>
  );
}
