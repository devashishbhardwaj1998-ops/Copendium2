import { Building2, DollarSign, Folder, Layers, type LucideIcon } from 'lucide-react';
import type { Section } from '../../types';

const ICONS: Record<Section['iconName'], LucideIcon> = { Building2, DollarSign, Layers, Folder };

const COLORS: Record<string, string> = {
  blue: 'text-indigo-600 dark:text-indigo-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
};

/** Icon for a section, driven by the section's own iconName / colorTheme. */
export function SectionIcon({ section, className = 'w-5 h-5' }: { section: Section; className?: string }) {
  const Icon = ICONS[section.iconName] ?? Folder;
  return <Icon className={`${className} ${COLORS[section.colorTheme] ?? 'text-slate-500'}`} aria-hidden="true" />;
}
