import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

const base =
  'w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';
const ok = 'border-slate-300 dark:border-slate-700 focus:border-indigo-500';
const bad = 'border-rose-500';

export const inputClass = `${base} ${ok}`;

interface FieldProps {
  label: ReactNode;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  icon?: ReactNode;
  children: (props: { id: string; className: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
}

/** Label + control + error message, wired together for accessibility. */
export function Field({ label, required, error, hint, icon, children }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {icon}
        <span>
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
      </label>
      {children({
        id,
        className: `${base} ${error ? bad : ok}`,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errId : undefined,
      })}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p id={errId} className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} />;
}

export function FormFooter({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
      >
        {submitLabel}
      </button>
    </div>
  );
}
