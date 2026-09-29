/**
 * Server-only persistence for paid entitlements.
 *
 * Every read and write goes through the Supabase service role client. RLS on
 * `public.subscriptions` exposes no policies at all (see
 * `supabase/migrations/0003_subscriptions.sql`), so a user-scoped client can
 * neither read the tier nor write one. Nothing in this module may be called
 * from a client component.
 *
 * The invariant this module exists to enforce: a row here means a payment was
 * cryptographically verified with Razorpay's key secret. Callers must not
 * reach `grantEntitlement` without having run `verifyCheckoutSignature` or
 * `verifyWebhookSignature`.
 */

import { getServiceRoleClient } from './auth-server';
import { periodEndFromNow, type BillingCycle } from './plans';
import type { SubscriptionTier } from '@/types/subscription-types';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export type SubscriptionEventType =
  | 'activated'
  | 'renewed'
  | 'canceled'
  | 'payment_failed'
  | 'refunded';

export interface SubscriptionRow {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  planId: string;
  billingCycle: BillingCycle;
  amountPaidMinor: number;
  currency: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  paymentProvider: string;
  refundedAt: string | null;
  /**
   * The user's own provider identifiers. Not secret (the browser already
   * holds its payment id), and needed for idempotency and for receipts.
   */
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionEventRow {
  id: string;
  eventType: SubscriptionEventType;
  tier: SubscriptionTier;
  billingCycle: string | null;
  amountPaidMinor: number;
  currency: string;
  razorpayPaymentId: string | null;
  createdAt: string;
}

interface RawSubscriptionRow {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  plan_id: string;
  billing_cycle: BillingCycle;
  amount_paid_minor: number;
  currency: string;
  current_period_end: string;
  auto_renew: boolean;
  payment_provider: string;
  refunded_at: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  'tier, status, plan_id, billing_cycle, amount_paid_minor, currency, current_period_end, auto_renew, payment_provider, refunded_at, razorpay_order_id, razorpay_payment_id, created_at, updated_at';

function toSubscription(row: RawSubscriptionRow): SubscriptionRow {
  return {
    tier: row.tier,
    status: row.status,
    planId: row.plan_id,
    billingCycle: row.billing_cycle,
    amountPaidMinor: Number(row.amount_paid_minor),
    currency: row.currency,
    currentPeriodEnd: row.current_period_end,
    autoRenew: row.auto_renew,
    paymentProvider: row.payment_provider,
    refundedAt: row.refunded_at,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function requireServiceRole() {
  const client = getServiceRoleClient();
  if (!client) {
    throw new SubscriptionStorageError(
      'not_configured',
      'Server storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY to enable billing.'
    );
  }
  return client;
}

export class SubscriptionStorageError extends Error {
  constructor(
    readonly code: 'not_configured' | 'not_found' | 'storage_failed',
    message: string
  ) {
    super(message);
    this.name = 'SubscriptionStorageError';
  }
}

function storageStatus(code: SubscriptionStorageError['code']): number {
  if (code === 'not_configured') return 500;
  if (code === 'not_found') return 404;
  return 500;
}

/** The caller's entitlement. Free (and unauthenticated) means no row yet. */
export async function getSubscriptionForUser(userId: string): Promise<SubscriptionRow | null> {
  const serviceRole = requireServiceRole();
  const { data, error } = await serviceRole
    .from('subscriptions')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw new SubscriptionStorageError('storage_failed', 'Could not read the subscription.');
  }
  if (!data) return null;
  return toSubscription(data as RawSubscriptionRow);
}

export interface GrantInput {
  userId: string;
  tier: Exclude<SubscriptionTier, 'FREE'>;
  billingCycle: BillingCycle;
  amountPaidMinor: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  /** Distinguishes "renewal extends the period" from "first purchase starts it". */
  isRenewal?: boolean;
}

/** Postgres unique_violation. A payment id can only be claimed once, ever. */
const UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === UNIQUE_VIOLATION;
}

/**
 * Records that this payment id is being applied. Returns false when the id was
 * already claimed, which means this delivery is a duplicate and must not touch
 * the entitlement.
 *
 * The claim is keyed on the payment id alone and is never updated, so it
 * remembers every payment ever applied to the account — not just the most recent
 * one the way the `subscriptions` row does. That distinction is the whole fix:
 * Razorpay retries a failed delivery for ~24h and can resend any delivery by
 * hand, and a replay of an *older* payment used to extend the period again.
 */
async function claimPayment(
  serviceRole: ReturnType<typeof requireServiceRole>,
  userId: string,
  razorpayPaymentId: string
): Promise<boolean> {
  const { error } = await serviceRole
    .from('processed_payments')
    .insert({ razorpay_payment_id: razorpayPaymentId, user_id: userId });

  if (!error) return true;
  if (isUniqueViolation(error)) return false;
  throw new SubscriptionStorageError('storage_failed', 'Could not record the payment.');
}

/**
 * Undoes a claim so a transient failure is retryable. Without this, a claim
 * taken before a failed write would make the payment permanently undeliverable:
 * every retry would read as a duplicate and no-op, and the user would have paid
 * for nothing.
 */
async function releasePaymentClaim(
  serviceRole: ReturnType<typeof requireServiceRole>,
  razorpayPaymentId: string
): Promise<void> {
  await serviceRole
    .from('processed_payments')
    .delete()
    .eq('razorpay_payment_id', razorpayPaymentId);
}

/**
 * Grants (or extends) an entitlement for a payment that has already been
 * verified. Idempotent per payment id: replaying the same payment returns the
 * current row instead of stacking periods.
 *
 * Order matters — claim, then read, then write. Claiming first makes the
 * duplicate check a database constraint rather than a read-then-write race, and
 * reading second means the renewal base is the real current period. A failure
 * anywhere after the claim releases it so Razorpay's retry can complete.
 */
export async function grantEntitlement(input: GrantInput): Promise<SubscriptionRow> {
  const serviceRole = requireServiceRole();
  const {
    userId,
    tier,
    billingCycle,
    amountPaidMinor,
    currency,
    razorpayOrderId,
    razorpayPaymentId,
    isRenewal = false,
  } = input;

  const claimed = await claimPayment(serviceRole, userId, razorpayPaymentId);
  if (!claimed) {
    // Already applied. Return the row as it stands; extending again would hand
    // out free time on every retry.
    const current = await getSubscriptionForUser(userId);
    if (!current) {
      // A claim exists with no subscription row, which means the original grant
      // was rolled back after claiming. Release the stale claim so the next
      // delivery can apply the payment.
      await releasePaymentClaim(serviceRole, razorpayPaymentId);
      throw new SubscriptionStorageError('storage_failed', 'Could not read the subscription.');
    }
    return current;
  }

  try {
    // A read failure here must propagate. Swallowing it as "no subscription"
    // would reset the renewal base to now and silently discard every remaining
    // day the user already paid for.
    const existing = await getSubscriptionForUser(userId);

    // A renewal extends from the existing expiry; a first purchase starts now.
    const base = new Date();
    if (isRenewal && existing && new Date(existing.currentPeriodEnd).getTime() > Date.now()) {
      base.setTime(new Date(existing.currentPeriodEnd).getTime());
    }
    const periodEnd = periodEndFromNow(billingCycle, base);

    const { data, error } = await serviceRole
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          tier,
          status: 'active',
          plan_id: tier.toLowerCase(),
          billing_cycle: billingCycle,
          amount_paid_minor: amountPaidMinor,
          currency,
          current_period_end: periodEnd.toISOString(),
          auto_renew: true,
          payment_provider: 'razorpay',
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          refunded_at: null,
        },
        { onConflict: 'user_id' }
      )
      .select(SELECT_COLUMNS)
      .single();

    if (error || !data) {
      throw new SubscriptionStorageError('storage_failed', 'Could not save the subscription.');
    }

    await recordEvent({
      userId,
      eventType: existing && existing.tier !== 'FREE' ? 'renewed' : 'activated',
      tier,
      billingCycle,
      amountPaidMinor,
      currency,
      razorpayOrderId,
      razorpayPaymentId,
    }).catch(() => undefined);

    return toSubscription(data as RawSubscriptionRow);
  } catch (error) {
    await releasePaymentClaim(serviceRole, razorpayPaymentId).catch(() => undefined);
    throw error;
  }
}

export interface RecordEventInput {
  userId: string;
  eventType: SubscriptionEventType;
  tier: SubscriptionTier;
  billingCycle?: BillingCycle;
  amountPaidMinor?: number;
  currency?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  providerPayload?: unknown;
}

/** Appends to the billing ledger. Best-effort: never fails a payment flow. */
export async function recordEvent(input: RecordEventInput): Promise<void> {
  const serviceRole = requireServiceRole();
  await serviceRole.from('subscription_events').insert({
    user_id: input.userId,
    event_type: input.eventType,
    tier: input.tier,
    billing_cycle: input.billingCycle ?? null,
    amount_paid_minor: input.amountPaidMinor ?? 0,
    currency: input.currency ?? 'INR',
    razorpay_order_id: input.razorpayOrderId ?? null,
    razorpay_payment_id: input.razorpayPaymentId ?? null,
    provider_payload: (input.providerPayload as Record<string, unknown> | undefined) ?? null,
  });
}

/** The caller's billing history, newest first. */
export async function listSubscriptionEvents(
  userId: string,
  limit = 50
): Promise<SubscriptionEventRow[]> {
  const serviceRole = requireServiceRole();
  const { data, error } = await serviceRole
    .from('subscription_events')
    .select('id, event_type, tier, billing_cycle, amount_paid_minor, currency, razorpay_payment_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new SubscriptionStorageError('storage_failed', 'Could not load billing history.');
  }
  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      event_type: SubscriptionEventType;
      tier: SubscriptionTier;
      billing_cycle: string | null;
      amount_paid_minor: number;
      currency: string;
      razorpay_payment_id: string | null;
      created_at: string;
    };
    return {
      id: r.id,
      eventType: r.event_type,
      tier: r.tier,
      billingCycle: r.billing_cycle,
      amountPaidMinor: Number(r.amount_paid_minor),
      currency: r.currency,
      razorpayPaymentId: r.razorpay_payment_id,
      createdAt: r.created_at,
    };
  });
}

/** Cancels auto-renewal. Access continues until the paid period ends. */
export async function cancelSubscriptionForUser(userId: string): Promise<SubscriptionRow> {
  const serviceRole = requireServiceRole();
  const existing = await getSubscriptionForUser(userId);
  if (!existing) {
    throw new SubscriptionStorageError('not_found', 'No subscription to cancel.');
  }
  const { data, error } = await serviceRole
    .from('subscriptions')
    .update({ auto_renew: false, status: 'canceled' })
    .eq('user_id', userId)
    .select(SELECT_COLUMNS)
    .single();
  if (error || !data) {
    throw new SubscriptionStorageError('storage_failed', 'Could not cancel the subscription.');
  }
  await recordEvent({
    userId,
    eventType: 'canceled',
    tier: existing.tier,
    billingCycle: existing.billingCycle,
    razorpayPaymentId: null,
  }).catch(() => undefined);
  return toSubscription(data as RawSubscriptionRow);
}

/**
 * Revokes the entitlement for a refunded payment. Webhook-driven, so a refund
 * issued from the Razorpay dashboard takes effect here without the user or the
 * app doing anything.
 */
export async function revokeEntitlementForPayment(
  userId: string,
  paymentId: string
): Promise<void> {
  const serviceRole = requireServiceRole();
  const { data, error } = await serviceRole
    .from('subscriptions')
    .update({ status: 'canceled', auto_renew: false, refunded_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('razorpay_payment_id', paymentId)
    .select('tier')
    .maybeSingle();
  if (error) {
    throw new SubscriptionStorageError('storage_failed', 'Could not revoke the subscription.');
  }
  if (data) {
    await recordEvent({
      userId,
      eventType: 'refunded',
      tier: (data as { tier: SubscriptionTier }).tier,
      razorpayPaymentId: paymentId,
    }).catch(() => undefined);
  }
}

/** Flags a subscription whose renewal payment failed. */
export async function markPaymentFailed(userId: string, paymentId: string | null): Promise<void> {
  const serviceRole = requireServiceRole();
  const query = serviceRole
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('user_id', userId);
  if (paymentId) query.eq('razorpay_payment_id', paymentId);
  const { data } = await query.select('tier, billing_cycle').maybeSingle();
  if (data) {
    await recordEvent({
      userId,
      eventType: 'payment_failed',
      tier: (data as { tier: SubscriptionTier }).tier,
      razorpayPaymentId: paymentId,
    }).catch(() => undefined);
  }
}

export { storageStatus };
