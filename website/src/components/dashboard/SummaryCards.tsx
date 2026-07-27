// src/components/dashboard/SummaryCards.tsx
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Spinner';

interface SummaryCardsProps {
  cards?: {
    totalTokens: number;
    totalCostUsd: number;
    topPlatform: string;
    topModel: string;
  };
  loading?: boolean;
}

export function SummaryCards({ cards, loading }: SummaryCardsProps): JSX.Element {
  if (loading || !cards) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-28" />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total Tokens', value: cards.totalTokens.toLocaleString(), sub: 'across all platforms' },
    { label: 'Total Spend', value: `$${cards.totalCostUsd.toFixed(4)}`, sub: 'estimated cost' },
    { label: 'Top Platform', value: cards.topPlatform, sub: 'most active platform' },
    { label: 'Top Model', value: cards.topModel, sub: 'most used model' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, idx) => (
        <Card key={idx}>
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">{item.label}</div>
          <div className="text-2xl font-bold font-mono text-stone-900 truncate">{item.value}</div>
          <div className="text-[11px] text-stone-400 mt-1">{item.sub}</div>
        </Card>
      ))}
    </div>
  );
}
