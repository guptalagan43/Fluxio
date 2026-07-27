// src/components/landing/Platforms.tsx
import { Badge } from '../ui/Badge';

export function Platforms(): JSX.Element {
  const platforms = [
    { name: 'ChatGPT', domain: 'chatgpt.com', tier: 'tier1' },
    { name: 'Claude', domain: 'claude.ai', tier: 'tier1' },
    { name: 'Gemini', domain: 'gemini.google.com', tier: 'tier1' },
    { name: 'Grok', domain: 'grok.com', tier: 'tier2' },
    { name: 'DeepSeek', domain: 'chat.deepseek.com', tier: 'tier2' },
    { name: 'Mistral', domain: 'chat.mistral.ai', tier: 'tier2' },
    { name: 'HuggingChat', domain: 'huggingface.co', tier: 'tier2' },
    { name: 'Poe', domain: 'poe.com', tier: 'tier2' },
    { name: 'Qwen', domain: 'chat.qwen.ai', tier: 'tier2' },
    { name: 'Groq', domain: 'groq.com', tier: 'tier3' },
    { name: 'You.com', domain: 'you.com', tier: 'tier3' },
    { name: 'Kimi', domain: 'kimi.moonshot.cn', tier: 'tier3' },
    { name: 'Pi', domain: 'pi.ai', tier: 'tier3' },
    { name: 'OpenRouter', domain: 'openrouter.ai', tier: 'tier3' },
    { name: 'Cohere', domain: 'coral.cohere.com', tier: 'tier3' },
    { name: 'Character.AI', domain: 'character.ai', tier: 'tier3' },
    { name: 'Bing Chat', domain: 'bing.com', tier: 'tier3' },
    { name: 'Copilot', domain: 'copilot.microsoft.com', tier: 'tier3' },
    { name: 'Meta AI', domain: 'meta.ai', tier: 'tier3' },
    { name: 'Perplexity', domain: 'perplexity.ai', tier: 'tier3' },
  ];

  return (
    <section id="platforms" className="py-20 bg-stone-100 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-stone-900">Supported Platforms</h2>
          <p className="text-stone-600 mt-2">Zero-configuration tracking across 20+ web interfaces.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {platforms.map((p, i) => (
            <div key={i} className="bg-stone-50 border border-stone-200 p-4 flex flex-col items-center justify-between gap-3 text-center">
              <img
                src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=32`}
                alt={p.name}
                className="w-6 h-6"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span className="font-medium text-sm text-stone-900">{p.name}</span>
              <Badge variant={p.tier as any}>{p.tier.toUpperCase()}</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
