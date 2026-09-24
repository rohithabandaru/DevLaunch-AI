import { readStorage, writeStorage } from './storage';
import { getActiveSubscription } from './subscription-storage';

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

/** True when the signed-in user holds an active Pro or Unlimited subscription. */
export function isProUser(): boolean {
  const sub = getActiveSubscription();
  return sub.tier === 'PRO' || sub.tier === 'ENTERPRISE';
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