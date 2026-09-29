import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Regression tests for the localStorage bypass.
 *
 * `plan-limits.ts` used to fall back to the browser-owned
 * `devlaunch_user_subscription` key whenever no server value had been published.
 * Because `DEFAULT_FREE_SUBSCRIPTION.currentPeriodEnd` is year 2099, a hand-edited
 * `tier` satisfied every check and `isProUser()` returned true — granting
 * unlimited AI generations on three dashboard pages, which is exactly what the
 * `0003_subscriptions` migration was written to prevent.
 */

vi.mock('./storage', () => ({
  readStorage: <T>(key: string, fallback: T): T => {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  },
  writeStorage: (key: string, value: unknown) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
}));

import {
  canUse,
  consume,
  isProUser,
  resetAuthoritativeSubscriptionForTest,
  setAuthoritativeSubscription,
} from './plan-limits';
import type { UserSubscription } from '@/types/subscription-types';

const FORGED: UserSubscription = {
  tier: 'ENTERPRISE',
  status: 'active',
  planId: 'enterprise',
  billingCycle: 'annual',
  currentPeriodEnd: '2099-12-31T23:59:59.000Z',
  autoRenew: true,
  currency: 'INR',
  amountPaid: 49900,
};

const VERIFIED_PRO: UserSubscription = {
  ...FORGED,
  tier: 'PRO',
  currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
};

describe('plan-limits server authority', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetAuthoritativeSubscriptionForTest();
  });

  it('ignores a forged localStorage subscription', () => {
    window.localStorage.setItem('devlaunch_user_subscription', JSON.stringify(FORGED));

    // Nothing has been published from the server yet, so this must fail closed.
    expect(isProUser()).toBe(false);
    expect(canUse('aiGenerations').allowed).toBe(true);
    expect(canUse('aiGenerations').remaining).toBe(3);
  });

  it('stays locked out after a forged value is written mid-session', () => {
    window.localStorage.setItem('devlaunch_user_subscription', JSON.stringify(FORGED));
    consume('aiGenerations');
    consume('aiGenerations');
    consume('aiGenerations');

    expect(isProUser()).toBe(false);
    expect(canUse('aiGenerations').allowed).toBe(false);
  });

  it('grants access once the server publishes a verified entitlement', () => {
    window.localStorage.setItem('devlaunch_user_subscription', JSON.stringify(FORGED));
    setAuthoritativeSubscription(VERIFIED_PRO);

    expect(isProUser()).toBe(true);
    expect(canUse('aiGenerations').remaining).toBe(Infinity);
  });

  it('does not grant when the published subscription has expired', () => {
    setAuthoritativeSubscription({
      ...VERIFIED_PRO,
      currentPeriodEnd: new Date(Date.now() - 1000).toISOString(),
    });

    expect(isProUser()).toBe(false);
  });

  it('revokes access when the server publishes a downgrade', () => {
    setAuthoritativeSubscription(VERIFIED_PRO);
    expect(isProUser()).toBe(true);

    setAuthoritativeSubscription({ ...VERIFIED_PRO, tier: 'FREE' });
    expect(isProUser()).toBe(false);
  });
});
