import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';

interface DeleteConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemTitle: string;
}

export function DeleteConfirmModal({ onClose, onConfirm, title, message, itemTitle }: DeleteConfirmModalProps) {
  return (
    <Modal isOpen onClose={onClose} size="max-w-md" title={title} icon={<AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}>
      <div className="p-6 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 break-words">
          “{itemTitle}”
        </div>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            data-autofocus
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
