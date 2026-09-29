import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { jsonError } from '@/lib/http';
import { getRazorpayCredentials, getRazorpayWebhookSecret } from '@/lib/razorpay-config';
import { verifyWebhookSignature } from '@/lib/razorpay-signature';
import { isPaidTier } from '@/lib/plans';
import {
  grantEntitlement,
  markPaymentFailed,
  revokeEntitlementForPayment,
} from '@/lib/subscriptions';

/**
 * Razorpay webhook: the authoritative reconciliation channel.
 *
 * The browser success callback is best-effort — a user can close the tab
 * between paying and the callback firing, which would leave a paid customer
 * without access. This endpoint is what makes the server state trustworthy:
 * `payment.captured` is the settlement proof, and `refund.processed` is what
 * revokes access when someone refunds from the Razorpay dashboard.
 *
 * The signature covers the RAW body, so the body is read as text and parsed
 * afterwards. Re-serializing the parsed JSON would change key order and break
 * the HMAC.
 */
export async function POST(request: Request) {
  const webhookSecret = getRazorpayWebhookSecret();
  if (!webhookSecret) {
    // Fail closed. An unconfigured secret means we cannot authenticate the
    // caller, and an unauthenticated webhook is a way to mint entitlements.
    return jsonError(500, 'Webhook secret is not configured.');
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!verifyWebhookSignature({ rawBody, signature, webhookSecret })) {
    return jsonError(400, 'Invalid webhook signature.');
  }

  let event: { event?: string; payload?: RazorpayWebhookPayload };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonError(400, 'Malformed webhook payload.');
  }

  const payload = event.payload;
  if (!payload || typeof payload !== 'object' || !event.event) {
    return jsonError(400, 'Malformed webhook payload.');
  }

  const credentials = getRazorpayCredentials();
  if (!credentials) {
    return jsonError(500, 'Payments are not configured.');
  }

  try {
    switch (event.event) {
      case 'payment.captured':
        await handleCaptured(payload, credentials);
        break;
      case 'payment.failed':
        await handleFailed(payload);
        break;
      case 'refund.processed':
        await handleRefund(payload);
        break;
      default:
        // Unhandled events are acknowledged so Razorpay stops retrying them.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    // A non-2xx makes Razorpay retry, which is what we want for a transient
    // database failure.
    console.error(`Razorpay webhook ${event.event} failed:`, error);
    return jsonError(500, 'Could not process the webhook.');
  }
}

interface RazorpayWebhookPayload {
  payment?: {
    entity?: {
      id?: string;
      order_id?: string;
      amount?: number;
      currency?: string;
      notes?: Record<string, unknown>;
    };
  };
  refund?: {
    entity?: {
      id?: string;
      payment_id?: string;
    };
  };
  order?: {
    entity?: {
      id?: string;
      notes?: Record<string, unknown>;
    };
  };
}

/** The user id stamped onto the order at checkout. */
function userIdFromNotes(notes: Record<string, unknown> | undefined): string | null {
  const value = notes?.user_id;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

async function handleCaptured(
  payload: RazorpayWebhookPayload,
  credentials: { key_id: string; key_secret: string }
): Promise<void> {
  const payment = payload.payment?.entity;
  const paymentId = payment?.id;
  const orderId = payment?.order_id;
  if (!paymentId || !orderId) return;

  // The webhook body for payment.captured does not always carry notes, so fall
  // back to fetching the order. This is the settlement record, so the extra
  // call is worth it.
  let notes: Record<string, unknown> | undefined = payment?.notes;
  let amount: number | undefined = typeof payment?.amount === 'number' ? payment.amount : undefined;
  let currency = payment?.currency;
  if (!userIdFromNotes(notes)) {
    const razorpay = new Razorpay(credentials);
    const order = await razorpay.orders.fetch(orderId);
    notes = order.notes as Record<string, unknown> | undefined;
    if (amount === undefined && order.amount !== undefined) {
      amount = typeof order.amount === 'number' ? order.amount : Number(order.amount);
    }
    currency = currency ?? order.currency;
  }

  const userId = userIdFromNotes(notes);
  const rawTier = notes?.plan_id;
  const cycle = notes?.billing_cycle;
  if (!userId || typeof rawTier !== 'string' || typeof cycle !== 'string') {
    console.warn('payment.captured without a recoverable plan binding', { orderId, paymentId });
    return;
  }
  // create-order writes `plan_id` lower-cased (`plan.tier.toLowerCase()`), so
  // normalize before comparing. Comparing the raw value against 'PRO' silently
  // matched nothing and made the whole captured path a no-op.
  const tier = rawTier.toUpperCase();
  if (!isPaidTier(tier)) return;
  if (cycle !== 'monthly' && cycle !== 'annual') return;

  await grantEntitlement({
    userId,
    tier,
    billingCycle: cycle,
    amountPaidMinor: Number(amount ?? notes?.amount_minor ?? 0),
    currency: currency || 'INR',
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    isRenewal: true,
  });
}

async function handleFailed(payload: RazorpayWebhookPayload): Promise<void> {
  const payment = payload.payment?.entity;
  const userId = userIdFromNotes(payment?.notes);
  // A failed first payment has no entitlement to mark; the notes are only
  // present on orders created by our own create-order route.
  if (!userId) return;
  await markPaymentFailed(userId, payment?.id ?? null);
}

async function handleRefund(payload: RazorpayWebhookPayload): Promise<void> {
  const refund = payload.refund?.entity;
  const paymentId = refund?.payment_id;
  if (!paymentId) return;

  // Resolve the payer through the payment, since the refund entity only
  // references the payment.
  const credentials = getRazorpayCredentials();
  if (!credentials) return;
  const razorpay = new Razorpay(credentials);
  const payment = await razorpay.payments.fetch(paymentId);
  const orderId = payment.order_id;

  // `payments.fetch` does not echo notes, so read them off the order.
  let merged: Record<string, unknown> | undefined =
    (payment.notes as Record<string, unknown> | undefined) ?? undefined;
  if (!userIdFromNotes(merged) && orderId) {
    const order = await razorpay.orders.fetch(orderId);
    merged = order.notes as Record<string, unknown> | undefined;
  }

  const userId = userIdFromNotes(merged);
  if (!userId) return;
  await revokeEntitlementForPayment(userId, paymentId);
}
