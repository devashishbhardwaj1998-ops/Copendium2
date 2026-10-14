import { ArrowLeft, SearchX } from 'lucide-react';

export function NotFound({ onNavigateHome }: { onNavigateHome: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-3 max-w-sm">
        <SearchX className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" aria-hidden="true" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Page not found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This case type or section may have been moved or deleted.
        </p>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to overview
        </button>
      </div>
    </div>
  );
}
