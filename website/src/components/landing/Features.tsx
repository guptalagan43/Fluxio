// src/components/landing/Features.tsx
import { Card } from '../ui/Card';

export function Features(): JSX.Element {
  const features = [
    {
      title: 'Automatic Token Tracking',
      desc: 'Hooks into your chat DOM using MutationObservers. Reads user & assistant text in real time without impacting browser performance.',
    },
    {
      title: '20+ Supported Platforms',
      desc: 'Seamlessly tracks ChatGPT, Claude, Gemini, DeepSeek, Grok, Mistral, HuggingChat, Poe, OpenRouter, Copilot, and more.',
    },
    {
      title: 'Weekly Budget Alerts',
      desc: 'Set custom spending caps. Receive browser notifications at 50%, 80%, and 100% budget thresholds before costs add up.',
    },
    {
      title: 'Model Recommendation Engine',
      desc: 'Classifies prompt intent (Code, Quick Q&A, Long Context, Creative, Research) and suggests optimal models to maximize speed and minimize spend.',
    },
    {
      title: 'Context-Length Warning Banner',
      desc: 'Warns you when long chat threads cross 6,000 and 15,000 tokens, helping you avoid unnecessary context-bloat costs.',
    },
    {
      title: 'Privacy-First Architecture',
      desc: 'Raw message text is tokenized in-memory and discarded immediately. No prompt text is ever stored locally or sent to external servers.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-stone-900">Built for AI Power Users & Developers</h2>
          <p className="text-stone-600 mt-2">Everything you need to monitor, control, and optimize your multi-LLM workflows.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="hover:border-amber-800 transition-colors">
              <div className="w-8 h-8 bg-amber-800 text-stone-100 font-mono font-bold flex items-center justify-center mb-4 text-sm">
                0{i + 1}
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{f.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
