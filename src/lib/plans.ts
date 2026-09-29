/**
 * Authoritative plan catalog.
 *
 * Prices live here and ONLY here, server-side. The client sends a tier and a
 * billing cycle; it never sends an amount. `create-order` and
 * `verify-signature` both derive the amount from this table, so a tampered
 * request body cannot buy a Pro plan for 1 paise.
 *
 * These values mirror the marketing copy on the pricing page. If you change a
 * price here, change it there too.
 */

import type { SubscriptionTier } from '@/types/subscription-types';

export type BillingCycle = 'monthly' | 'annual';
export type PlanCurrency = 'INR' | 'USD';

export interface PlanDefinition {
  tier: SubscriptionTier;
  name: string;
  /** Minor units (paise) charged for one cycle. */
  priceMinor: Record<BillingCycle, number>;
  currency: PlanCurrency;
  /** Days the entitlement lasts from the moment payment is verified. */
  periodDays: Record<BillingCycle, number>;
}

export const PLANS: Record<Exclude<SubscriptionTier, 'FREE'>, PlanDefinition> = {
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    priceMinor: { monthly: 29900, annual: 19900 },
    currency: 'INR',
    periodDays: { monthly: 30, annual: 365 },
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    name: 'Unlimited',
    priceMinor: { monthly: 69900, annual: 49900 },
    currency: 'INR',
    periodDays: { monthly: 30, annual: 365 },
  },
};

export function isPaidTier(value: unknown): value is Exclude<SubscriptionTier, 'FREE'> {
  return value === 'PRO' || value === 'ENTERPRISE';
}

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === 'monthly' || value === 'annual';
}

export function isPlanCurrency(value: unknown): value is PlanCurrency {
  return value === 'INR' || value === 'USD';
}

/**
 * Resolves a tier + cycle to a priced plan, or null when either is unknown.
 * Never trusts a caller-supplied amount.
 */
export function resolvePlan(
  tier: unknown,
  cycle: unknown
): { plan: PlanDefinition; cycle: BillingCycle; amountMinor: number } | null {
  if (!isPaidTier(tier) || !isBillingCycle(cycle)) return null;
  const plan = PLANS[tier];
  return { plan, cycle, amountMinor: plan.priceMinor[cycle] };
}

/** The entitlement window that starts when a payment is verified. */
export function periodEndFromNow(cycle: BillingCycle, from = new Date()): Date {
  const days = PLANS.PRO.periodDays[cycle];
  const end = new Date(from);
  end.setDate(end.getDate() + days);
  return end;
}

/** Major-unit amount for display/receipts (29900 paise -> 299). */
export function toMajorUnits(minor: number): number {
  return minor / 100;
}
