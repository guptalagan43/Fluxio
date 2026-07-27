// src/popup/components/SessionPanel.tsx
// Session panel displaying live token count, estimated cost, and session duration.

import type { Session } from '../../utils/types';
import { formatDuration } from '../../utils/time';

interface SessionPanelProps {
  session: Session | null;
}

export function SessionPanel({ session }: SessionPanelProps): JSX.Element {
  if (!session) {
    return (
      <div className="popup-body">
        <p className="popup-placeholder">
          No active session on this tab. Open ChatGPT, Claude, or Gemini to begin tracking.
        </p>
      </div>
    );
  }

  const duration = formatDuration(Date.now() - session.startTime);
  const costFormatted = session.totalCostUSD < 0.0001 && session.totalCostUSD > 0
    ? '<$0.0001'
    : `$${session.totalCostUSD.toFixed(4)}`;

  return (
    <div className="popup-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Tokens used</span>
        <span className="data-number" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          ~{session.totalTokens.toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Est. cost</span>
        <span className="data-number" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-accent)' }}>
          ~{costFormatted}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: '4px', borderTop: 'var(--border-default)' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Session duration</span>
        <span className="data-number" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {duration}
        </span>
      </div>
    </div>
  );
}
