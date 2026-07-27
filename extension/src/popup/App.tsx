// src/popup/App.tsx
// Root popup component — Phase 4: Header, ContextWarning, SessionPanel, BudgetBar, TodaySummary, SettingsPanel, SignInPrompt.

import { useState } from 'react';
import { Header } from './components/Header';
import { SessionPanel } from './components/SessionPanel';
import { TodaySummary } from './components/TodaySummary';
import { BudgetBar } from './components/BudgetBar';
import { ContextWarning } from './components/ContextWarning';
import { SettingsPanel } from './components/SettingsPanel';
import { SignInPrompt } from './components/SignInPrompt';
import { useActiveSession } from './hooks/useActiveSession';
import { useStorage } from './hooks/useStorage';
import { PLATFORM_NAMES } from '../content/platforms/config';
import { getTodayKey } from '../utils/time';
import type { DayRollup, Budget, Prefs } from '../utils/types';

const DEFAULT_ROLLUP: DayRollup = { totalTokens: 0, totalCostUSD: 0, byPlatform: {} };
const DEFAULT_BUDGET: Budget = {
  weeklyLimitUSD: 5.0,
  currentWeekUSD: 0,
  weekStartDate: new Date().toISOString().slice(0, 10),
  notified50: false,
  notified80: false,
  notified100: false,
  notificationsEnabled: true,
};
const DEFAULT_PREFS: Prefs = {
  syncEnabled: false,
  lastSyncAt: 0,
  pendingSyncEvents: [],
  syncFailCount: 0,
  preferredModels: {
    quickQA: 'gpt-4o-mini',
    code: 'claude-sonnet',
    longContext: 'gemini-1.5-pro',
    creative: 'claude-sonnet',
    research: 'gpt-4o',
  },
  disabledPlatforms: [],
};

function App(): JSX.Element {
  const { session, loading } = useActiveSession();
  const todayKey = `day:${getTodayKey()}`;
  const todayRollup = useStorage<DayRollup>(todayKey, DEFAULT_ROLLUP);
  const budget = useStorage<Budget>('budget', DEFAULT_BUDGET);
  const prefs = useStorage<Prefs>('prefs', DEFAULT_PREFS);
  const jwt = useStorage<string | null>('jwt', null);

  const [showSettings, setShowSettings] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

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

  function handleDashboardClick() {
    if (!jwt) {
      setShowSignInPrompt(true);
    } else {
      chrome.tabs.create({ url: 'https://yourwebsite.com/dashboard' });
    }
  }

  return (
    <div className="popup-container">
      <Header
        platformName={displayName}
        modelName={session?.model}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {session && session.warned6k && !warningDismissed && (
        <ContextWarning
          tokenCount={session.totalTokens}
          onDismiss={() => setWarningDismissed(true)}
        />
      )}

      <SessionPanel session={session} />
      <BudgetBar budget={budget} />
      <TodaySummary rollup={todayRollup} />

      {showSettings && (
        <SettingsPanel
          budget={budget}
          prefs={prefs}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: 'var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={handleDashboardClick}
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

        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          ⚙ Settings
        </button>
      </div>

      {showSignInPrompt && (
        <SignInPrompt onClose={() => setShowSignInPrompt(false)} />
      )}
    </div>
  );
}

export default App;
