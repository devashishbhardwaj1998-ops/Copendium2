import { useState, type FormEvent } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { changePasscode, MIN_PASSCODE_LENGTH, verifyPasscode } from '../lib/passcode';
import { Modal } from './ui/Modal';

interface EditorPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono';

export function EditorPasswordModal({ onClose, onSuccess }: EditorPasswordModalProps) {
  const [mode, setMode] = useState<'unlock' | 'change'>('unlock');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return setError('Please enter the editor passcode.');
    setBusy(true);
    const ok = await verifyPasscode(password);
    setBusy(false);
    if (ok) onSuccess();
    else setError('Incorrect passcode.');
  };

  const handleChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < MIN_PASSCODE_LENGTH)
      return setError(`New passcode must be at least ${MIN_PASSCODE_LENGTH} characters.`);
    if (newPassword !== confirmPassword) return setError('New passcodes do not match.');
    setBusy(true);
    if (!(await verifyPasscode(password))) {
      setBusy(false);
      return setError('Current passcode is incorrect.');
    }
    const saved = await changePasscode(newPassword);
    setBusy(false);
    if (!saved) return setError('Could not save the new passcode in this browser.');
    setError(null);
    setChanged(true);
    setTimeout(onSuccess, 1000);
  };

  const errorBox = error && (
    <div role="alert" className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 p-2.5 rounded-lg">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{error}</span>
    </div>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="max-w-md"
      icon={<Lock className="w-4 h-4" />}
      title={mode === 'change' ? 'Update Editor Passcode' : 'Editor Mode Verification'}
      subtitle="Compendium administrative access"
    >
      {mode === 'unlock' ? (
        <form onSubmit={handleUnlock} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Editor mode lets you create complexity scenarios, edit research checklists, and link Gain asset precedents.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="editor-passcode" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Editor passcode
            </label>
            <div className="relative">
              <input
                id="editor-passcode"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                data-autofocus
                autoComplete="current-password"
                placeholder="Enter passcode"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorBox}

          <div className="flex justify-end text-[11px]">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('change');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Change passcode
            </button>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Unlock Editor Mode
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleChange} className="p-6 space-y-4">
          <div className="space-y-3">
            {(
              [
                ['current-passcode', 'Current passcode', password, setPassword, 'current-password'],
                ['new-passcode', 'New passcode', newPassword, setNewPassword, 'new-password'],
                ['confirm-passcode', 'Confirm new passcode', confirmPassword, setConfirmPassword, 'new-password'],
              ] as const
            ).map(([id, label, value, setter, autoComplete], i) => (
              <div key={id} className="space-y-1">
                <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </label>
                <input
                  id={id}
                  type="password"
                  value={value}
                  onChange={(e) => {
                    setter(e.target.value);
                    setError(null);
                  }}
                  autoComplete={autoComplete}
                  data-autofocus={i === 0 ? true : undefined}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          {errorBox}

          {changed && (
            <div role="status" className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 p-2.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Passcode updated. Unlocking editor mode…</span>
            </div>
          )}

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('unlock');
                setError(null);
              }}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={busy || changed}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Save New Passcode
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
