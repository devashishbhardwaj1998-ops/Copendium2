import { Lock, Moon, Sun, Unlock } from 'lucide-react';
import type { Route } from '../hooks/useHashRoute';
import { getCaseTypes } from '../store/selectors';
import type { KnowledgeBookData, Section, ThemeMode, UserRole } from '../types';

interface SidebarProps {
  data: KnowledgeBookData;
  sections: Section[];
  route: Route;
  activeSectionId?: string;
  role: UserRole;
  onToggleRole: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateSection: (sectionId: string) => void;
  onSelectCaseType: (caseTypeId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  data,
  sections,
  route,
  activeSectionId,
  role,
  onToggleRole,
  theme,
  onToggleTheme,
  onNavigateHome,
  onNavigateSection,
  onSelectCaseType,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const isEditor = role === 'editor';
  const quickLookups = getCaseTypes(data).slice(0, 5);
  const countFor = (sectionId: string) => data.caseTypes.filter((c) => c.sectionId === sectionId).length;

  return (
    <>
      {isOpenMobile && (
        <div className="fixed inset-0 top-16 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto" aria-label="Sections">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sections</h2>
              <button
                onClick={onNavigateHome}
                className={`text-[11px] font-semibold transition-colors ${
                  route.view === 'home'
                    ? 'text-indigo-600 dark:text-indigo-400 underline'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Overview
              </button>
            </div>

            <ul className="space-y-1">
              {sections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <li key={sec.id}>
                    <button
                      onClick={() => onNavigateSection(sec.id)}
                      aria-current={route.view === 'section' && isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{sec.name}</span>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {countFor(sec.id)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="px-2 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Quick Lookups
            </h2>
            <ul className="space-y-0.5">
              {quickLookups.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCaseType(c.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors truncate block ${
                      route.view === 'case' && route.caseTypeId === c.id
                        ? 'text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800/60 font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
                {isEditor ? (
                  <Unlock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                )}
                Access Level
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isEditor
                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                    : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {isEditor ? 'Editor' : 'Analyst'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Active as{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isEditor ? 'Senior Editor' : 'Database Analyst'}
              </span>
              .
            </p>
            <button
              onClick={onToggleRole}
              className="w-full text-left text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors pt-0.5 flex items-center justify-between"
            >
              <span>{isEditor ? 'Lock to Analyst View' : 'Unlock Editor Mode'}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
              Theme
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 capitalize">{theme} mode</span>
          </button>
        </div>
      </aside>
    </>
  );
}
