// src/components/landing/FAQ.tsx
import { useState } from 'react';

export function FAQ(): JSX.Element {
  const faqs = [
    {
      q: 'Is my conversation data kept private?',
      a: 'Yes, 100%. Raw message text is tokenized in-memory inside your browser and discarded immediately. No prompt text or chat content is ever saved locally or transmitted to external servers.',
    },
    {
      q: 'Does this extension slow down my browser or AI chats?',
      a: 'No. The DOM observer is lightweight and event-driven. Token estimation runs asynchronously in a background Web Worker and uses under 5MB of memory.',
    },
    {
      q: 'How accurate are the token and cost estimates?',
      a: 'Token counts use the cl100k_base tiktoken encoding as a universal approximation (~95%+ accuracy for OpenAI, Claude, and Gemini models). Pricing tables are updated daily from official vendor API documentation.',
    },
    {
      q: 'Do I need an API key to use this?',
      a: 'No API key is required! AI Token Tracker monitors the web interfaces you already use (ChatGPT, Claude, Gemini, etc.) directly in your browser.',
    },
    {
      q: 'How does the model suggestion engine work?',
      a: 'After you type a prompt, our background classifier evaluates intent signals (e.g. code keywords, factual questions, long text) and recommends the model tier that balances speed, quality, and cost.',
    },
    {
      q: 'Can I use the extension without creating an account?',
      a: 'Yes! All local tracking, budget alerts, and model suggestions work offline out of the box. Creating a free account is only required if you want to sync data to the web dashboard.',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-stone-900">Frequently Asked Questions</h2>
          <p className="text-stone-600 mt-2">Everything you need to know about privacy, accuracy, and compatibility.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-stone-200 p-5">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex justify-between items-center text-left font-semibold text-stone-900 focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className="text-amber-800 font-bold ml-4">{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && (
                <p className="mt-3 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
