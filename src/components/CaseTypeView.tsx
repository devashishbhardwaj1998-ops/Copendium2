import { AlertTriangle, Edit3, ExternalLink, Info, MoveRight, Plus, Trash2 } from 'lucide-react';
import { FALLBACK_CHECKLIST, parseChecklist } from '../lib/checklist';
import type { CaseType, ExampleAsset, KnowledgeBookData, Section, UserRole } from '../types';

interface CaseTypeViewProps {
  data: KnowledgeBookData;
  caseType: CaseType;
  section: Section;
  examples: ExampleAsset[];
  role: UserRole;
  onNavigateHome: () => void;
  onNavigateSection: (sectionId: string) => void;
  onSelectCaseType: (caseTypeId: string) => void;
  onEditCaseType: (caseType: CaseType) => void;
  onDeleteCaseType: (caseType: CaseType) => void;
  onMoveCaseType: (caseType: CaseType) => void;
  onAddExample: (caseTypeId: string) => void;
  onEditExample: (example: ExampleAsset) => void;
  onDeleteExample: (example: ExampleAsset) => void;
}

export function CaseTypeView({
  data,
  caseType,
  section,
  examples,
  role,
  onNavigateHome,
  onNavigateSection,
  onSelectCaseType,
  onEditCaseType,
  onDeleteCaseType,
  onMoveCaseType,
  onAddExample,
  onEditExample,
  onDeleteExample,
}: CaseTypeViewProps) {
  const caseTypeMap = new Map(data.caseTypes.map((c) => [c.id, c]));
  const parsed = parseChecklist(caseType.analystChecklist);
  const itemsToRender = parsed.length > 0 ? parsed : FALLBACK_CHECKLIST;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-full transition-colors">
      {/* Breadcrumb Navigation */}
      <nav className="px-6 sm:px-8 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 shrink-0 flex-wrap transition-colors">
        <button
          onClick={onNavigateHome}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigateSection(section.id)}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {section.name}
        </button>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">{caseType.name}</span>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Bar: Title + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                  {section.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Updated {caseType.lastUpdated} by {caseType.lastUpdatedBy}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {caseType.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                {caseType.description}
              </p>
            </div>

            {/* Actions for Editor / User */}
            <div className="flex items-center gap-2 shrink-0 self-start">
              {role === 'editor' && (
                <>
                  <button
                    id="case-edit-btn"
                    onClick={() => onEditCaseType(caseType)}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    id="case-move-btn"
                    onClick={() => onMoveCaseType(caseType)}
                    title="Move to another section"
                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
                  >
                    <MoveRight className="w-4 h-4" />
                  </button>
                  <button
                    id="case-delete-btn"
                    onClick={() => onDeleteCaseType(caseType)}
                    title="Delete Case Type"
                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 2-Column Grid (Left: Description, Complexity & Examples; Right: Checklist & Related Concepts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: What is this? */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>What is this situation?</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {caseType.description}
                </p>
              </div>

              {/* Card 2: Why is it complicated in Gain? */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Why is it complicated &amp; difficult to update?</span>
                </h3>
                <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-amber-50/40 dark:bg-amber-950/30 p-3.5 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
                  {caseType.whyComplicated ||
                    'This transaction involves complex accounting treatment, multiple successive legal entities, stub periods, or non-standard equity conversion covenants that can distort metrics if entered incorrectly.'}
                </div>
              </div>

              {/* Card 3: Examples in Gain Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center transition-colors">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Examples in Gain</h3>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                      {examples.length} {examples.length === 1 ? 'Asset' : 'Assets'}
                    </span>
                  </div>

                  {role === 'editor' && (
                    <button
                      onClick={() => onAddExample(caseType.id)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Example</span>
                    </button>
                  )}
                </div>

                {examples.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No Gain examples added yet for this case type.</p>
                    {role === 'editor' && (
                      <button
                        onClick={() => onAddExample(caseType.id)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Add the first Gain reference asset
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Asset Name
                          </th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Key Context &amp; Notes
                          </th>
                          <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800">
                        {examples.map((ex) => {
                          const otherCaseTypes = ex.caseTypeIds
                            .filter((id) => id !== caseType.id)
                            .map((id) => caseTypeMap.get(id))
                            .filter(Boolean) as CaseType[];

                          return (
                            <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 align-top">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  {ex.assetName}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5 flex-wrap">
                                  {ex.tickerOrIdentifier && (
                                    <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-px rounded border border-slate-200 dark:border-slate-700">
                                      {ex.tickerOrIdentifier}
                                    </span>
                                  )}
                                  {ex.transactionYear && <span>({ex.transactionYear})</span>}
                                </div>
                                {otherCaseTypes.length > 0 && (
                                  <div className="pt-1.5 flex items-center gap-1 flex-wrap">
                                    {otherCaseTypes.map((ot) => (
                                      <button
                                        key={ot.id}
                                        onClick={() => onSelectCaseType(ot.id)}
                                        className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 py-px rounded transition-colors"
                                      >
                                        {ot.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 align-top text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                                <div>{ex.notes}</div>
                                {ex.keyTakeaway && (
                                  <div className="mt-1.5 text-[11px] text-indigo-900 dark:text-indigo-200 bg-indigo-50/70 dark:bg-indigo-950/50 p-2 rounded border border-indigo-100 dark:border-indigo-900/60">
                                    <span className="font-bold text-indigo-950 dark:text-indigo-100">Takeaway: </span>
                                    {ex.keyTakeaway}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  {role === 'editor' && (
                                    <div className="flex items-center gap-1 mr-1">
                                      <button
                                        onClick={() => onEditExample(ex)}
                                        title="Edit example details"
                                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteExample(ex)}
                                        title="Delete example"
                                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}

                                  <a
                                    href={ex.gainAssetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                  >
                                    <span>View Asset</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Analyst Checklist */}
            <div className="space-y-6">
              {/* Analyst Checklist in Geometric Dark Theme */}
              <div className="bg-slate-900 dark:bg-slate-900/90 rounded-xl p-6 text-white border border-transparent dark:border-slate-800 shadow-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Analyst Checklist
                </h4>
                <ul className="space-y-4">
                  {itemsToRender.map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <div className="w-4 h-4 rounded border border-slate-600 shrink-0 mt-0.5 flex items-center justify-center text-indigo-400">
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
