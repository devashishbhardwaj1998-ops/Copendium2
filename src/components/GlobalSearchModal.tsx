import { useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, ExternalLink, Search, X } from 'lucide-react';
import { searchKnowledgeBook } from '../lib/search';
import type { KnowledgeBookData } from '../types';

interface GlobalSearchModalProps {
  data: KnowledgeBookData;
  onClose: () => void;
  onSelectCaseType: (caseTypeId: string) => void;
}

export function GlobalSearchModal({ data, onClose, onSelectCaseType }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchKnowledgeBook(data, deferredQuery), [data, deferredQuery]);
  const caseResults = results.filter((r) => r.type === 'case_type');
  const assetResults = results.filter((r) => r.type === 'example_asset');

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const open = (caseTypeId: string) => {
    onSelectCaseType(caseTypeId);
    onClose();
  };

  const onInputKeyDown = (e: KeyboardEvent) => {
    // Enter jumps to the first result.
    if (e.key === 'Enter' && results[0]) open(results[0].caseTypeId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the knowledge book"
        className="relative z-10 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh] animate-modal-in"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search complex cases, descriptions, assets, notes…"
            aria-label="Search query"
            className="w-full text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono transition-colors"
          >
            ESC
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!query.trim() && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              Type to search by transaction scenario, keywords, checklists, or Gain asset names.
            </div>
          )}

          {query.trim() && deferredQuery === query && results.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No cases or assets match “{query}”</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try broader terms like “SPAC”, “debt”, “carve-out”, or a company name.
              </p>
            </div>
          )}

          {caseResults.length > 0 && (
            <section>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
                Case Types ({caseResults.length})
              </h4>
              <div className="space-y-1">
                {caseResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => open(item.caseTypeId)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800 outline-none transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group flex items-start justify-between"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.sectionName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.matchField}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.snippet}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {assetResults.length > 0 && (
            <section className={caseResults.length > 0 ? 'pt-3 border-t border-slate-200 dark:border-slate-800' : ''}>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
                Gain Asset Examples ({assetResults.length})
              </h4>
              <div className="space-y-1.5">
                {assetResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {item.sectionName} → {item.caseTypeName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.snippet}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => open(item.caseTypeId)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                      >
                        View Case
                      </button>
                      {item.gainAssetUrl && (
                        <a
                          href={item.gainAssetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-md transition-colors"
                        >
                          Gain Asset
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">Searches case types, descriptions, checklists &amp; Gain assets</span>
          <span className="font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">↵</kbd> open first ·{' '}
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">ESC</kbd> close
          </span>
        </footer>
      </div>
    </div>
  );
}
