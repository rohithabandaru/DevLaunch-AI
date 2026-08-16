'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  ArrowRight,
  Building2,
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started with your first resume and job tracking.',
    monthlyPrice: 0,
    annualPrice: 0,
    badge: null,
    accent: 'border-white/10',
    bg: 'bg-[#1F2937]/50',
    ctaText: 'Get Started Free',
    ctaStyle:
      'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    icon: Zap,
    features: [
      '1 ATS-Optimized Resume',
      '1 Portfolio Page',
      'Basic ATS Score Checker',
      '3 AI Cover Letters / Month',
      'Manual Job Tracker (5 Entries)',
      'Auto-Fill Applicant Email & Phone',
      'Community Templates',
      'Email Support',
    ],
  },
  {
    name: 'Pro',
    description: 'For serious job seekers wanting AI Email Automation and interview tools.',
    monthlyPrice: 12,
    annualPrice: 9,
    badge: 'Most Popular',
    accent: 'border-indigo-500/50',
    bg: 'bg-gradient-to-br from-indigo-950/60 via-[#1F2937]/80 to-purple-950/40',
    ctaText: 'Start Pro Trial',
    ctaStyle:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30',
    icon: Sparkles,
    features: [
      'AI Email Job Tracker (Gmail & Outlook)',
      'Automated Thread Deduplication',
      '9-Stage Status Pipeline Tracking',
      'AI Recommended Next Actions',
      'Interview Date & Link Tracking',
      'Unlimited Resumes & Portfolios',
      'Advanced ATS Analysis + Keywords',
      'Unlimited AI Cover Letters',
      'AI Interview Prep Generator',
      'Export PDF, DOCX, Markdown',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For bootcamps, universities, and recruiting teams at scale.',
    monthlyPrice: 29,
    annualPrice: 24,
    badge: 'Teams',
    accent: 'border-white/10',
    bg: 'bg-[#1F2937]/50',
    ctaText: 'Contact Sales',
    ctaStyle:
      'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    icon: Building2,
    features: [
      'Everything in Pro',
      'Team Job Sync & Analytics',
      'Bulk Resume Generation',
      'White-label Portfolio Domains',
      'Admin Role Management',
      'API Access & Webhooks',
      'SSO / SAML Authentication',
      'Dedicated Account Manager',
      'Custom Onboarding & Training',
    ],
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

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

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 pt-4">
            <span
              className={`text-sm font-semibold transition-colors ${
                !isAnnual ? 'text-white' : 'text-gray-500'
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                isAnnual
                  ? 'bg-indigo-600'
                  : 'bg-gray-700'
              }`}
              aria-label="Toggle annual billing"
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold transition-colors ${
                isAnnual ? 'text-white' : 'text-gray-500'
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-in fade-in duration-200">
                Save 25%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, idx) => {
            const PlanIcon = plan.icon;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isPro = plan.name === 'Pro';

            return (
              <div
                key={plan.name}
                className={`relative glass-card rounded-[24px] ${plan.accent} ${plan.bg} p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPro
                    ? 'ring-2 ring-indigo-500/40 shadow-2xl shadow-indigo-950/50 scale-[1.02] lg:scale-105'
                    : 'hover:border-indigo-500/30'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-lg ${
                      isPro
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
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isPro
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
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isPro ? 'text-indigo-400' : 'text-emerald-400/70'
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <a
                  href={plan.name === 'Enterprise' ? 'mailto:sales@devlaunch.ai' : '/signup'}
                  className={`w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${plan.ctaStyle}`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
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
              href="mailto:support@devlaunch.ai"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              Talk to our team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
