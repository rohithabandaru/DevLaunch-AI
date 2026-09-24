'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/app-provider';

interface AuthShellProps {
  /** Which mode the shell starts in. Defaults to 'login'. */
  initialMode?: 'login' | 'signup' | 'forgot';
}

export function AuthShell({ initialMode = 'login' }: AuthShellProps) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result: string;
      if (mode === 'signup') {
        // ── Name validation ──
        if (name.trim().length < 2) {
          setMessage('Please enter your full name (at least 2 characters).');
          setLoading(false);
          return;
        }

        // ── Email validation ──
        const emailLower = email.toLowerCase().trim();
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const localPart = emailLower.split('@')[0] || '';
        const pureNumbers = /^\d+$/;
        const disposableDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com'];
        const domain = emailLower.split('@')[1] || '';

        if (!emailRegex.test(emailLower)) {
          setMessage('Please enter a valid email address (must start with a letter).');
          setLoading(false);
          return;
        }
        if (pureNumbers.test(localPart)) {
          setMessage('Email cannot be just numbers. Please use a real email address.');
          setLoading(false);
          return;
        }
        if (localPart.length < 3) {
          setMessage('Email username is too short. Please use a real email address.');
          setLoading(false);
          return;
        }
        if (disposableDomains.includes(domain)) {
          setMessage('Disposable/temporary emails are not allowed. Please use a real email.');
          setLoading(false);
          return;
        }

        // ── Password validation ──
        if (password !== confirmPassword) {
          setMessage('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setMessage('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        // ── Terms agreement validation ──
        if (!agreedToTerms) {
          setMessage('Please check the box to agree to the Terms of Service and Privacy Policy.');
          setLoading(false);
          return;
        }

        result = await signUp({ name, email: emailLower, password });
      } else if (mode === 'forgot') {
        result = await forgotPassword(email);
      } else {
        result = await signIn({ email, password });
      }

      if (result.toLowerCase().includes('rate limit') || result.toLowerCase().includes('too many')) {
        setMessage('Supabase signup rate limit reached. In Supabase Dashboard -> Authentication -> Providers -> Email, disable "Confirm email" or wait a few minutes.');
      } else {
        setMessage(result);
      }

      const resLower = (result || '').toLowerCase();
      if (
        resLower.includes('successfully') ||
        resLower.includes('sent') ||
        resLower.includes('signed in') ||
        resLower.includes('account created')
      ) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 400);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMessage('');
    try {
      const res = await signInWithGoogle();
      setMessage(res);
      const resLower = (res || '').toLowerCase();
      if (
        resLower.includes('successfully') ||
        resLower.includes('redirecting') ||
        resLower.includes('signed in')
      ) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 400);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  /* ---------- Feature cards for the left column ---------- */
  const features = [
    { title: '35 Resume Templates', desc: 'ATS-friendly, Modern, Executive, Developer, Timeline & more.' },
    { title: '15 Portfolio Themes', desc: 'Glassmorphic, Developer Dark, Neon, & Minimalist visual themes.' },
    { title: 'ATS Scoring & Match', desc: 'Instant feedback with keyword gap analysis and formatting suggestions.' },
    { title: 'AI Copywriter Engine', desc: 'Powered by OpenAI for summary, bullet points, and cover letters.' },
  ];

  /* ---------- mode helpers ---------- */
  const headingText =
    mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back';
  const subText =
    mode === 'signup'
      ? 'Start building your career portfolio in under 30 seconds.'
      : mode === 'forgot'
        ? "Enter your email and we'll send you a reset link."
        : 'Sign in to your DevLaunch AI dashboard.';
  const submitLabel =
    mode === 'signup' ? 'Create Free Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 selection:bg-violet-500/30 sm:py-16 flex flex-col items-center justify-center">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/30 via-cyan-500/20 to-transparent blur-3xl opacity-70" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[400px] w-[600px] rounded-full bg-gradient-to-tl from-emerald-600/15 via-cyan-500/10 to-transparent blur-3xl opacity-50" />

      <div className="w-full max-w-md space-y-6">
        {/* ── Brand Logo & Header ── */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-cyan-500 to-indigo-500 text-white shadow-xl shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-2xl font-extrabold text-transparent">
              DevLaunch AI
            </span>
          </Link>
          <p className="text-xs font-medium text-slate-400">
            Build ATS resumes, developer portfolios & track jobs with AI
          </p>
        </div>

        {/* ── FORM CARD ── */}
        <div className="w-full rounded-3xl border border-white/15 bg-slate-900/80 p-6 shadow-2xl shadow-violet-950/40 backdrop-blur-xl sm:p-8">
          {/* ── Mode Switcher Tabs ── */}
          <div className="mb-6 flex gap-1.5 rounded-full bg-white/5 p-1 border border-white/10">
            {([
              { key: 'login' as const, label: 'Login', href: '/login' },
              { key: 'signup' as const, label: 'Sign Up', href: '/signup' },
              { key: 'forgot' as const, label: 'Forgot Password', href: undefined },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key);
                  setMessage('');
                  if (tab.href) router.push(tab.href);
                }}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  mode === tab.key
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Heading ── */}
          <div className="mb-6 space-y-1 text-center">
            <h2 className="text-xl font-bold text-white">{headingText}</h2>
            <p className="text-xs text-slate-400">{subText}</p>
          </div>

          {/* ── Google Sign-in ── */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:border-white/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
              </button>

              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Or with email
                </span>
              </div>
            </>
          )}

          {/* ── Email / Password form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <User className="h-3 w-3 text-slate-500" /> Full Name
                </label>
                <input
                  id="auth-name"
                  required
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Mail className="h-3 w-3 text-slate-500" /> Email Address
              </label>
              <input
                id="auth-email"
                required
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Lock className="h-3 w-3 text-slate-500" /> Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Lock className="h-3 w-3 text-slate-500" /> Confirm Password
                </label>
                <input
                  id="auth-confirm-password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {/* Forgot password link on login */}
            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setMessage(''); }}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Terms agreement — signup only */}
            {mode === 'signup' && (
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-950/60 text-violet-500 focus:ring-violet-500"
                />
                <span className="text-xs text-slate-400">
                  I agree to the{' '}
                  <span className="text-violet-400 hover:underline cursor-pointer">Terms of Service</span> and{' '}
                  <span className="text-violet-400 hover:underline cursor-pointer">Privacy Policy</span>
                </span>
              </label>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full rounded-2xl bg-violet-600 hover:bg-violet-500 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 transition disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {submitLabel} <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            {/* Feedback message */}
            {message && (
              <div
                className={`rounded-2xl border px-3.5 py-2.5 text-xs font-medium ${
                  message.includes('successfully') || message.includes('sent')
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                {message}
              </div>
            )}
          </form>

          {/* ── Cross-page navigation ── */}
          <div className="mt-6 space-y-3">
            {mode === 'login' && (
              <p className="text-center text-xs text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-violet-400 hover:text-violet-300 transition">
                  Sign up for free
                </Link>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition">
                  Sign in
                </Link>
              </p>
            )}
            {mode === 'forgot' && (
              <p className="text-center text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setMessage(''); }}
                  className="font-semibold text-violet-400 hover:text-violet-300 transition cursor-pointer"
                >
                  Back to Login
                </button>
              </p>
            )}
            <p className="text-center text-xs text-slate-500">
              <Link href="/" className="hover:text-slate-300 transition">
                ← Return to Landing Page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
