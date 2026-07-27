// src/components/ui/Input.tsx
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</label>}
      <input
        className={`px-3 py-2 text-sm bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-800 font-sans ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-sans">{error}</span>}
    </div>
  );
}
