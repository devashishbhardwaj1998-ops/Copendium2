import React, { useState, useEffect } from 'react';
import { X, Building2, Link as LinkIcon, Check, Plus, Trash2, Briefcase } from 'lucide-react';
import { ExampleAsset, CaseType, AssetLink } from '../types';

interface ExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exampleData: Partial<ExampleAsset> & { assetName: string; caseTypeIds: string[] }) => void;
  initialData?: ExampleAsset | null;
  defaultCaseTypeId?: string;
  allCaseTypes: CaseType[];
}

interface LinkStateItem {
  id: string;
  title: string;
  url: string;
}

export const ExampleModal: React.FC<ExampleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultCaseTypeId,
  allCaseTypes,
}) => {
  const [assetName, setAssetName] = useState('');
  const [dealPurpose, setDealPurpose] = useState('');
  const [links, setLinks] = useState<LinkStateItem[]>([]);
  const [notes, setNotes] = useState('');
  const [tickerOrIdentifier, setTickerOrIdentifier] = useState('');
  const [transactionYear, setTransactionYear] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [selectedCaseTypeIds, setSelectedCaseTypeIds] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState('Senior Database Analyst');
  const [errors, setErrors] = useState<{ assetName?: string; caseTypeIds?: string }>({});

  useEffect(() => {
    if (initialData) {
      setAssetName(initialData.assetName);
      setDealPurpose(initialData.dealPurpose || '');
      setNotes(initialData.notes || '');
      setTickerOrIdentifier(initialData.tickerOrIdentifier || '');
      setTransactionYear(initialData.transactionYear || '');
      setKeyTakeaway(initialData.keyTakeaway || '');
      setSelectedCaseTypeIds(initialData.caseTypeIds || []);
      setAuthorName(initialData.createdBy || 'Senior Database Analyst');

      if (initialData.links && initialData.links.length > 0) {
        setLinks(
          initialData.links.map((l, i) => ({
            id: l.id || `link-${i}-${Date.now()}`,
            title: l.title || 'Gain Asset',
            url: l.url || '',
          }))
        );
      } else if (initialData.gainAssetUrl) {
        setLinks([
          {
            id: `link-0-${Date.now()}`,
            title: 'Gain Asset',
            url: initialData.gainAssetUrl,
          },
        ]);
      } else {
        setLinks([
          {
            id: `link-0-${Date.now()}`,
            title: 'Gain Asset',
            url: '',
          },
        ]);
      }
    } else {
      setAssetName('');
      setDealPurpose('');
      setNotes('');
      setTickerOrIdentifier('');
      setTransactionYear('');
      setKeyTakeaway('');
      setSelectedCaseTypeIds(defaultCaseTypeId ? [defaultCaseTypeId] : []);
      setAuthorName('Senior Database Analyst');
      setLinks([
        {
          id: `link-0-${Date.now()}`,
          title: 'Gain Asset',
          url: '',
        },
      ]);
    }
    setErrors({});
  }, [initialData, defaultCaseTypeId, isOpen]);

  if (!isOpen) return null;

  const toggleCaseType = (id: string) => {
    if (selectedCaseTypeIds.includes(id)) {
      if (selectedCaseTypeIds.length === 1) {
        // Must have at least one case type
        return;
      }
      setSelectedCaseTypeIds(selectedCaseTypeIds.filter((cid) => cid !== id));
    } else {
      setSelectedCaseTypeIds([...selectedCaseTypeIds, id]);
    }
  };

  const handleAddLink = (presetTitle?: string) => {
    setLinks((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: presetTitle || (prev.length === 0 ? 'Gain Asset' : 'Reference Link'),
        url: '',
      },
    ]);
  };

  const handleRemoveLink = (index: number) => {
    if (links.length <= 1) {
      // Clear out the single remaining link rather than deleting
      setLinks([{ id: `link-${Date.now()}`, title: 'Gain Asset', url: '' }]);
      return;
    }
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { assetName?: string; caseTypeIds?: string } = {};

    if (!assetName.trim()) {
      newErrors.assetName = 'Asset or company name is required';
    }
    if (selectedCaseTypeIds.length === 0) {
      newErrors.caseTypeIds = 'Select at least one case type for this asset';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clean links
    const cleanLinks: AssetLink[] = links
      .filter((l) => l.url.trim().length > 0)
      .map((l) => {
        let u = l.url.trim();
        if (!u.startsWith('http://') && !u.startsWith('https://')) {
          u = `https://${u}`;
        }
        return {
          id: l.id,
          title: l.title.trim() || 'Gain Asset',
          url: u,
        };
      });

    // Determine primary gain asset url
    const primaryUrl = cleanLinks.length > 0
      ? cleanLinks[0].url
      : `https://gain.ai/assets/${encodeURIComponent(assetName.toLowerCase().replace(/\s+/g, '-'))}`;

    onSave({
      id: initialData?.id,
      assetName: assetName.trim(),
      dealPurpose: dealPurpose.trim() || undefined,
      gainAssetUrl: primaryUrl,
      links: cleanLinks.length > 0 ? cleanLinks : undefined,
      notes: notes.trim(),
      tickerOrIdentifier: tickerOrIdentifier.trim() || undefined,
      transactionYear: transactionYear.trim() || undefined,
      keyTakeaway: keyTakeaway.trim() || undefined,
      caseTypeIds: selectedCaseTypeIds,
      createdBy: authorName.trim() || 'Senior Database Analyst',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] z-10 animate-scale-in transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/60 transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Deal / Example Asset' : 'Add Real Deal Example to Gain'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide deal context, links, and rationale for analysts to reference.
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
          {/* Asset / Company Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Asset / Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => {
                setAssetName(e.target.value);
                if (errors.assetName) setErrors({ ...errors, assetName: undefined });
              }}
              placeholder="e.g. Lucid Group, Inc. (formerly Churchill Capital IV)"
              className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.assetName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500'
              }`}
            />
            {errors.assetName && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.assetName}</p>}
          </div>

          {/* Ticker and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Ticker / Identifier
              </label>
              <input
                type="text"
                value={tickerOrIdentifier}
                onChange={(e) => setTickerOrIdentifier(e.target.value)}
                placeholder="e.g. NASDAQ: LCID"
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Transaction Year / Period
              </label>
              <input
                type="text"
                value={transactionYear}
                onChange={(e) => setTransactionYear(e.target.value)}
                placeholder="e.g. 2021, 2020-2023"
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Small Box: What the deal is for */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                <Briefcase className="w-3.5 h-3.5" />
                <span>What the deal is for</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">
                Deal purpose &amp; transaction rationale
              </span>
            </label>
            <textarea
              rows={2}
              value={dealPurpose}
              onChange={(e) => setDealPurpose(e.target.value)}
              placeholder="Describe in 1-2 lines what this deal was for (e.g., De-SPAC merger to capitalize luxury EV development; Carve-out of nutrition division into standalone public merger)..."
              className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Multiple Links Option */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Deal &amp; Asset Links</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">
                  ({links.length} {links.length === 1 ? 'link' : 'links'})
                </span>
              </label>
              <button
                type="button"
                onClick={() => handleAddLink()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            {/* Quick Presets for Adding Links */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Quick add preset:</span>
              {[
                { title: 'Gain Asset', label: '+ Gain Asset' },
                { title: 'SEC 8-K', label: '+ SEC 8-K' },
                { title: 'Press Release', label: '+ Press Release' },
                { title: 'Investor Deck', label: '+ Investor Deck' },
                { title: 'Financial Model', label: '+ Model' },
              ].map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleAddLink(preset.title)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Links List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {links.map((linkItem, idx) => (
                <div
                  key={linkItem.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 transition-colors"
                >
                  <div className="w-1/3 min-w-[95px]">
                    <input
                      type="text"
                      value={linkItem.title}
                      onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                      placeholder="Label (e.g. SEC 8-K)"
                      className="w-full text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={linkItem.url}
                      onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                      placeholder="https://gain.ai/assets/... or edgar url"
                      className="w-full text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      title="Remove link"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Why this is a useful example */}
          <div className="space-y-1 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Why this is a useful example (Notes)</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">Context for analysts</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain how this specific company exemplifies the case (e.g. PIPE anchor commitments, reverse Morris trust structure, debt-for-equity swap)..."
              className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Key Takeaway */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Key Database Takeaway (Optional)
            </label>
            <input
              type="text"
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder="e.g. Review how the conversion price and derivative overlay were recorded in Gain."
              className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Associated Case Types (Multi-select) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Associated Case Types <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">Select all that apply</span>
            </label>
            <div className="max-h-32 overflow-y-auto border border-slate-300 dark:border-slate-700 rounded-lg p-2 space-y-1 bg-slate-50/50 dark:bg-slate-800/60">
              {allCaseTypes.map((ct) => {
                const isSelected = selectedCaseTypeIds.includes(ct.id);
                return (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => toggleCaseType(ct.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="truncate">{ct.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {errors.caseTypeIds && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.caseTypeIds}</p>}
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
              {initialData ? 'Save Deal Example' : 'Add Deal Example'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
