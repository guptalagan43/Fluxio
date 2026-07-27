// src/onboarding/components/Step3Budget.tsx
// Screen 3: Initial budget configuration & onboarding completion.

import { useState } from 'react';
import { setBudget, getBudget } from '../../utils/storage';

interface Step3Props {
  onBack: () => void;
  onFinish: () => void;
}

export function Step3Budget({ onBack, onFinish }: Step3Props): JSX.Element {
  const [budgetLimit, setBudgetLimit] = useState('5.00');

  async function handleSaveAndFinish() {
    const parsed = parseFloat(budgetLimit);
    if (!isNaN(parsed) && parsed > 0) {
      const current = await getBudget();
      await setBudget({
        ...current,
        weeklyLimitUSD: parsed,
      });
    }
    onFinish();
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Set Your Weekly AI Budget
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Receive browser alerts at 50%, 80%, and 100% of your weekly spending cap.
        </p>
      </div>

      <div
        style={{
          padding: '24px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Weekly Target Cap (USD)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>$</span>
          <input
            type="number"
            min="0.50"
            step="0.50"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            style={{
              width: '120px',
              padding: '8px 12px',
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#fff',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '320px' }}>
          You can adjust this anytime from the extension popup or the web dashboard settings.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onFinish}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Skip for now
          </button>
          <button
            onClick={handleSaveAndFinish}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Finish Setup ✓
          </button>
        </div>
      </div>
    </div>
  );
}
