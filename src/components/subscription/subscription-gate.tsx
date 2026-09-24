'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import {
  getActiveSubscription,
  isSubscriptionExpired,
  getRemainingDays,
} from '@/lib/subscription-storage';
import { PaymentModal } from '@/components/pricing/payment-modal';
import type { UserSubscription, SubscriptionTier } from '@/types/subscription-types';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  // Free users are NOT limited by a wall-clock trial. They get a finite usage
  // allowance enforced by plan-limits (e.g. 3 AI generations, 5 tracked jobs).
  // Paid subscriptions still gate access until the paid period expires.
  const [subscription, setSubscription] = useState<UserSubscription | null>(() => getActiveSubscription());
  const [expired, setExpired] = useState(() => isSubscriptionExpired());
  const [daysLeft, setDaysLeft] = useState(() => getRemainingDays());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Listen for subscription updates (e.g. successful payment)
  useEffect(() => {
    const handleUpdate = () => {
      const sub = getActiveSubscription();
      setSubscription(sub);
      setExpired(isSubscriptionExpired());
      setDaysLeft(getRemainingDays());
    };

    window.addEventListener('devlaunch_subscription_updated', handleUpdate);
    return () => window.removeEventListener('devlaunch_subscription_updated', handleUpdate);
  }, []);

  // Don't render anything until client-side hydration
  if (!mounted || !subscription) return <>{children}</>;

  // If subscription is still valid, just render children (possibly with a warning banner)
  if (!expired) {
    // Show a gentle reminder banner if trial is ending soon (3 days or less)
    const showWarningBanner =
      subscription.status === 'trialing' && daysLeft <= 3 && daysLeft > 0;

    return (
      <>
        {showWarningBanner && (
          <div className="mx-auto mb-4 max-w-5xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 backdrop-blur-md">
              <Clock className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-200">
                  Free Trial Ending Soon — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                </p>
                <p className="text-[10px] text-amber-300/70 mt-0.5">
                  Upgrade to Pro or Unlimited to keep all your AI features unlocked.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTier('PRO');
                  setIsCheckoutOpen(true);
                }}
                className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-[10px] font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition"
              >
                Upgrade Now →
              </button>
            </div>
          </div>
        )}

        {children}

        <PaymentModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          planName={selectedTier === 'PRO' ? 'Pro' : 'Unlimited'}
          tier={selectedTier}
          initialMonthlyUSD={selectedTier === 'PRO' ? 4 : 9}
          initialAnnualUSD={selectedTier === 'PRO' ? 3 : 7}
          initialMonthlyINR={selectedTier === 'PRO' ? 299 : 699}
          initialAnnualINR={selectedTier === 'PRO' ? 199 : 499}
          onSuccess={() => setIsCheckoutOpen(false)}
        />
      </>
    );
  }

  // ──────────────────────────────────
  // PAYWALL: Subscription has expired
  // ──────────────────────────────────
  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-3xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/15 border-2 border-rose-500/30 shadow-2xl shadow-rose-500/10">
              <ShieldAlert className="h-10 w-10 text-rose-400" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5" /> Subscription Expired
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Your Free Trial Has Ended
              </h1>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                To continue using AI Job Sync, ATS Optimization, Resume Builder, and all premium features, please choose a plan below.
              </p>
            </div>
          </div>

          {/* Two Plan Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Pro Plan Card */}
            <div className="group relative rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-purple-950/30 p-6 space-y-5 shadow-2xl hover:border-indigo-400/60 transition-all duration-300">
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3.5 py-1 text-[10px] font-bold text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/30">
                  <Sparkles className="h-3 w-3 text-amber-300" /> MOST POPULAR
                </span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-white">Pro Plan</h3>
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-white">₹299</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                  <span className="text-xs text-slate-500 ml-2">($4 USD)</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {[
                  'Unlimited AI Job Sync from Gmail',
                  'AI Cover Letter Generator',
                  'ATS Score Optimizer',
                  'Interview Prep Briefings',
                  'Unlimited Resumes & Portfolios',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedTier('PRO');
                  setIsCheckoutOpen(true);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> Pay ₹299 & Unlock Pro
              </button>
            </div>

            {/* Unlimited Plan Card */}
            <div className="group rounded-3xl border border-white/15 bg-slate-900/80 p-6 space-y-5 shadow-xl hover:border-white/30 transition-all duration-300">
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-white">Unlimited Plan</h3>
                  <Zap className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-white">₹699</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                  <span className="text-xs text-slate-500 ml-2">($9 USD)</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {[
                  'Everything in Pro, plus:',
                  'Priority Gmail Sync Engine',
                  'Unlimited Job Tracker Entries',
                  'Premium Portfolio Themes',
                  'Offer Negotiation Assistant',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedTier('ENTERPRISE');
                  setIsCheckoutOpen(true);
                }}
                className="w-full rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 py-3.5 text-sm font-bold text-white shadow-lg transition flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> Pay ₹699 & Unlock Unlimited
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-500" /> 256-Bit SSL Encrypted Payments
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 7-Day Money Back Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Instant Activation — No Wait
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <PaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planName={selectedTier === 'PRO' ? 'Pro' : 'Unlimited'}
        tier={selectedTier}
        initialMonthlyUSD={selectedTier === 'PRO' ? 4 : 9}
        initialAnnualUSD={selectedTier === 'PRO' ? 3 : 7}
        initialMonthlyINR={selectedTier === 'PRO' ? 299 : 699}
        initialAnnualINR={selectedTier === 'PRO' ? 199 : 499}
        onSuccess={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
