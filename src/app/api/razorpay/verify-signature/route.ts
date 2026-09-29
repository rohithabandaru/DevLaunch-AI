import Razorpay from 'razorpay';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError, readJsonBody } from '@/lib/http';
import { isPaidTier, resolvePlan, toMajorUnits } from '@/lib/plans';
import { getRazorpayCredentials } from '@/lib/razorpay-config';
import { verifyCheckoutSignature } from '@/lib/razorpay-signature';
import {
  SubscriptionStorageError,
  grantEntitlement,
  storageStatus,
} from '@/lib/subscriptions';
import { NextResponse } from 'next/server';

interface RazorpayOrderNotes {
  user_id?: unknown;
  plan_id?: unknown;
  billing_cycle?: unknown;
  amount_minor?: unknown;
}

/**
 * Exchanges a completed Razorpay checkout for a real entitlement.
 *
 * This is the authorization boundary for paid features. The browser cannot be
 * trusted: it hands over three strings, none of which it could have produced
 * without Razorpay's involvement.
 *
 * Four independent checks, all of which must pass:
 *   1. The caller is signed in.
 *   2. `razorpay_signature` is a valid HMAC of `order_id|payment_id` under the
 *      key secret, which only exists server-side.
 *   3. The order, fetched back from Razorpay, belongs to the caller — its
 *      `notes.user_id` must equal the session user id. Without this, anyone who
 *      learns an order id could redeem a stranger's payment.
 *   4. The order was paid in full for a price matching the plan catalog.
 *
 * Only then is a row written. `grantEntitlement` is idempotent per payment id,
 * so the browser retrying this or the `payment.captured` webhook arriving
 * first both converge on the same state.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Sign in to complete your purchase.');
  }

  const body = await request.text();
  const parsed = await readJsonBody(body);
  if (!parsed.ok) {
    return jsonError(parsed.status, parsed.message);
  }
  const input = parsed.data as {
    razorpayOrderId?: unknown;
    razorpayPaymentId?: unknown;
    razorpaySignature?: unknown;
  };
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

  if (
    typeof razorpayOrderId !== 'string' ||
    typeof razorpayPaymentId !== 'string' ||
    typeof razorpaySignature !== 'string'
  ) {
    return jsonError(400, 'Missing payment details.');
  }

  const credentials = getRazorpayCredentials();
  if (!credentials) {
    return jsonError(500, 'Payments are not configured. Please try again later.');
  }

  // (2) The signature proves Razorpay issued this order/payment pair.
  if (
    !verifyCheckoutSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      keySecret: credentials.key_secret,
    })
  ) {
    return jsonError(400, 'Payment could not be verified. No access was granted.');
  }

  try {
    // (3) + (4) The order is the source of truth for who paid what for.
    const razorpay = new Razorpay(credentials);
    const order = await razorpay.orders.fetch(razorpayOrderId);
    const notes = (order.notes ?? {}) as RazorpayOrderNotes;

    if (notes.user_id !== user.id) {
      return jsonError(403, 'This payment belongs to a different account.');
    }

    const tier = notes.plan_id;
    const cycle = notes.billing_cycle;
    if (typeof tier !== 'string' || !isPaidTier(tier.toUpperCase())) {
      return jsonError(400, 'The order does not name a valid plan.');
    }
    const normalizedTier = tier.toUpperCase() as 'PRO' | 'ENTERPRISE';

    const resolved = resolvePlan(normalizedTier, cycle);
    if (!resolved) {
      return jsonError(400, 'The order does not name a valid billing cycle.');
    }

    // The amount charged must equal the catalog price for that plan. This also
    // catches a stale catalogue where the price changed between checkout and
    // verification.
    if (Number(order.amount) !== resolved.amountMinor) {
      return jsonError(409, 'The amount paid does not match the plan price.');
    }
    if (order.status !== 'paid') {
      return jsonError(409, 'The payment has not completed yet.');
    }
    const paid = Number(notes.amount_minor);
    if (Number.isFinite(paid) && paid !== Number(order.amount)) {
      return jsonError(409, 'The order amount could not be reconciled.');
    }

    const subscription = await grantEntitlement({
      userId: user.id,
      tier: normalizedTier,
      billingCycle: resolved.cycle,
      amountPaidMinor: Number(order.amount),
      currency: order.currency || 'INR',
      razorpayOrderId,
      razorpayPaymentId,
      isRenewal: true,
    });

    return NextResponse.json({
      verified: true,
      subscription,
      amountPaid: toMajorUnits(Number(order.amount)),
      currency: order.currency || 'INR',
    });
  } catch (error) {
    if (error instanceof SubscriptionStorageError) {
      return jsonError(storageStatus(error.code), error.message);
    }
    const errObj = error as { error?: { description?: string }; message?: string } | null;
    // A provider fetch failure must not be reported as a verification failure:
    // the payment may well be fine.
    return jsonError(502, errObj?.error?.description || 'Could not verify the payment with Razorpay.');
  }
}
