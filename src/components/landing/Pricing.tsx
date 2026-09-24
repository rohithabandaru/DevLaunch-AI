'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  ArrowRight,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { PaymentModal } from '@/components/pricing/payment-modal';
import { useReactiveSubscription } from '@/lib/use-subscription-store';
import type { SubscriptionTier } from '@/types/subscription-types';

const plans = [
  {
    name: 'Free',
    tier: 'FREE' as SubscriptionTier,
    description: 'Perfect for getting started with your first resume, portfolio and job tracking.',
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyINR: 0,
    annualINR: 0,
    badge: null,
    accent: 'border-white/10',
    bg: 'bg-[#1F2937]/50',
    ctaText: 'Get Started Free',
    ctaStyle:
      'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    icon: Zap,
    features: [
      '1 ATS-Optimized Resume',
      '1 Interactive Portfolio Page',
      'Basic ATS Score Checker',
      '3 AI Cover Letters / Month',
      'Manual Job Tracker (Up to 5 Jobs)',
      'Applicant Email & Phone Auto-Fill',
      'Standard PDF Resume Export',
      'Community Support',
    ],
  },
  {
    name: 'Pro',
    tier: 'PRO' as SubscriptionTier,
    description: 'For active job seekers wanting automated Gmail sync, ATS optimizer, and interview prep.',
    monthlyPrice: 4,
    annualPrice: 3,
    monthlyINR: 299,
    annualINR: 199,
    badge: 'Most Popular • Student Special',
    accent: 'border-indigo-500/50',
    bg: 'bg-gradient-to-br from-indigo-950/60 via-[#1F2937]/80 to-purple-950/40',
    ctaText: 'Start Pro Plan (₹299/mo)',
    ctaStyle:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30',
    icon: Sparkles,
    features: [
      'AI Email Job Tracker (Auto-Sync Gmail)',
      '9-Stage Pipeline & Timeline History',
      'AI Recommended Next Actions',
      'Interview Date & Video Link Tracking',
      'Unlimited Resumes & Portfolios',
      'Advanced ATS Match & Keyword Analysis',
      'Unlimited Targeted AI Cover Letters',
      'AI Interview Prep Generator & Briefing',
      'AI Offer Negotiation Assistant',
      'Export PDF, DOCX, Markdown',
    ],
  },
  {
    name: 'Unlimited',
    tier: 'ENTERPRISE' as SubscriptionTier,
    description: 'For power users needing unlimited tracking, priority email sync & all premium features.',
    monthlyPrice: 9,
    annualPrice: 7,
    monthlyINR: 699,
    annualINR: 499,
    badge: 'Unlimited Power',
    accent: 'border-white/10',
    bg: 'bg-[#1F2937]/50',
    ctaText: 'Get Unlimited Plan (₹699/mo)',
    ctaStyle:
      'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    icon: Building2,
    features: [
      'Everything in Pro Plan',
      'Priority Gmail Auto-Sync Engine',
      'Unlimited Job Application Tracker Entries',
      'Premium Resume & Portfolio Themes',
      'AI Salary Counter-Offer Strategy Drafts',
      'Export Calendar Invites (.ics)',
      'Dedicated Career Dashboard Access',
    ],
  },
];

export function Pricing() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const activeTier = useReactiveSubscription().tier;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to Pro

  const handleOpenCheckout = (plan: typeof plans[0]) => {
    if (plan.tier === 'FREE') {
      router.push('/dashboard');
      return;
    }
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  return (
    <section id="pricing" className="py-24 relative bg-[#0B1020]">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-pink-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Crown className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Choose Your <br className="hidden sm:inline" />
            <span className="gradient-text-indigo">Career Launch Plan</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>

          {/* Active Plan Notification if logged in */}
          {activeTier !== 'FREE' && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300 shadow-md">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              You currently have an active <strong>{activeTier} Tier</strong> subscription!
            </div>
          )}

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 pt-4">
            <span
              className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-white' : 'text-gray-500'
                }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual
                  ? 'bg-indigo-600'
                  : 'bg-gray-700'
                }`}
              aria-label="Toggle annual billing"
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
              />
            </button>
            <span
              className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-white' : 'text-gray-500'
                }`}
            >
              Annual
            </span>
            {isAnnual && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-in fade-in duration-200">
                Best Value
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isPro = plan.name === 'Pro';
            const isCurrentTier = activeTier === plan.tier;

            return (
              <div
                key={plan.name}
                className={`relative glass-card rounded-[24px] ${plan.accent} ${plan.bg} p-8 flex flex-col justify-between transition-all duration-300 ${isPro
                    ? 'ring-2 ring-indigo-500/40 shadow-2xl shadow-indigo-950/50 scale-[1.02] lg:scale-105'
                    : 'hover:border-indigo-500/30'
                  }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-lg ${isPro
                        ? 'bg-indigo-600 text-white shadow-indigo-500/40'
                        : 'bg-white/10 text-gray-300 border border-white/10'
                      }`}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${isPro
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-white/5 border border-white/10 text-gray-400'
                        }`}
                    >
                      <PlanIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-8">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-gray-400 font-medium">
                        / month
                      </span>
                    )}
                    {price === 0 && (
                      <span className="text-sm text-gray-400 font-medium">
                        forever
                      </span>
                    )}
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-start gap-2.5 text-sm text-gray-300"
                      >
                        <Check
                          className={`w-4 h-4 mt-0.5 shrink-0 ${isPro ? 'text-indigo-400' : 'text-emerald-400/70'
                            }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${isCurrentTier
                      ? 'bg-emerald-600 text-white border border-emerald-500 shadow-lg shadow-emerald-600/30'
                      : plan.ctaStyle
                    }`}
                >
                  <span>{isCurrentTier ? 'Active Plan ✓' : plan.ctaText}</span>
                  {!isCurrentTier && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Assurance */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-xs text-gray-500">
            All plans include SSL encryption and privacy-focused data protection.
          </p>
          <p className="text-xs text-gray-500">
            Questions?{' '}
            <a
              href="mailto:rohithaaaaa.62@gmail.com"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              Talk to our team
            </a>
          </p>
        </div>
      </div>

      {/* Payment Checkout Modal Popup */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        planName={selectedPlan.name}
        tier={selectedPlan.tier}
        initialMonthlyUSD={selectedPlan.monthlyPrice}
        initialAnnualUSD={selectedPlan.annualPrice}
        initialMonthlyINR={selectedPlan.monthlyINR}
        initialAnnualINR={selectedPlan.annualINR}
      />
    </section>
  );
}
