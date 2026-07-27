// src/pages/LoginPage.tsx
import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { requestOtp } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const source = searchParams.get('source');
  const extId = searchParams.get('extId');
  const redirect = searchParams.get('redirect');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestOtp(email);
      const params = new URLSearchParams();
      params.set('email', email);
      if (source) params.set('source', source);
      if (extId) params.set('extId', extId);
      if (redirect) params.set('redirect', redirect);

      navigate(`/verify-otp?${params.toString()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-stone-50 border border-stone-200 p-8 w-full max-w-md shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-stone-900">Welcome Back</h2>
          <p className="text-sm text-stone-600 mt-1">Sign in with your email address using a one-time code.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full mt-2">
            {loading ? 'Sending Code...' : 'Send Verification Code'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-amber-800 font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SignupPage(): JSX.Element {
  return <LoginPage />;
}
