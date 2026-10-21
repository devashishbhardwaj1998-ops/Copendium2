import React, { useState, useEffect } from 'react';
import { X, Building2, HelpCircle } from 'lucide-react';
import { CaseType, Section, SectionId } from '../types';

interface CaseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseTypeData: Partial<CaseType> & { name: string; sectionId: string }) => void;
  initialData?: CaseType | null;
  sections: Section[];
  defaultSectionId?: SectionId;
}

export const CaseTypeModal: React.FC<CaseTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  sections,
  defaultSectionId,
}) => {
  const [name, setName] = useState('');
  const [sectionId, setSectionId] = useState<string>('background');
  const [description, setDescription] = useState('');
  const [whyComplicated, setWhyComplicated] = useState('');
  const [analystChecklist, setAnalystChecklist] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [authorName, setAuthorName] = useState('Senior Database Analyst');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSectionId(initialData.sectionId);
      setDescription(initialData.description);
      setWhyComplicated(initialData.whyComplicated || '');
      setAnalystChecklist(initialData.analystChecklist || '');
      setTagsInput((initialData.tags || []).join(', '));
      setAuthorName(initialData.lastUpdatedBy || 'Database Editor');
    } else {
      setName('');
      setSectionId(defaultSectionId || 'background');
      setDescription('');
      setWhyComplicated('');
      setAnalystChecklist('');
      setTagsInput('');
      setAuthorName('Senior Database Analyst');
    }
    setErrors({});
  }, [initialData, defaultSectionId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Case type name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: initialData?.id,
      name: name.trim(),
      sectionId,
      description: description.trim(),
      whyComplicated: whyComplicated.trim(),
      analystChecklist: analystChecklist.trim(),
      tags: parsedTags,
      lastUpdatedBy: authorName.trim() || 'Database Editor',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] z-10 animate-scale-in transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/60 transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Case Type' : 'Add New Case Type'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define the complexity concept and guidance for junior analysts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Section Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author / Maintainer */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Editor / Author
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Senior Database Analyst"
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Case Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Case Type Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g. Reverse Mergers, Mezzanine Financing, VIE Structures"
              className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>}
          </div>

          {/* 1. What is this? */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. What is this situation? (Description) <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">Helps junior analysts understand the core concept</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="Explain what happens in this corporate transaction or situation in clear, accessible language..."
              className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.description ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500'
              }`}
            />
            {errors.description && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.description}</p>}
          </div>

          {/* 2. Why is it complicated? */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>2. Why is it complicated &amp; difficult to update?</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">e.g. accounting shifts, shell entities, PIK interest</span>
            </label>
            <textarea
              rows={3}
              value={whyComplicated}
              onChange={(e) => setWhyComplicated(e.target.value)}
              placeholder="Detail the specific friction points: cap table distortions, predecessor vs successor periods, dilution, warrant liabilities..."
              className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* 3. Analyst Checklist */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>3. Analyst Checklist (What to look out for in Gain)</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">Use bullet points (•) for scannability</span>
            </label>
            <textarea
              rows={3}
              value={analystChecklist}
              onChange={(e) => setAnalystChecklist(e.target.value)}
              placeholder={"• Check accounting acquirer vs legal acquirer\n• Verify share count adjustment ratio\n• Ensure warrant liabilities are recorded correctly"}
              className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Topic Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. M&A, Public Listing, PIPE, Shell Entity"
              className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2 transition-colors">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {initialData ? 'Save Changes' : 'Create Case Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
