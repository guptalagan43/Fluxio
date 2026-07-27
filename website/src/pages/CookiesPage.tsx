// src/pages/CookiesPage.tsx
export function CookiesPage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans text-stone-800 leading-relaxed">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Cookies Policy</h1>
      <p className="text-xs text-stone-500 mb-8">Last updated: July 27, 2026</p>

      <div className="space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">1. Use of Cookies</h2>
          <p>We use a single strictly necessary session cookie (<code className="bg-stone-200 px-1 font-mono">jwt</code>) on the web dashboard to keep you securely signed in. We do not use advertising, tracking, or analytics cookies.</p>
        </section>
      </div>
    </div>
  );
}

// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl font-mono font-extrabold text-amber-800 mb-4">404</div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-stone-600 max-w-md mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"><Button variant="primary" size="md">Return to Home</Button></Link>
    </div>
  );
}
