// src/popup/App.tsx
// Root popup component — Phase 3: Header, SessionPanel, TodaySummary, Footer.

import { Header } from './components/Header';
import { SessionPanel } from './components/SessionPanel';
import { TodaySummary } from './components/TodaySummary';
import { useActiveSession } from './hooks/useActiveSession';
import { useStorage } from './hooks/useStorage';
import { PLATFORM_NAMES } from '../content/platforms/config';
import { getTodayKey } from '../utils/time';
import type { DayRollup } from '../utils/types';

const DEFAULT_ROLLUP: DayRollup = { totalTokens: 0, totalCostUSD: 0, byPlatform: {} };

function App(): JSX.Element {
  const { session, loading } = useActiveSession();
  const todayKey = `day:${getTodayKey()}`;
  const todayRollup = useStorage<DayRollup>(todayKey, DEFAULT_ROLLUP);

  if (loading) {
    return (
      <div className="popup-container">
        <Header />
        <div className="popup-body">
          <p className="popup-placeholder">Loading session...</p>
        </div>
      </div>
    );
  }

  const displayName = session
    ? (PLATFORM_NAMES[session.platform] || session.platform)
    : 'AI Token Tracker';

  return (
    <div className="popup-container">
      <Header platformName={displayName} modelName={session?.model} />
      <SessionPanel session={session} />
      <TodaySummary rollup={todayRollup} />

      {/* Footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: 'var(--border-default)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => {
            chrome.tabs.create({ url: 'https://yourwebsite.com/dashboard' });
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          View full dashboard ↗
        </button>
      </div>
    </div>
  );
}

export default App;
