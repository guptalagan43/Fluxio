// src/onboarding/components/Step1Welcome.tsx
// Screen 1: Welcome & feature list overview.

interface Step1Props {
  onNext: () => void;
}

export function Step1Welcome({ onNext }: Step1Props): JSX.Element {
  const features = [
    {
      title: 'Automatic Token & Cost Tracking',
      desc: 'Tracks tokens and estimated spending in real-time across ChatGPT, Claude, Gemini, DeepSeek, Grok, and 15+ AI web chat interfaces.',
    },
    {
      title: 'Weekly Budget Alerts',
      desc: 'Set custom spending caps. Receive browser notifications at 50%, 80%, and 100% budget thresholds before costs add up.',
    },
    {
      title: 'Smart Model Suggestions',
      desc: 'Classifies prompt intent (Code, Quick Q&A, Long Context, Creative, Research) and suggests optimal models to maximize speed and save cost.',
    },
    {
      title: 'Context-Length Warning Banner',
      desc: 'Warns you when long chat threads cross 6,000 and 15,000 tokens, helping you avoid unnecessary context-bloat costs.',
    },
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            backgroundColor: 'var(--color-accent)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          T
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Welcome to AI Token Tracker
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Your privacy-first AI spend monitor and model recommendation engine.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              {f.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onNext}
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
          Continue: Privacy First →
        </button>
      </div>
    </div>
  );
}
