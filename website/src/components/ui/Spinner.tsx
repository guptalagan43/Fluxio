// src/components/ui/Spinner.tsx
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): JSX.Element {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`animate-spin border-2 border-stone-300 border-t-amber-800 rounded-full ${sizes[size]}`} />
  );
}

// src/components/ui/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }): JSX.Element {
  return <div className={`animate-pulse bg-stone-200 ${className}`} />;
}
