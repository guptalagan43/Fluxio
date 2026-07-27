// src/components/ui/Modal.tsx
import { ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-stone-50 border border-stone-300 w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// src/components/ui/Toggle.tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps): JSX.Element {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none peer-checked:bg-amber-800 relative transition-colors">
        <div className={`w-4 h-4 bg-white absolute top-0.5 left-0.5 transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label && <span className="text-sm font-medium text-stone-800">{label}</span>}
    </label>
  );
}
