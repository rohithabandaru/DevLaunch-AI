import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for entitlement lifecycle correctness, specifically the payment
 * idempotency that Razorpay's retry behaviour depends on.
 *
 * The regression these lock down: dedup used to compare against
 * `subscriptions.razorpay_payment_id`, which only ever holds the newest payment.
 * Replaying an older one therefore missed, fell through, and extended the paid
 * period again — free time, on every retry.
 */

type Row = Record<string, unknown>;

interface FakeError {
  code: string;
  message: string;
}

const claims = new Set<string>();
let subscriptionRow: Row | null = null;
let claimError: FakeError | null = null;
let readError: FakeError | null = null;
let upsertError: FakeError | null = null;
let events: Row[] = [];
let upsertCount = 0;

function baseRow(overrides: Row = {}): Row {
  return {
    tier: 'PRO',
    status: 'active',
    plan_id: 'pro',
    billing_cycle: 'monthly',
    amount_paid_minor: 29900,
    currency: 'INR',
    current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
    auto_renew: true,
    payment_provider: 'razorpay',
    refunded_at: null,
    razorpay_order_id: 'order_1',
    razorpay_payment_id: 'pay_1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

class FakeBuilder {
  // Only the mutating verbs set the operation. `select`/`single`/`eq` merely
  // shape the projection, exactly as in the real PostgREST builder, so
  // `.upsert(...).select(...)` must still resolve as the upsert.
  private op: 'select' | 'insert' | 'upsert' | 'delete' = 'select';
  private payload: Row = {};

  constructor(private table: string) {}

  select() {
    return this;
  }
  single() {
    return this;
  }
  maybeSingle() {
    return this;
  }
  eq(column: string, value: unknown) {
    // Record the filter: the release path is `.delete().eq('razorpay_payment_id', id)`,
    // and without it the fake cannot tell which claim to drop.
    this.payload[column] = value;
    return this;
  }

  insert(payload: Row) {
    this.op = 'insert';
    this.payload = payload;
    return this;
  }

  upsert(payload: Row) {
    this.op = 'upsert';
    this.payload = payload;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  then(resolve: (value: { data: unknown; error: FakeError | null }) => unknown) {
    return Promise.resolve(this.run()).then(resolve);
  }

  private run(): { data: unknown; error: FakeError | null } {
    if (this.table === 'processed_payments') {
      if (this.op === 'delete') {
        const id = this.payload.razorpay_payment_id as string | undefined;
        if (id) claims.delete(id);
        return { data: null, error: null };
      }
      const id = this.payload.razorpay_payment_id as string;
      if (claimError) return { data: null, error: claimError };
      if (claims.has(id)) {
        return { data: null, error: { code: '23505', message: 'duplicate key' } };
      }
      claims.add(id);
      return { data: null, error: null };
    }

    if (this.table === 'subscription_events') {
      events.push(this.payload);
      return { data: null, error: null };
    }

    // subscriptions
    if (this.op === 'select') {
      if (readError) return { data: null, error: readError };
      return { data: subscriptionRow, error: null };
    }
    if (this.op === 'upsert') {
      if (upsertError) return { data: null, error: upsertError };
      upsertCount += 1;
      subscriptionRow = baseRow(this.payload);
      return { data: subscriptionRow, error: null };
    }
    return { data: null, error: null };
  }
}

vi.mock('@/lib/auth-server', () => ({
  getServiceRoleClient: () => ({ from: (table: string) => new FakeBuilder(table) }),
}));

import { grantEntitlement } from './subscriptions';

const GRANT = {
  userId: 'user-1',
  tier: 'PRO' as const,
  billingCycle: 'monthly' as const,
  amountPaidMinor: 29900,
  currency: 'INR',
  razorpayOrderId: 'order_1',
  razorpayPaymentId: 'pay_1',
  isRenewal: true,
};

describe('grantEntitlement idempotency', () => {
  beforeEach(() => {
    claims.clear();
    events = [];
    upsertCount = 0;
    claimError = null;
    readError = null;
    upsertError = null;
    subscriptionRow = null;
  });

  it('claims the payment and writes the entitlement', async () => {
    const row = await grantEntitlement(GRANT);
    expect(claims.has('pay_1')).toBe(true);
    expect(upsertCount).toBe(1);
    expect(row.tier).toBe('PRO');
  });

  it('replaying the same payment does not stack another period', async () => {
    await grantEntitlement(GRANT);
    const firstEnd = subscriptionRow?.current_period_end;

    const replay = await grantEntitlement(GRANT);

    expect(upsertCount).toBe(1);
    expect(replay.currentPeriodEnd).toBe(firstEnd);
  });

  it('replaying an OLDER payment after a newer one does not extend the period', async () => {
    // The exact scenario that leaked free time: the row remembers only the
    // newest payment id, so a retry of the first one used to miss the dedup.
    await grantEntitlement(GRANT);
    await grantEntitlement({ ...GRANT, razorpayPaymentId: 'pay_2', razorpayOrderId: 'order_2' });
    const endAfterUpgrade = subscriptionRow?.current_period_end;

    const replayOld = await grantEntitlement(GRANT);

    expect(upsertCount).toBe(2);
    expect(replayOld.currentPeriodEnd).toBe(endAfterUpgrade);
  });

  it('stacks periods for genuinely distinct payments', async () => {
    const first = await grantEntitlement(GRANT);
    const second = await grantEntitlement({
      ...GRANT,
      razorpayPaymentId: 'pay_2',
      razorpayOrderId: 'order_2',
    });

    expect(upsertCount).toBe(2);
    expect(new Date(second.currentPeriodEnd).getTime()).toBeGreaterThan(
      new Date(first.currentPeriodEnd).getTime()
    );
  });

  it('releases the claim when the write fails, so a retry can complete', async () => {
    upsertError = { code: '58000', message: 'database unavailable' };
    await expect(grantEntitlement(GRANT)).rejects.toThrow();

    // Without the release the claim would make every retry a silent no-op and
    // the user's payment would never be delivered.
    expect(claims.has('pay_1')).toBe(false);

    upsertError = null;
    const row = await grantEntitlement(GRANT);
    expect(row.tier).toBe('PRO');
  });

  it('propagates a read failure instead of discarding paid time', async () => {
    await grantEntitlement(GRANT);
    const paidEnd = subscriptionRow?.current_period_end;

    readError = { code: '08006', message: 'connection failure' };
    await expect(grantEntitlement({ ...GRANT, razorpayPaymentId: 'pay_2' })).rejects.toThrow();

    // The old `.catch(() => null)` turned this into "never subscribed" and
    // overwrote the period end with now + 30d.
    expect(subscriptionRow?.current_period_end).toBe(paidEnd);
  });

  it('treats a non-unique-constraint claim failure as a hard error', async () => {
    // Only 23505 means "already processed". Anything else must not be mistaken
    // for a duplicate, or a broken insert would silently skip the grant.
    claimError = { code: '42501', message: 'permission denied' };
    await expect(grantEntitlement(GRANT)).rejects.toThrow();
    expect(upsertCount).toBe(0);
  });

  it('records the payment in the ledger', async () => {
    await grantEntitlement(GRANT);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ event_type: 'activated', razorpay_payment_id: 'pay_1' });
  });
});
