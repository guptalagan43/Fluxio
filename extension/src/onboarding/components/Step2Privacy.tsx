// src/onboarding/components/Step2Privacy.tsx
// Screen 2: Privacy principles breakdown.

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Privacy({ onNext, onBack }: Step2Props): JSX.Element {
  const points = [
    {
      label: 'Zero Prompt Storage',
      desc: 'Raw message text is tokenized in-memory inside your browser and discarded immediately. No prompt text or chat content is ever saved to disk or sent to servers.',
    },
    {
      label: 'Local Storage Truth',
      desc: 'Estimated token counts, model names, and cost rollups are stored locally on your device in chrome.storage.local.',
    },
    {
      label: 'Optional Cloud Sync',
      desc: 'Account creation and Cloud Sync are completely optional. Cloud sync only uploads numerical rollups (never chat text) to populate your web dashboard.',
    },
    {
      label: 'Manifest V3 Security',
      desc: 'Built using Chrome Manifest V3 with strict Content Security Policy enforcement and zero unverified remote code execution.',
    },
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Privacy First, Always
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Your chat content belongs exclusively to you.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {points.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '16px' }}>✓</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {p.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {p.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
          Continue: Set Weekly Budget →
        </button>
      </div>
    </div>
  );
}
