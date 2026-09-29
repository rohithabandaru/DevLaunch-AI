import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The webhook is the authoritative reconciliation channel, so its most
 * important property is that it rejects everything it cannot authenticate.
 */

const grantEntitlement = vi.fn();
const markPaymentFailed = vi.fn();
const revokeEntitlementForPayment = vi.fn();

let webhookSecret: string | null = 'a_real_looking_webhook_secret';

vi.mock('@/lib/razorpay-config', () => ({
  getRazorpayCredentials: () => ({ key_id: 'rzp_live_key', key_secret: 'a_real_looking_key_secret' }),
  getRazorpayKeyId: () => 'rzp_live_key',
  getRazorpayWebhookSecret: () => webhookSecret,
}));

vi.mock('@/lib/subscriptions', () => ({
  grantEntitlement: (...args: unknown[]) => grantEntitlement(...args),
  markPaymentFailed: (...args: unknown[]) => markPaymentFailed(...args),
  revokeEntitlementForPayment: (...args: unknown[]) => revokeEntitlementForPayment(...args),
  SubscriptionStorageError: class extends Error {},
}));

const ORDER_NOTES = {
  user_id: 'user-1',
  plan_id: 'pro',
  billing_cycle: 'monthly',
  amount_minor: '29900',
};

vi.mock('razorpay', () => ({
  default: class {
    orders = {
      fetch: vi.fn((orderId: string) =>
        Promise.resolve({
          id: orderId,
          // An orphan order: valid shape, but no user stamped on it.
          notes: orderId === 'order_orphan' ? { plan_id: 'pro' } : ORDER_NOTES,
          amount: 29900,
          currency: 'INR',
        })
      ),
    };
    payments = { fetch: vi.fn(() => Promise.resolve({ id: 'pay_1', order_id: 'order_1', notes: {} })) };
  },
}));

const SECRET = 'a_real_looking_webhook_secret';

async function deliver(payload: unknown, signatureOverride?: string | null): Promise<Response> {
  const { computeWebhookSignature } = await import('@/lib/razorpay-signature');
  const raw = JSON.stringify(payload);
  const { POST } = await import('@/app/api/razorpay/webhook/route');
  return POST(
    new Request('http://localhost/api/razorpay/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature':
          signatureOverride === undefined ? computeWebhookSignature(raw, SECRET) : (signatureOverride ?? ''),
      },
      body: raw,
    })
  );
}

const capturedEvent = {
  event: 'payment.captured',
  payload: {
    payment: {
      entity: { id: 'pay_1', order_id: 'order_1', amount: 29900, currency: 'INR', notes: {} },
    },
  },
};

describe('POST /api/razorpay/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    webhookSecret = SECRET;
    grantEntitlement.mockResolvedValue({});
  });

  it('grants an entitlement on a signed payment.captured', async () => {
    const res = await deliver(capturedEvent);
    expect(res.status).toBe(200);
    expect(grantEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', tier: 'PRO', billingCycle: 'monthly' })
    );
  });

  it('rejects an unsigned payload and grants nothing', async () => {
    const res = await deliver(capturedEvent, 'forged-signature');
    expect(res.status).toBe(400);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('rejects a missing signature header', async () => {
    const res = await deliver(capturedEvent, null);
    expect(res.status).toBe(400);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('fails closed when the webhook secret is unconfigured', async () => {
    // Unset RAZORPAY_WEBHOOK_SECRET must not turn the endpoint into an open
    // mint for entitlements.
    webhookSecret = null;
    const res = await deliver(capturedEvent);
    expect(res.status).toBe(500);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('rejects a tampered body', async () => {
    const { computeWebhookSignature } = await import('@/lib/razorpay-signature');
    const signed = JSON.stringify(capturedEvent);
    const signature = computeWebhookSignature(signed, SECRET);
    const tampered = signed.replace('29900', '1');

    const { POST } = await import('@/app/api/razorpay/webhook/route');
    const res = await POST(
      new Request('http://localhost/api/razorpay/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': signature },
        body: tampered,
      })
    );

    expect(res.status).toBe(400);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('revokes the entitlement when a refund is processed', async () => {
    const res = await deliver({
      event: 'refund.processed',
      payload: { refund: { entity: { id: 'rfnd_1', payment_id: 'pay_1' } } },
    });

    expect(res.status).toBe(200);
    expect(revokeEntitlementForPayment).toHaveBeenCalledWith('user-1', 'pay_1');
  });

  it('ignores an order with no recoverable plan binding', async () => {
    const res = await deliver({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_9', order_id: 'order_orphan', amount: 1, notes: {} } } },
    });

    // Acknowledged so Razorpay stops retrying, but nothing is granted from an
    // order that names no user, even if it is otherwise well formed.
    expect(res.status).toBe(200);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });

  it('recovers the plan binding from the order when the payment omits notes', async () => {
    const res = await deliver({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_1', order_id: 'order_1', amount: 29900, notes: {} } } },
    });

    expect(res.status).toBe(200);
    expect(grantEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', amountPaidMinor: 29900 })
    );
  });

  it('acknowledges unknown events instead of retrying them forever', async () => {
    const res = await deliver({ event: 'subscription.charged', payload: {} });
    expect(res.status).toBe(200);
    expect(grantEntitlement).not.toHaveBeenCalled();
  });
});
