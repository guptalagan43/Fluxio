// src/popup/components/TodaySummary.tsx
// Shows today's aggregate token count, cost, and platform icons used today.

import type { DayRollup } from '../../utils/types';

interface TodaySummaryProps {
  rollup: DayRollup;
}

const PLATFORM_FAVICONS: Record<string, string> = {
  chatgpt: 'chatgpt.com',
  claude: 'claude.ai',
  gemini: 'gemini.google.com',
  grok: 'grok.com',
  deepseek: 'chat.deepseek.com',
  mistral: 'chat.mistral.ai',
  huggingchat: 'huggingface.co',
  poe: 'poe.com',
  qwen: 'chat.qwen.ai',
  groq: 'groq.com',
  youcom: 'you.com',
  kimi: 'kimi.moonshot.cn',
  pi: 'pi.ai',
  openrouter: 'openrouter.ai',
  cohere: 'coral.cohere.com',
  characterai: 'character.ai',
  bing: 'bing.com',
  copilot: 'copilot.microsoft.com',
  meta: 'meta.ai',
  perplexity: 'perplexity.ai',
};

function PlatformIcon({ platformId }: { platformId: string }): JSX.Element {
  const domain = PLATFORM_FAVICONS[platformId];

  if (domain) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt={platformId}
        width={16}
        height={16}
        style={{ display: 'inline-block' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling;
          if (fallback) (fallback as HTMLElement).style.display = 'flex';
        }}
      />
    );
  }

  // Fallback: first letter
  return (
    <span
      style={{
        width: 16,
        height: 16,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-stone-400)',
        color: 'var(--color-text-secondary)',
        fontSize: '10px',
        fontWeight: 600,
      }}
    >
      {platformId.charAt(0).toUpperCase()}
    </span>
  );
}

export function TodaySummary({ rollup }: TodaySummaryProps): JSX.Element {
  const platforms = Object.keys(rollup.byPlatform);

  if (rollup.totalTokens === 0) {
    return (
      <div
        style={{
          padding: '12px 16px',
          borderTop: 'var(--border-default)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}
      >
        No usage today yet.
      </div>
    );
  }

  const costFormatted = rollup.totalCostUSD < 0.01
    ? `$${rollup.totalCostUSD.toFixed(4)}`
    : `$${rollup.totalCostUSD.toFixed(2)}`;

  return (
    <div style={{ padding: '12px 16px', borderTop: 'var(--border-default)' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '8px',
        }}
      >
        Today
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span className="data-number" style={{ fontSize: '14px', fontWeight: 500 }}>
          ~{rollup.totalTokens.toLocaleString()} tokens
        </span>
        <span className="data-number" style={{ fontSize: '13px', color: 'var(--color-accent)' }}>
          ~{costFormatted}
        </span>
      </div>

      {platforms.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginRight: '4px' }}>
            Platforms:
          </span>
          {platforms.map((id) => (
            <PlatformIcon key={id} platformId={id} />
          ))}
        </div>
      )}
    </div>
  );
}
