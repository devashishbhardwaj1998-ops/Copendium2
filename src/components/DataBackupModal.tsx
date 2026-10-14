import { useState, type ChangeEvent } from 'react';
import { AlertCircle, Check, Download, RotateCcw, Upload } from 'lucide-react';
import { knowledgeBook } from '../store/knowledgeBook';
import { today } from '../lib/slug';
import { Modal } from './ui/Modal';

type Status = { ok: boolean; message: string } | null;

export function DataBackupModal({ onClose }: { onClose: () => void }) {
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const finish = (message: string) => {
    setStatus({ ok: true, message });
    setTimeout(onClose, 1200);
  };

  const handleExport = () => {
    const blob = new Blob([knowledgeBook.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compendium-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImportText(await file.text());
    e.target.value = '';
  };

  const handleImport = () => {
    const res = knowledgeBook.importJson(importText);
    if (res.success) finish('Knowledge base imported.');
    else setStatus({ ok: false, message: res.error });
  };

  const handleReset = () => {
    knowledgeBook.resetToDefaults();
    setConfirmReset(false);
    finish('Reset to the default knowledge book.');
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Knowledge Base Data & Backup"
      subtitle="Export, import, or reset the encyclopedia"
    >
      <div className="p-6 space-y-5">
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
          Edits are saved in <strong>this browser only</strong>. Export a backup to share changes with teammates or move
          them to another device.
        </p>

        {status && (
          <div
            role={status.ok ? 'status' : 'alert'}
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
              status.ok
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {status.ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Export Knowledge Book</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download all cases, checklists and Gain asset links as JSON.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Import JSON</h4>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Choose file
              <input type="file" accept=".json,application/json" onChange={handleFile} className="sr-only" />
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">or paste JSON below</span>
          </div>
          <textarea
            rows={4}
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setStatus(null);
            }}
            placeholder="Paste exported knowledge book JSON here…"
            aria-label="JSON to import"
            className="w-full text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {importText.trim() && (
            <button
              onClick={handleImport}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Replace knowledge base with this JSON
            </button>
          )}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to default knowledge book
            </button>
          ) : (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg space-y-2">
              <p className="text-xs text-rose-900 dark:text-rose-300 font-semibold">Reset all cases &amp; examples to defaults?</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">Any cases you added in this browser will be lost.</p>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleReset} className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors">
                  Yes, reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
