// src/popup/components/ContextWarning.tsx
// Banner warning when chat context grows past 6,000 tokens.
// Actions: "How to summarize" (expands inline tip) and "Dismiss".

import { useState } from 'react';

interface ContextWarningProps {
  tokenCount: number;
  onDismiss: () => void;
}

export function ContextWarning({ tokenCount, onDismiss }: ContextWarningProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const severity = tokenCount > 15000 ? 'critical' : 'warning';
  const bgColor = severity === 'critical' ? '#fef2f2' : '#fffbeb';
  const borderColor = severity === 'critical' ? '#fecaca' : '#fde68a';
  const textColor = severity === 'critical' ? '#991b1b' : '#92400e';

  return (
    <div
      style={{
        margin: '0 16px 8px 16px',
        padding: '10px 12px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      <div style={{ color: textColor, fontWeight: 500 }}>
        {severity === 'critical'
          ? '⚠ This chat is very long — context may be truncated'
          : '⚠ This chat is getting long…'}
      </div>
      <div style={{ color: textColor, opacity: 0.8, marginTop: '2px', fontSize: '11px' }}>
        ~{tokenCount.toLocaleString()} tokens used in this session.
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            color: textColor,
            lineHeight: '1.5',
          }}
        >
          <strong>Tip:</strong> Ask the AI to "summarize our conversation so far in bullet points."
          Then start a new chat and paste the summary to continue with a fresh context window.
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: `1px solid ${borderColor}`,
            cursor: 'pointer',
            padding: '3px 8px',
            fontSize: '11px',
            color: textColor,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {expanded ? 'Hide tip' : 'How to summarize'}
        </button>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: `1px solid ${borderColor}`,
            cursor: 'pointer',
            padding: '3px 8px',
            fontSize: '11px',
            color: textColor,
            fontFamily: 'var(--font-sans)',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
