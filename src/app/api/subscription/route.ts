import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError } from '@/lib/http';
import {
  SubscriptionStorageError,
  cancelSubscriptionForUser,
  getSubscriptionForUser,
  listSubscriptionEvents,
  storageStatus,
} from '@/lib/subscriptions';
import type { UserSubscription } from '@/types/subscription-types';
import { DEFAULT_FREE_SUBSCRIPTION } from '@/lib/subscription-storage';

/**
 * The caller's authoritative entitlement.
 *
 * The client used to read its tier out of localStorage, which meant the browser
 * was the authority on what had been paid for. This endpoint is the replacement:
 * it reads through the service role, so it can only ever return the signed-in
 * user's own verified row, and an absent row means FREE.
 *
 * POST cancels auto-renewal, which now also records the change server-side
 * rather than only flipping a local flag.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  try {
    const [row, events] = await Promise.all([
      getSubscriptionForUser(user.id),
      listSubscriptionEvents(user.id).catch(() => []),
    ]);

    return NextResponse.json({
      subscription: toClientSubscription(row),
      events,
    });
  } catch (error) {
    if (error instanceof SubscriptionStorageError) {
      return jsonError(storageStatus(error.code), error.message);
    }
    return jsonError(500, 'Could not load your subscription.');
  }
}

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  try {
    const row = await cancelSubscriptionForUser(user.id);
    return NextResponse.json({ subscription: toClientSubscription(row) });
  } catch (error) {
    if (error instanceof SubscriptionStorageError) {
      return jsonError(storageStatus(error.code), error.message);
    }
    return jsonError(500, 'Could not cancel the subscription.');
  }
}

/** Projects the server row onto the shape the client components already use. */
function toClientSubscription(row: Awaited<ReturnType<typeof getSubscriptionForUser>>): UserSubscription {
  if (!row) return DEFAULT_FREE_SUBSCRIPTION;
  return {
    tier: row.tier,
    status: row.status,
    planId: row.planId,
    billingCycle: row.billingCycle,
    currentPeriodEnd: row.currentPeriodEnd,
    paymentMethod: row.paymentProvider.toUpperCase(),
    autoRenew: row.autoRenew,
    currency: row.currency === 'USD' ? 'USD' : 'INR',
    amountPaid: row.amountPaidMinor / 100,
  };
}
