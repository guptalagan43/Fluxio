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
