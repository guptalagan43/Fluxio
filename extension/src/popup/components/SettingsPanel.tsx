// src/popup/components/SettingsPanel.tsx
// Inline settings panel — shown when ⚙ is clicked in the popup footer.
// Weekly budget input, notification thresholds, cloud sync toggle, platform toggles.

import { useState, useEffect } from 'react';
import type { Budget, Prefs } from '../../utils/types';

interface SettingsPanelProps {
  budget: Budget;
  prefs: Prefs;
  onClose: () => void;
}

export function SettingsPanel({ budget, prefs, onClose }: SettingsPanelProps): JSX.Element {
  const [budgetInput, setBudgetInput] = useState(budget.weeklyLimitUSD.toFixed(2));
  const [notify50, setNotify50] = useState(budget.notificationsEnabled);
  const [notify80, setNotify80] = useState(budget.notificationsEnabled);
  const [notify100, setNotify100] = useState(budget.notificationsEnabled);
  const [syncEnabled, setSyncEnabled] = useState(prefs.syncEnabled);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBudgetInput(budget.weeklyLimitUSD.toFixed(2));
  }, [budget.weeklyLimitUSD]);

  async function handleSaveBudget() {
    const parsed = parseFloat(budgetInput);
    if (isNaN(parsed) || parsed < 0) return;

    const updatedBudget: Budget = {
      ...budget,
      weeklyLimitUSD: parsed,
      notificationsEnabled: notify50 || notify80 || notify100,
    };

    await chrome.storage.local.set({ budget: updatedBudget });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSyncToggle() {
    const newSync = !syncEnabled;
    setSyncEnabled(newSync);
    const updatedPrefs: Prefs = { ...prefs, syncEnabled: newSync };
    await chrome.storage.local.set({ prefs: updatedPrefs });
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  const checkboxRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    marginTop: '4px',
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: 'var(--border-default)',
        backgroundColor: 'var(--color-stone-50)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ ...labelStyle, fontSize: '12px' }}>Settings</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          ✕
        </button>
      </div>

      {/* Budget Input */}
      <div style={{ marginBottom: '12px' }}>
        <div style={labelStyle}>Weekly Budget (USD)</div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
          <input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            min="0"
            step="0.50"
            style={{
              width: '80px',
              padding: '4px 8px',
              fontSize: '13px',
              border: 'var(--border-default)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            onClick={handleSaveBudget}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Notification Thresholds */}
      <div style={{ marginBottom: '12px' }}>
        <div style={labelStyle}>Notification Thresholds</div>
        <label style={checkboxRowStyle}>
          <input type="checkbox" checked={notify50} onChange={() => setNotify50(!notify50)} />
          50% budget used
        </label>
        <label style={checkboxRowStyle}>
          <input type="checkbox" checked={notify80} onChange={() => setNotify80(!notify80)} />
          80% budget used
        </label>
        <label style={checkboxRowStyle}>
          <input type="checkbox" checked={notify100} onChange={() => setNotify100(!notify100)} />
          100% budget used
        </label>
      </div>

      {/* Cloud Sync Toggle */}
      <div style={{ marginBottom: '4px' }}>
        <div style={labelStyle}>Cloud Sync</div>
        <label style={checkboxRowStyle}>
          <input type="checkbox" checked={syncEnabled} onChange={handleSyncToggle} />
          Sync usage data to dashboard
        </label>
        {!syncEnabled && (
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
            Requires sign-in. Sync will start after login.
          </span>
        )}
      </div>
    </div>
  );
}
