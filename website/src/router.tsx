// src/router.tsx
// All routes — stubbed for Phase 1. Each page renders its name.
// Per architecture.md Section 6.2 — ProtectedRoute guard is a stub until Phase 7.

import { createBrowserRouter } from 'react-router-dom';

// ── Stub page components ──────────────────────────────────────────────
// Each page renders a simple div with its name. Real implementations come later.

function LandingPage(): JSX.Element {
  return (
    <div style={{ padding: '96px 48px' }}>
      <h1 className="text-display text-text-primary">AI Token Tracker</h1>
      <p className="text-body text-text-secondary" style={{ marginTop: '20px', maxWidth: '540px' }}>
        Track your AI spend. Get smarter model suggestions. Works across 20+ platforms.
      </p>
    </div>
  );
}

function SignupPage(): JSX.Element {
  return <div style={{ padding: '120px 48px' }}><h1 className="text-h1">Sign up</h1></div>;
}

function LoginPage(): JSX.Element {
  return <div style={{ padding: '120px 48px' }}><h1 className="text-h1">Log in</h1></div>;
}

function VerifyOtpPage(): JSX.Element {
  return <div style={{ padding: '120px 48px' }}><h1 className="text-h1">Verify OTP</h1></div>;
}

function DashboardPage(): JSX.Element {
  return <div style={{ padding: '32px 40px' }}><h1 className="text-h1">Dashboard</h1></div>;
}

function SettingsPage(): JSX.Element {
  return <div style={{ padding: '32px 40px' }}><h1 className="text-h1">Settings</h1></div>;
}

function PrivacyPolicyPage(): JSX.Element {
  return <div style={{ padding: '80px 48px', maxWidth: '640px', margin: '0 auto' }}><h1 className="text-h1">Privacy policy</h1></div>;
}

function TermsPage(): JSX.Element {
  return <div style={{ padding: '80px 48px', maxWidth: '640px', margin: '0 auto' }}><h1 className="text-h1">Terms of service</h1></div>;
}

function CookiesPage(): JSX.Element {
  return <div style={{ padding: '80px 48px', maxWidth: '640px', margin: '0 auto' }}><h1 className="text-h1">Cookie policy</h1></div>;
}

function NotFoundPage(): JSX.Element {
  return (
    <div style={{ padding: '120px 48px', textAlign: 'center' }}>
      <h1 className="text-display text-text-primary">404</h1>
      <p className="text-body text-text-secondary" style={{ marginTop: '16px' }}>Page not found</p>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  { path: '/',               element: <LandingPage /> },
  { path: '/signup',         element: <SignupPage /> },
  { path: '/login',          element: <LoginPage /> },
  { path: '/verify-otp',     element: <VerifyOtpPage /> },
  { path: '/dashboard',      element: <DashboardPage /> },
  { path: '/settings',       element: <SettingsPage /> },
  { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
  { path: '/terms',          element: <TermsPage /> },
  { path: '/cookies',        element: <CookiesPage /> },
  { path: '*',               element: <NotFoundPage /> },
]);
