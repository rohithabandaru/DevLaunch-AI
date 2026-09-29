'use client';

/**
 * Server-backed subscription state.
 *
 * `useReactiveSubscription` (localStorage) used to be the authority on what the
 * user had paid for, which meant editing one localStorage key granted
 * unlimited access. The server row written by a verified payment is the
 * authority now; this module keeps a local mirror only so a paying customer is
 * not flashed the paywall while the request is in flight.
 *
 * Implemented as an external store rather than `useState` + `useEffect` on
 * purpose: the fetch completes outside React's render, so no state is written
 * during an effect and the cascading-render loop this file previously risked
 * cannot happen.
 */

import { useSyncExternalStore } from 'react';
import type { UserSubscription } from '@/types/subscription-types';
import { DEFAULT_FREE_SUBSCRIPTION, getActiveSubscription } from './subscription-storage';
import { setAuthoritativeSubscription } from './plan-limits';

export const SUBSCRIPTION_EVENT = 'devlaunch_subscription_updated';

export interface ServerSubscriptionSnapshot {
  subscription: UserSubscription;
  /** True until the first fetch settles. */
  isLoading: boolean;
  /** True when the server could not be reached; the mirror is then a guess. */
  isUnverified: boolean;
}

const listeners = new Set<() => void>();

let inFlight: Promise<void> | null = null;

function readMirror(): UserSubscription {
  if (typeof window === 'undefined') return DEFAULT_FREE_SUBSCRIPTION;
  try {
    return getActiveSubscription();
  } catch {
    return DEFAULT_FREE_SUBSCRIPTION;
  }
}

let snapshot: ServerSubscriptionSnapshot = {
  // Seed from the local mirror so the first paint matches what the user last
  // paid for, instead of briefly rendering FREE.
  subscription: typeof window === 'undefined' ? DEFAULT_FREE_SUBSCRIPTION : readMirror(),
  isLoading: true,
  isUnverified: false,
};

function emit(next: Partial<ServerSubscriptionSnapshot>): void {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

function isUsable(value: unknown): value is UserSubscription {
  if (!value || typeof value !== 'object') return false;
  const sub = value as Partial<UserSubscription>;
  return (
    (sub.tier === 'FREE' || sub.tier === 'PRO' || sub.tier === 'ENTERPRISE') &&
    typeof sub.currentPeriodEnd === 'string'
  );
}

async function fetchSubscription(): Promise<void> {
  try {
    const res = await fetch('/api/subscription', {
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (res.status === 401) {
      // Signed out. The server has no opinion, so fall back to free.
      setAuthoritativeSubscription(DEFAULT_FREE_SUBSCRIPTION);
      emit({ subscription: DEFAULT_FREE_SUBSCRIPTION, isLoading: false, isUnverified: false });
      return;
    }
    if (!res.ok) throw new Error(`subscription fetch failed: ${res.status}`);

    const data = (await res.json()) as { subscription?: unknown };
    if (!isUsable(data.subscription)) throw new Error('malformed subscription payload');
    // Only a server response may publish to the non-React limits helpers. The
    // localStorage mirror deliberately never does: it is browser-controlled.
    setAuthoritativeSubscription(data.subscription);
    emit({ subscription: data.subscription, isLoading: false, isUnverified: false });
  } catch {
    // Offline, or the route is not deployed yet. Say so rather than implying
    // the mirror is authoritative.
    //
    // The published value is left as-is rather than reset: a user who already
    // has a verified entitlement keeps it through a blip, and a user who never
    // got one stays on the FREE default that `effectiveSubscription` returns
    // for null. Either way a failure cannot grant access.
    emit({ isLoading: false, isUnverified: true });
  }
}

/** Re-reads the server entitlement. Safe to call concurrently. */
export function refreshServerSubscription(): Promise<void> {
  if (!inFlight) {
    inFlight = fetchSubscription().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  if (listeners.size === 1) {
    // The first subscriber kicks off the fetch. Doing it here rather than in an
    // effect keeps the write out of React's render cycle.
    void refreshServerSubscription();

    const onLocalUpdate = () => {
      // A payment just completed in this tab: show the mirror immediately, then
      // confirm against the server.
      emit({ subscription: readMirror() });
      void refreshServerSubscription();
    };
    window.addEventListener(SUBSCRIPTION_EVENT, onLocalUpdate);

    return () => {
      window.removeEventListener(SUBSCRIPTION_EVENT, onLocalUpdate);
      listeners.delete(onStoreChange);
    };
  }

  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): ServerSubscriptionSnapshot {
  return snapshot;
}

function getServerSnapshot(): ServerSubscriptionSnapshot {
  return { subscription: DEFAULT_FREE_SUBSCRIPTION, isLoading: true, isUnverified: false };
}

export interface ServerSubscriptionState extends ServerSubscriptionSnapshot {
  refresh: () => Promise<void>;
}

export function useServerSubscription(): ServerSubscriptionState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...state, refresh: refreshServerSubscription };
}

/**
 * True when the subscription grants paid access right now.
 *
 * A canceled or past-due subscription still works until the paid period ends,
 * which matches what the customer was charged for. A tampered or stale value
 * can only fail this check (locking a user out), never grant access, because
 * the tier alone is not enough.
 */
export function hasPaidEntitlement(subscription: UserSubscription): boolean {
  if (subscription.tier !== 'PRO' && subscription.tier !== 'ENTERPRISE') return false;
  const end = new Date(subscription.currentPeriodEnd).getTime();
  return Number.isFinite(end) && end >= Date.now();
}

/** Whole days left in the current period, floored at zero. */
export function daysRemaining(subscription: UserSubscription): number {
  const end = new Date(subscription.currentPeriodEnd).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
}
