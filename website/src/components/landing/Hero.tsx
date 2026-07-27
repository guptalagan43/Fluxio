// src/components/landing/Hero.tsx
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Hero(): JSX.Element {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-stone-50 to-stone-100 border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-semibold uppercase tracking-wider mb-6">
          Manifest V3 · Privacy-First · 20+ Platforms
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 leading-tight mb-6">
          Track your AI token spend. <br className="hidden sm:inline" />
          <span className="text-amber-800">Get smarter model suggestions.</span>
        </h1>

        <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          Automatic token & cost tracking across ChatGPT, Claude, Gemini, DeepSeek, Grok, and 15+ AI platforms. Stay within budget with live recommendations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold">
              Add to Chrome — It's Free ↗
            </Button>
          </a>

          <Link to="/signup" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Web Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-xs text-stone-500 flex items-center justify-center gap-6">
          <span>✓ Zero setup required</span>
          <span>✓ Local storage privacy</span>
          <span>✓ Real-time cost calculation</span>
        </div>
      </div>
    </section>
  );
}
