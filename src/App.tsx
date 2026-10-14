import { useCallback, useEffect, useState } from 'react';
import { CaseTypeModal } from './components/CaseTypeModal';
import { CaseTypeView } from './components/CaseTypeView';
import { DataBackupModal } from './components/DataBackupModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EditorPasswordModal } from './components/EditorPasswordModal';
import { ExampleModal } from './components/ExampleModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HomePage } from './components/HomePage';
import { MoveSectionModal } from './components/MoveSectionModal';
import { Navbar } from './components/Navbar';
import { NotFound } from './components/NotFound';
import { SectionView } from './components/SectionView';
import { Sidebar } from './components/Sidebar';
import { routeToHash, useHashRoute } from './hooks/useHashRoute';
import { useRole, useTheme } from './hooks/usePersistentState';
import { knowledgeBook, useKnowledgeBook } from './store/knowledgeBook';
import { getCaseType, getExamplesForCase, getSections, getCaseTypesBySection } from './store/selectors';
import type { CaseType, ExampleAsset } from './types';

/** Every dialog the app can show. Only one is open at a time. */
type Dialog =
  | { kind: 'search' }
  | { kind: 'data' }
  | { kind: 'caseForm'; caseType: CaseType | null; sectionId: string }
  | { kind: 'exampleForm'; example: ExampleAsset | null; caseTypeId?: string }
  | { kind: 'deleteCase'; caseType: CaseType }
  | { kind: 'deleteExample'; example: ExampleAsset }
  | { kind: 'move'; caseType: CaseType };

export default function App() {
  const data = useKnowledgeBook();
  const { route, navigate } = useHashRoute();
  const { theme, toggleTheme } = useTheme();
  const { role, setRole } = useRole();

  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [passcodePrompt, setPasscodePrompt] = useState<{ then: Dialog | null } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sections = getSections(data);
  const closeDialog = useCallback(() => setDialog(null), []);

  // Close the mobile drawer whenever the route changes.
  const routeKey = routeToHash(route);
  useEffect(() => setMobileNavOpen(false), [routeKey]);

  // ⌘K / Ctrl+K or "/" opens global search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault();
        setDialog({ kind: 'search' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** Opens an editor-only dialog, asking for the passcode first if needed. */
  const asEditor = (next: Dialog | null) => {
    if (role === 'editor') setDialog(next);
    else setPasscodePrompt({ then: next });
  };

  const toggleRole = () => (role === 'editor' ? setRole('analyst') : asEditor(null));

  const goHome = () => navigate({ view: 'home' });
  const goSection = (sectionId: string) => navigate({ view: 'section', sectionId });
  const goCase = (caseTypeId: string) => navigate({ view: 'case', caseTypeId });

  // ---- Resolve the current route --------------------------------------
  const activeCase = route.view === 'case' ? getCaseType(data, route.caseTypeId) : undefined;
  const activeSectionId =
    route.view === 'section' ? route.sectionId : activeCase ? activeCase.sectionId : undefined;
  const activeSection = sections.find((s) => s.id === activeSectionId);

  let content;
  if (route.view === 'home') {
    content = (
      <HomePage
        data={data}
        sections={sections}
        role={role}
        onSelectSection={goSection}
        onSelectCaseType={goCase}
        onOpenSearch={() => setDialog({ kind: 'search' })}
        onAddCaseType={() => asEditor({ kind: 'caseForm', caseType: null, sectionId: sections[0]?.id ?? 'background' })}
      />
    );
  } else if (route.view === 'section' && activeSection) {
    content = (
      <SectionView
        key={activeSection.id}
        data={data}
        section={activeSection}
        caseTypes={getCaseTypesBySection(data, activeSection.id)}
        role={role}
        onNavigateHome={goHome}
        onSelectCaseType={goCase}
        onAddCaseType={(sectionId) => asEditor({ kind: 'caseForm', caseType: null, sectionId })}
        onEditCaseType={(caseType) => asEditor({ kind: 'caseForm', caseType, sectionId: caseType.sectionId })}
        onDeleteCaseType={(caseType) => asEditor({ kind: 'deleteCase', caseType })}
        onMoveCaseType={(caseType) => asEditor({ kind: 'move', caseType })}
      />
    );
  } else if (route.view === 'case' && activeCase && activeSection) {
    content = (
      <CaseTypeView
        key={activeCase.id}
        data={data}
        caseType={activeCase}
        section={activeSection}
        examples={getExamplesForCase(data, activeCase.id)}
        role={role}
        onNavigateHome={goHome}
        onNavigateSection={goSection}
        onSelectCaseType={goCase}
        onEditCaseType={(caseType) => asEditor({ kind: 'caseForm', caseType, sectionId: caseType.sectionId })}
        onDeleteCaseType={(caseType) => asEditor({ kind: 'deleteCase', caseType })}
        onMoveCaseType={(caseType) => asEditor({ kind: 'move', caseType })}
        onAddExample={(caseTypeId) => asEditor({ kind: 'exampleForm', example: null, caseTypeId })}
        onEditExample={(example) => asEditor({ kind: 'exampleForm', example })}
        onDeleteExample={(example) => asEditor({ kind: 'deleteExample', example })}
      />
    );
  } else {
    content = <NotFound onNavigateHome={goHome} />;
  }

  return (
    <div className="h-dvh w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-hidden antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        role={role}
        onToggleRole={toggleRole}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigateHome={goHome}
        onOpenSearch={() => setDialog({ kind: 'search' })}
        onOpenDataModal={() => setDialog({ kind: 'data' })}
        onToggleMobileSidebar={() => setMobileNavOpen((o) => !o)}
        isMobileSidebarOpen={mobileNavOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          data={data}
          sections={sections}
          route={route}
          activeSectionId={activeSectionId}
          role={role}
          onToggleRole={toggleRole}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigateHome={goHome}
          onNavigateSection={goSection}
          onSelectCaseType={goCase}
          isOpenMobile={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">{content}</main>
      </div>

      {/* ---- Dialogs (mounted only while open, so forms start fresh) ---- */}
      {dialog?.kind === 'search' && (
        <GlobalSearchModal data={data} onClose={closeDialog} onSelectCaseType={goCase} />
      )}

      {dialog?.kind === 'data' && <DataBackupModal onClose={closeDialog} />}

      {dialog?.kind === 'caseForm' && (
        <CaseTypeModal
          initialData={dialog.caseType}
          defaultSectionId={dialog.sectionId}
          sections={sections}
          onClose={closeDialog}
          onSave={(input) => {
            const saved = knowledgeBook.saveCaseType(input);
            if (!dialog.caseType) goCase(saved.id);
          }}
        />
      )}

      {dialog?.kind === 'exampleForm' && (
        <ExampleModal
          initialData={dialog.example}
          defaultCaseTypeId={dialog.caseTypeId}
          allCaseTypes={data.caseTypes}
          onClose={closeDialog}
          onSave={(input) => knowledgeBook.saveExample(input)}
        />
      )}

      {dialog?.kind === 'deleteCase' && (
        <DeleteConfirmModal
          title="Delete Case Type"
          message="Examples linked only to this case type will also be removed. Examples linked to other case types are kept."
          itemTitle={dialog.caseType.name}
          onClose={closeDialog}
          onConfirm={() => {
            const { id, sectionId } = dialog.caseType;
            knowledgeBook.deleteCaseType(id);
            if (route.view === 'case' && route.caseTypeId === id) {
              navigate({ view: 'section', sectionId }, { replace: true });
            }
          }}
        />
      )}

      {dialog?.kind === 'deleteExample' && (
        <DeleteConfirmModal
          title="Delete Gain Asset Example"
          message="This removes the example from every case type it is linked to."
          itemTitle={dialog.example.assetName}
          onClose={closeDialog}
          onConfirm={() => knowledgeBook.deleteExample(dialog.example.id)}
        />
      )}

      {dialog?.kind === 'move' && (
        <MoveSectionModal
          caseType={dialog.caseType}
          sections={sections}
          onClose={closeDialog}
          onConfirmMove={(id, target) => knowledgeBook.moveCaseType(id, target)}
        />
      )}

      {passcodePrompt && (
        <EditorPasswordModal
          onClose={() => setPasscodePrompt(null)}
          onSuccess={() => {
            setRole('editor');
            setDialog(passcodePrompt.then);
            setPasscodePrompt(null);
          }}
        />
      )}
    </div>
  );
}
