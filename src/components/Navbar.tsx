import { Download, Lock, Menu, Moon, Search, Sun, Unlock, X } from 'lucide-react';
import type { ThemeMode, UserRole } from '../types';
import { shortcutLabel } from '../lib/platform';
import { Logo } from './Logo';

interface NavbarProps {
  role: UserRole;
  onToggleRole: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onOpenSearch: () => void;
  onOpenDataModal: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export function Navbar({
  role,
  onToggleRole,
  theme,
  onToggleTheme,
  onNavigateHome,
  onOpenSearch,
  onOpenDataModal,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}: NavbarProps) {
  const isEditor = role === 'editor';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30">
      {/* Left: mobile toggle + brand */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation"
          aria-expanded={isMobileSidebarOpen}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button onClick={onNavigateHome} className="flex items-center gap-3 text-left focus:outline-none group">
          <Logo size="md" />
          <div className="hidden min-[420px]:block">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Compendium
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block leading-none">
              Complexity Knowledge Book
            </p>
          </div>
        </button>
      </div>

      {/* Centre: search trigger */}
      <div className="flex-1 min-w-0 max-w-md mx-2 sm:mx-6 lg:mx-12">
        <button
          type="button"
          onClick={onOpenSearch}
          className="relative w-full flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 rounded-lg py-2 pl-9 sm:pl-10 pr-3 sm:pr-14 text-xs sm:text-sm text-slate-400 transition-all text-left"
        >
          <Search className="absolute left-3 h-4 w-4" aria-hidden="true" />
          <span className="truncate sm:hidden">Search…</span>
          <span className="truncate hidden sm:inline">Search case types, descriptions, or assets…</span>
          <kbd className="hidden sm:inline-flex absolute right-2.5 items-center px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded font-mono">
            {shortcutLabel}
          </kbd>
        </button>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle colour theme"
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={onToggleRole}
          aria-pressed={isEditor}
          className={`text-xs sm:text-sm font-semibold transition-all px-2.5 py-1.5 rounded-md flex items-center gap-1.5 border ${
            isEditor
              ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border-purple-200 dark:border-purple-800/80'
              : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
          }`}
        >
          {isEditor ? (
            <Unlock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
          <span className="hidden sm:inline">{isEditor ? 'Editor Mode' : 'Switch to Editor'}</span>
          <span className="sr-only sm:hidden">{isEditor ? 'Lock editor mode' : 'Unlock editor mode'}</span>
        </button>

        <button
          onClick={onOpenDataModal}
          title="Export / backup knowledge base"
          aria-label="Export or back up data"
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleRole}
          title={isEditor ? 'Senior Editor (unlocked). Click to lock.' : 'Database Analyst (read only). Click to unlock.'}
          aria-label="Toggle editor mode"
          className={`hidden sm:flex w-8 h-8 rounded-full border items-center justify-center text-xs font-bold shrink-0 select-none transition-colors ${
            isEditor
              ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {isEditor ? 'ED' : 'AN'}
        </button>
      </div>
    </header>
  );
}
