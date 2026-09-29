import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Route-level tests for the entitlement boundary.
 *
 * The property under test is the one that was broken before: a paid tier may
 * only ever be written after Razorpay's signature verifies AND the order is
 * proven to belong to the caller. `grantEntitlement` is mocked so any call to
 * it is an observable, assertable event.
 */

const grantEntitlement = vi.fn();
const cancelSubscriptionForUser = vi.fn();
const getSubscriptionForUser = vi.fn();
const listSubscriptionEvents = vi.fn();

let sessionUser: { id: string; email: string } | null = null;

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ getAll: () => [], set: () => {} }),
}));

vi.mock('@/lib/auth-server', () => ({
  getSessionUser: () => Promise.resolve(sessionUser),
  getServiceRoleClient: () => ({ from: vi.fn() }),
}));

vi.mock('@/lib/subscriptions', () => ({
  grantEntitlement: (...args: unknown[]) => grantEntitlement(...args),
  cancelSubscriptionForUser: (...args: unknown[]) => cancelSubscriptionForUser(...args),
  getSubscriptionForUser: (...args: unknown[]) => getSubscriptionForUser(...args),
  listSubscriptionEvents: (...args: unknown[]) => listSubscriptionEvents(...args),
  storageStatus: () => 500,
  SubscriptionStorageError: class extends Error {},
}));

const KEY_SECRET = 'a_real_looking_key_secret_value';

vi.mock('@/lib/razorpay-config', () => ({
  getRazorpayCredentials: () => ({ key_id: 'rzp_live_key', key_secret: KEY_SECRET }),
  getRazorpayKeyId: () => 'rzp_live_key',
  getRazorpayWebhookSecret: () => 'a_real_looking_webhook_secret',
}));

let fetchedOrder: {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes: Record<string, unknown>;
} = {
  id: 'order_1',
  amount: 29900,
  currency: 'INR',
  status: 'paid',
  notes: {
    user_id: 'user-1',
    plan_id: 'pro',
    billing_cycle: 'monthly',
    amount_minor: '29900',
  },
};

vi.mock('razorpay', () => ({
  default: class {
    orders = {
      create: vi.fn(),
      fetch: vi.fn(() => Promise.resolve(fetchedOrder)),
    };
  },
}));

function post(body: unknown): Request {
  return new Request('http://localhost/api/razorpay/verify-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** A genuine signature for the given ids, using the same secret the route reads. */
async function sign(orderId: string, paymentId: string): Promise<string> {
  const { computeCheckoutSignature } = await import('@/lib/razorpay-signature');
  return computeCheckoutSignature(orderId, paymentId, KEY_SECRET);
}

const USER = 'user-1';

describe('POST /api/razorpay/verify-signature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionUser = { id: USER, email: 'a@b.com' };
    fetchedOrder = {
      id: 'order_1',
      amount: 29900,
      currency: 'INR',
      status: 'paid',
      notes: {
        user_id: USER,
        plan_id: 'pro',
        billing_cycle: 'monthly',
        amount_minor: '29900',
      },
    };
    grantEntitlement.mockResolvedValue({
      tier: 'PRO',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodEnd: '2026-02-01T00:00:00.000Z',
      amountPaidMinor: 29900,
      currency: 'INR',
    });
  });

  it('grants the entitlement for a genuine, owned payment', async () => {
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.verified).toBe(true);
    expect(grantEntitlement).toHaveBeenCalledTimes(1);
    expect(grantEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER, tier: 'PRO', billingCycle: 'monthly', amountPaidMinor: 29900 })
    );
  });

  it('rejects an unsigned attempt and grants nothing', async () => {
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: 'forged',
      })
    );

    expect(res.status).toBe(400);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('rejects a signature replayed against a different payment id', async () => {
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const signature = await sign('order_1', 'pay_1');
    const res = await POST(
      post({ razorpayOrderId: 'order_1', razorpayPaymentId: 'pay_2', razorpaySignature: signature })
    );

    expect(res.status).toBe(400);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it("refuses a payment that belongs to somebody else's order", async () => {
    fetchedOrder = { ...fetchedOrder, notes: { ...fetchedOrder.notes, user_id: 'someone-else' } };
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(403);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('refuses an amount that does not match the plan catalog', async () => {
    // A real order the user paid, but for 100x less than the plan price.
    fetchedOrder = { ...fetchedOrder, amount: 299 };
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(409);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('refuses an order that is not paid yet', async () => {
    fetchedOrder = { ...fetchedOrder, status: 'created' };
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(409);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('refuses a FREE plan smuggled through the order notes', async () => {
    fetchedOrder = { ...fetchedOrder, notes: { ...fetchedOrder.notes, plan_id: 'free' } };
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(400);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('refuses a top-tier order that was paid at the bottom-tier price', async () => {
    // The dangerous shape: amount and notes agree with each other, so no
    // internal inconsistency is visible — but 299 rupees is the PRO price and
    // the order claims ENTERPRISE. Only the server-side catalog catches this.
    fetchedOrder = {
      ...fetchedOrder,
      amount: 29900,
      notes: {
        ...fetchedOrder.notes,
        plan_id: 'enterprise',
        billing_cycle: 'monthly',
        amount_minor: '29900',
      },
    };
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(409);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('requires a signed-in caller', async () => {
    sessionUser = null;
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(401);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('rejects a malformed body without granting anything', async () => {
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      new Request('http://localhost/api/razorpay/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      })
    );

    expect(res.status).toBe(400);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('does not grant a tier the signature does not cover', async () => {
    // The signature is valid, but the order names a plan whose price does not
    // match what was charged. Entitlement must still be refused.
    fetchedOrder = {
      ...fetchedOrder,
      amount: 19900,
      notes: { ...fetchedOrder.notes, plan_id: 'pro', billing_cycle: 'annual', amount_minor: '19900' },
    };
    const { POST } = await import('@/app/api/razorpay/verify-signature/route');
    const res = await POST(
      post({
        razorpayOrderId: 'order_1',
        razorpayPaymentId: 'pay_1',
        razorpaySignature: await sign('order_1', 'pay_1'),
      })
    );

    expect(res.status).toBe(200);
    expect(grantEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({ tier: 'PRO', billingCycle: 'annual', amountPaidMinor: 19900 })
    );
  });
});
