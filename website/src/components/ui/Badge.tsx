// src/components/ui/Badge.tsx
import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'tier1' | 'tier2' | 'tier3' | 'neutral' | 'success' | 'warning';
  children: ReactNode;
}

export function Badge({ variant = 'neutral', children }: BadgeProps): JSX.Element {
  const variants = {
    tier1: 'bg-amber-100 text-amber-900 border-amber-300',
    tier2: 'bg-stone-200 text-stone-800 border-stone-300',
    tier3: 'bg-stone-100 text-stone-600 border-stone-200',
    neutral: 'bg-stone-100 text-stone-700 border-stone-300',
    success: 'bg-green-100 text-green-900 border-green-300',
    warning: 'bg-amber-100 text-amber-900 border-amber-300',
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border ${variants[variant]}`}>
      {children}
    </span>
  );
}
