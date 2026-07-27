// src/layouts/ProtectedLayout.tsx
// Dashboard and Settings layout with sidebar navigation and header user controls.

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isSettings = location.pathname.startsWith('/settings');

  return (
    <div className="min-h-screen flex bg-stone-100 text-stone-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-stone-200 bg-stone-50 flex flex-col justify-between">
        <div>
          <div className="h-16 border-b border-stone-200 px-6 flex items-center gap-2 font-bold text-stone-900">
            <span className="w-6 h-6 bg-amber-800 text-stone-100 flex items-center justify-center text-xs font-mono">T</span>
            AI Token Tracker
          </div>

          <nav className="p-4 flex flex-col gap-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                isDashboard ? 'bg-amber-800 text-stone-100' : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/settings"
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                isSettings ? 'bg-amber-800 text-stone-100' : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* User profile / Logout */}
        <div className="p-4 border-t border-stone-200">
          <div className="text-xs text-stone-500 truncate mb-2">{user?.email}</div>
          <button
            onClick={logout}
            className="w-full text-left text-xs font-medium text-stone-600 hover:text-red-700 transition-colors py-1"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-stone-200 bg-stone-50/80 px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">
            {isDashboard ? 'Dashboard' : isSettings ? 'Settings' : 'Account'}
          </h1>
          <div className="text-xs text-stone-500">
            Signed in as <span className="font-mono text-stone-800">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
