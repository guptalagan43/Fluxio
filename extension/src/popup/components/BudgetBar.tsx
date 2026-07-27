// src/popup/components/BudgetBar.tsx
// Progress bar showing weekly budget usage (0–100%).
// Color: green → amber at 60% → red at 80%.

import type { Budget } from '../../utils/types';

interface BudgetBarProps {
  budget: Budget;
}

export function BudgetBar({ budget }: BudgetBarProps): JSX.Element {
  const { currentWeekUSD, weeklyLimitUSD } = budget;
  const ratio = weeklyLimitUSD > 0 ? Math.min(currentWeekUSD / weeklyLimitUSD, 1.0) : 0;
  const percent = Math.round(ratio * 100);

  // Color gradient: green → amber → red
  let barColor = '#22c55e'; // green
  if (ratio >= 0.8) {
    barColor = '#ef4444'; // red
  } else if (ratio >= 0.6) {
    barColor = '#f59e0b'; // amber
  }

  return (
    <div style={{ padding: '12px 16px', borderTop: 'var(--border-default)' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
        }}
      >
        Weekly Budget
      </div>

      {/* Progress bar track */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--color-stone-200)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: barColor,
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: '6px',
        }}
      >
        <span
          className="data-number"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
          }}
        >
          ${currentWeekUSD.toFixed(2)} / ${weeklyLimitUSD.toFixed(2)}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
          }}
        >
          this week
        </span>
      </div>
    </div>
  );
}
