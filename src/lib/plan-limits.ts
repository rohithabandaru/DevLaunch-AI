import { readStorage, writeStorage } from './storage';
import { DEFAULT_FREE_SUBSCRIPTION } from './subscription-storage';
import type { UserSubscription } from '@/types/subscription-types';

/**
 * Free plan usage caps. Once a Free user exhausts a cap they cannot use that
 * feature again until they upgrade to Pro or Unlimited. Pro/Unlimited users
 * have no limits.
 */
export const FREE_LIMITS = {
  aiGenerations: 3,
  jobsTracked: 5,
  resumesSaved: 1,
  portfoliosCreated: 1,
} as const;

export type UsageKey = keyof typeof FREE_LIMITS;

export interface FeatureUsage {
  aiGenerations: number;
  jobsTracked: number;
  resumesSaved: number;
  portfoliosCreated: number;
}

const USAGE_KEY = 'feature_usage';

const DEFAULT_USAGE: FeatureUsage = {
  aiGenerations: 0,
  jobsTracked: 0,
  resumesSaved: 0,
  portfoliosCreated: 0,
};

/**
 * The subscription every usage check reads.
 *
 * These are non-React helpers called from click handlers, so the verified
 * server value is published into this module by the store in
 * `use-server-subscription.ts` rather than threaded through props.
 *
 * The default is FREE, not the localStorage mirror. Reading the mirror here
 * would reintroduce the hole this migration exists to close: the browser owns
 * that key, and `DEFAULT_FREE_SUBSCRIPTION.currentPeriodEnd` is year 2099, so a
 * hand-edited `tier` would satisfy any expiry check. Failing closed costs a
 * paying user one extra click on the rare render where the fetch has not
 * landed yet, which is the correct direction for that trade.
 */
let serverSubscription: UserSubscription | null = null;

/** Publishes the verified server subscription to the non-React helpers. */
export function setAuthoritativeSubscription(subscription: UserSubscription | null): void {
  serverSubscription = subscription;
}

/** Test-only: clears the published value so each case starts fail-closed. */
export function resetAuthoritativeSubscriptionForTest(): void {
  serverSubscription = null;
}

function effectiveSubscription(): UserSubscription {
  return serverSubscription ?? DEFAULT_FREE_SUBSCRIPTION;
}

/** True when the subscription grants paid access right now. */
export function isProEntitlement(subscription: UserSubscription): boolean {
  if (subscription.tier !== 'PRO' && subscription.tier !== 'ENTERPRISE') return false;
  const end = new Date(subscription.currentPeriodEnd).getTime();
  return Number.isFinite(end) && end >= Date.now();
}

/** True when the signed-in user holds an active Pro or Unlimited subscription. */
export function isProUser(): boolean {
  return isProEntitlement(effectiveSubscription());
}

export function getFeatureUsage(): FeatureUsage {
  return { ...DEFAULT_USAGE, ...readStorage<Partial<FeatureUsage>>(USAGE_KEY, {}) };
}

export function getUsage(key: UsageKey): number {
  return getFeatureUsage()[key] || 0;
}

export function getRemaining(key: UsageKey): number {
  if (isProUser()) return Infinity;
  return Math.max(0, FREE_LIMITS[key] - getUsage(key));
}

export function canUse(key: UsageKey): { allowed: boolean; used: number; remaining: number } {
  const used = getUsage(key);
  const limit = isProUser() ? Infinity : FREE_LIMITS[key];
  return { allowed: used < limit, used, remaining: Math.max(0, limit - used) };
}

/** Record that a Free-tier usage slot was consumed. */
export function consume(key: UsageKey): FeatureUsage {
  const usage = getFeatureUsage();
  usage[key] = (usage[key] || 0) + 1;
  writeStorage(USAGE_KEY, usage);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('devlaunch_usage_updated', { detail: usage }));
  }
  return usage;
}