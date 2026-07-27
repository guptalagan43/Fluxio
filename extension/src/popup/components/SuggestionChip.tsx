// src/popup/components/SuggestionChip.tsx
// Suggestion chip displaying detected task category, recommended model,
// expandable hint text, and dismiss button.

import { useState } from 'react';
import type { SuggestionResult } from '../../utils/types';

interface SuggestionChipProps {
  suggestion: SuggestionResult;
  onDismiss: () => void;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  quickQA: 'Quick Q&A',
  code: 'Code',
  longContext: 'Long Context',
  creative: 'Creative',
  research: 'Research',
};

export function SuggestionChip({ suggestion, onDismiss }: SuggestionChipProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const categoryName = CATEGORY_DISPLAY_NAMES[suggestion.category] || suggestion.category;
  const isWarning = suggestion.budgetWarning;

  const pillBg = isWarning ? '#fff7ed' : '#f5f3ff'; // light orange vs light violet
  const pillBorder = isWarning ? '#ffedd5' : '#ddd6fe';
  const pillColor = isWarning ? '#c2410c' : '#5b21b6';
  const badgeBg = isWarning ? '#ea580c' : '#7c3aed';

  return (
    <div
      style={{
        margin: '0 16px 8px 16px',
        padding: '8px 12px',
        backgroundColor: pillBg,
        border: `1px solid ${pillBorder}`,
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          <span
            style={{
              padding: '2px 6px',
              backgroundColor: badgeBg,
              color: '#fff',
              fontSize: '10px',
              fontWeight: 600,
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {categoryName}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: pillColor }}>
            → {suggestion.recommendedModel}
          </span>
        </div>

        <button
          onClick={onDismiss}
          title="Dismiss suggestion"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: pillColor,
            opacity: 0.6,
            lineHeight: 1,
            padding: '0 4px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          ✕
        </button>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: `1px solid ${pillBorder}`,
            fontSize: '11px',
            color: pillColor,
            lineHeight: '1.4',
          }}
        >
          {suggestion.hint}
        </div>
      )}
    </div>
  );
}
