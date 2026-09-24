'use client';

import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  Download,
  Calendar,
  History,
} from 'lucide-react';
import { cancelSubscription } from '@/lib/subscription-storage';
import { useReactiveSubscription, useReactiveInvoices } from '@/lib/use-subscription-store';
import { PaymentModal } from '@/components/pricing/payment-modal';

export default function BillingPage() {
  const subscription = useReactiveSubscription();
  const invoices = useReactiveInvoices();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<'PRO' | 'ENTERPRISE'>('PRO');

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel your subscription auto-renewal? You will retain access until the end of your current period.')) {
      cancelSubscription();
    }
  };

  const handleOpenUpgrade = (tier: 'PRO' | 'ENTERPRISE') => {
    setSelectedPlanForUpgrade(tier);
    setIsCheckoutOpen(true);
  };

  const isPro = subscription.tier === 'PRO' || subscription.tier === 'ENTERPRISE';

  return (
    <div className="space-y-8 pb-12 text-slate-100 max-w-6xl mx-auto">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-cyan-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Crown className="h-3.5 w-3.5 text-amber-400" /> Subscription & Account Billing
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Billing Management
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
              Manage your DevLaunch AI subscription plan, payment methods, transaction receipts, and feature upgrades.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isPro ? (
              <button
                onClick={() => handleOpenUpgrade('PRO')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition"
              >
                <Sparkles className="h-4 w-4 text-amber-300" /> Upgrade to Pro ($12/mo)
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-2.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Active {subscription.tier} Subscription
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Current Active Plan Overview Card */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Plan Status */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold border ${
                isPro
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/10 border-white/10 text-slate-300'
              }`}
            >
              {subscription.tier} TIER
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-white">
              {subscription.tier === 'FREE'
                ? '$0 / Free'
                : `${subscription.currency === 'INR' ? '₹' : '$'}${subscription.amountPaid}`}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Billed {subscription.billingCycle} • Auto-renew: {subscription.autoRenew ? 'ON' : 'OFF'}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-semibold capitalize text-emerald-400">{subscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Gateway:</span>
              <span className="font-semibold text-slate-200">{subscription.paymentMethod || 'N/A'}</span>
            </div>
          </div>

          {isPro && subscription.status === 'active' && (
            <button
              onClick={handleCancel}
              className="w-full text-center text-xs font-semibold text-rose-400 hover:text-rose-300 underline pt-2"
            >
              Cancel Auto-Renewal
            </button>
          )}
        </div>

        {/* Card 2: Period Renewal Date */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Billing Cycle</span>
            <Calendar className="h-4 w-4 text-indigo-400" />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-400">Current Period End</div>
            <div className="text-xl font-bold text-white mt-1">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/10">
            {subscription.tier === 'FREE'
              ? 'Upgrade to Pro for unlimited AI email tracking, interview prep, and ATS optimization.'
              : 'Your subscription will automatically renew at the end of the billing period.'}
          </p>
        </div>

        {/* Card 3: Included Features Quotas */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-3 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan Benefits</span>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{isPro ? 'Unlimited AI Email Job Sync' : 'Manual Job Tracking (5 Limit)'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{isPro ? 'AI Interview Prep Generator' : 'Basic ATS Score Checker'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{isPro ? 'Unlimited Resumes & Portfolios' : '1 Resume & 1 Portfolio Page'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{isPro ? 'Offer Negotiation Assistant' : '3 Cover Letters / Month'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Available Plans Upgrade Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" /> Compare & Upgrade Subscription Plans
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pro Card */}
          <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300">
                  RECOMMENDED FOR JOB SEEKERS
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-2">Pro Plan</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">₹299 <span className="text-xs font-normal text-slate-400">($4)</span></div>
                <div className="text-xs text-slate-400">/ month</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Complete AI power pack: Real Gmail sync, unlimited cover letters, ATS keyword optimizer, and interview briefing generator.
            </p>

            <button
              onClick={() => handleOpenUpgrade('PRO')}
              disabled={subscription.tier === 'PRO'}
              className={`w-full rounded-2xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                subscription.tier === 'PRO'
                  ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {subscription.tier === 'PRO' ? 'Current Active Plan ✓' : 'Upgrade to Pro →'}
            </button>
          </div>

          {/* Enterprise Card */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                  UNLIMITED POWER USER
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-2">Unlimited Plan</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">₹699 <span className="text-xs font-normal text-slate-400">($9)</span></div>
                <div className="text-xs text-slate-400">/ month</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Priority Gmail sync engine, unlimited job tracking entries, premium themes, salary counter-offer drafts, and calendar exports.
            </p>

            <button
              onClick={() => handleOpenUpgrade('ENTERPRISE')}
              disabled={subscription.tier === 'ENTERPRISE'}
              className={`w-full rounded-2xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                subscription.tier === 'ENTERPRISE'
                  ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 cursor-default'
                  : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
              }`}
            >
              {subscription.tier === 'ENTERPRISE' ? 'Current Active Plan ✓' : 'Upgrade to Unlimited →'}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction & Invoice History Table */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" /> Payment Receipts & Invoice History
          </h2>
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-slate-950 p-8 text-center text-xs text-slate-400 space-y-1">
            <p>No billing invoices generated yet.</p>
            <p className="text-slate-500">Your receipts will automatically display here after complete transactions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice ID</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Plan Billed</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono font-bold text-white">{inv.id}</td>
                    <td className="px-4 py-3 text-slate-300">{inv.date}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-300">{inv.planName}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{inv.amount}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 uppercase">{inv.paymentProvider}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => alert(`Receipt #${inv.id}\n${inv.planName}\nAmount Billed: ${inv.amount}\nStatus: ${inv.status}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal Popup */}
      <PaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planName={selectedPlanForUpgrade}
        tier={selectedPlanForUpgrade}
        initialMonthlyUSD={selectedPlanForUpgrade === 'PRO' ? 4 : 9}
        initialAnnualUSD={selectedPlanForUpgrade === 'PRO' ? 3 : 7}
        initialMonthlyINR={selectedPlanForUpgrade === 'PRO' ? 299 : 699}
        initialAnnualINR={selectedPlanForUpgrade === 'PRO' ? 199 : 499}
      />
    </div>
  );
}
