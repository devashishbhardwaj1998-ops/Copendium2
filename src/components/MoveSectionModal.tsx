import { useState } from 'react';
import { MoveRight } from 'lucide-react';
import type { CaseType, Section } from '../types';
import { Modal } from './ui/Modal';
import { SectionIcon } from './ui/SectionIcon';

interface MoveSectionModalProps {
  onClose: () => void;
  onConfirmMove: (caseTypeId: string, targetSectionId: string) => void;
  caseType: CaseType;
  sections: Section[];
}

export function MoveSectionModal({ onClose, onConfirmMove, caseType, sections }: MoveSectionModalProps) {
  const [target, setTarget] = useState(caseType.sectionId);
  const unchanged = target === caseType.sectionId;

  return (
    <Modal isOpen onClose={onClose} size="max-w-md" title="Move Case Type" subtitle={caseType.name} icon={<MoveRight className="w-4 h-4" />}>
      <div className="p-6 space-y-4">
        <fieldset className="space-y-2">
          <legend className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Target section
          </legend>
          {sections.map((s) => {
            const selected = target === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTarget(s.id)}
                className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  selected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600 dark:ring-indigo-500 text-indigo-950 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 shrink-0 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <SectionIcon section={s} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {s.name}
                    {s.id === caseType.sectionId && (
                      <span className="text-[10px] font-normal px-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{s.description}</p>
                </div>
              </button>
            );
          })}
        </fieldset>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={unchanged}
            onClick={() => {
              onConfirmMove(caseType.id, target);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 disabled:cursor-not-allowed"
          >
            Confirm Move
          </button>
        </div>
      </div>
    </Modal>
  );
}
