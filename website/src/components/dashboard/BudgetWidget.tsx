// src/components/dashboard/BudgetWidget.tsx
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import type { UserSettings } from '../../types/api';

interface BudgetWidgetProps {
  settings: UserSettings | null;
  totalCostUsd: number;
}

export function BudgetWidget({ settings, totalCostUsd }: BudgetWidgetProps): JSX.Element {
  const limit = settings?.weeklyLimitUsd ?? 5.0;
  const ratio = Math.min(totalCostUsd / limit, 1.0);
  const percent = Math.round(ratio * 100);

  let barColor = 'bg-green-600';
  if (ratio >= 0.8) barColor = 'bg-red-600';
  else if (ratio >= 0.6) barColor = 'bg-amber-600';

  return (
    <Card className="mb-8 bg-stone-50 border-stone-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Weekly Budget Cap</span>
            <span className="text-xs font-mono font-semibold text-stone-900">${totalCostUsd.toFixed(2)} / ${limit.toFixed(2)}</span>
          </div>

          <div className="w-full h-3 bg-stone-200 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${barColor}`} style={{ width: `${percent}%` }} />
          </div>
        </div>

        <Link
          to="/settings"
          className="self-start md:self-center px-4 py-2 text-xs font-medium border border-stone-300 hover:bg-stone-200 text-stone-800 transition-colors"
        >
          Edit Budget ⚙
        </Link>
      </div>
    </Card>
  );
}
