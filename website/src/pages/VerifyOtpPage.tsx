// src/pages/VerifyOtpPage.tsx
// 6-digit OTP verification page with auto-advance, paste support, resend countdown, and extension cross-messaging.

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOtp, requestOtp } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export function VerifyOtpPage(): JSX.Element {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get('email') || '';
  const source = searchParams.get('source');
  const extId = searchParams.get('extId');
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setDigits(pasted.split(''));
      inputsRef.current[5]?.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyOtp(email, code);
      login(res.user);

      // Extension authentication handoff
      if (source === 'extension' && extId && (window as any).chrome?.runtime?.sendMessage) {
        try {
          (window as any).chrome.runtime.sendMessage(extId, {
            type: 'AUTH_SUCCESS',
            token: res.token,
          });
        } catch (extErr) {
          console.warn('Failed to post AUTH_SUCCESS message to extension:', extErr);
        }
      }

      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendSeconds > 0) return;
    setError('');
    try {
      await requestOtp(email);
      setResendSeconds(60);
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-stone-50 border border-stone-200 p-8 w-full max-w-md shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-stone-900">Enter Verification Code</h2>
          <p className="text-sm text-stone-600 mt-1">
            We sent a 6-digit code to <span className="font-semibold text-stone-800">{email}</span>.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold font-mono bg-white border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-800"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          variant="primary"
          size="lg"
          disabled={loading || digits.join('').length < 6}
          className="w-full mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>

        <div className="text-center text-xs text-stone-500">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={resendSeconds > 0}
            className="text-amber-800 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
