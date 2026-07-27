// src/layouts/PublicLayout.tsx
// Public navbar and footer wrapper layout.

import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PublicLayout(): JSX.Element {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans selection:bg-amber-800 selection:text-white">
      {/* Header */}
      <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900">
            <span className="w-6 h-6 bg-amber-800 text-stone-100 flex items-center justify-center text-xs font-mono">T</span>
            AI Token Tracker
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <a href="#features" className="hover:text-amber-800 transition-colors">Features</a>
            <a href="#platforms" className="hover:text-amber-800 transition-colors">Platforms</a>
            <a href="#faq" className="hover:text-amber-800 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium bg-amber-800 hover:bg-amber-900 text-stone-100 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium bg-amber-800 hover:bg-amber-900 text-stone-100 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-900 text-stone-400 text-sm py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-stone-100 font-semibold">
            <span className="w-5 h-5 bg-amber-800 text-stone-100 flex items-center justify-center text-xs font-mono">T</span>
            AI Token Tracker
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-400">
            <Link to="/privacy" className="hover:text-stone-200 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-stone-200 transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-stone-200 transition-colors">Cookies Policy</Link>
            <a href="https://github.com/guptalagan43/Fluxio" target="_blank" rel="noreferrer" className="hover:text-stone-200 transition-colors">GitHub</a>
          </div>

          <div className="text-xs text-stone-500">
            © {new Date().getFullYear()} AI Token Tracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
