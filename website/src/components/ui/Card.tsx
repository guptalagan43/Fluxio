// src/components/ui/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div className={`bg-stone-50 border border-stone-200 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps): JSX.Element {
  return <div className={`mb-4 pb-3 border-b border-stone-200 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps): JSX.Element {
  return <h3 className={`text-base font-semibold text-stone-900 ${className}`}>{children}</h3>;
}
