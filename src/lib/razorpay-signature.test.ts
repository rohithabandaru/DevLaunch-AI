import { describe, it, expect } from 'vitest';
import {
  computeCheckoutSignature,
  computeWebhookSignature,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from './razorpay-signature';
import { resolvePlan, isPaidTier, isBillingCycle, periodEndFromNow } from './plans';

const KEY_SECRET = 'super_secret_key_that_is_not_placeholder';
const WEBHOOK_SECRET = 'another_secret_not_a_placeholder';

describe('razorpay checkout signature', () => {
  const orderId = 'order_ABC123';
  const paymentId = 'pay_XYZ789';
  const signature = computeCheckoutSignature(orderId, paymentId, KEY_SECRET);

  it('accepts a genuine signature', () => {
    expect(
      verifyCheckoutSignature({ orderId, paymentId, signature, keySecret: KEY_SECRET })
    ).toBe(true);
  });

  it('rejects a signature made with a different secret', () => {
    expect(
      verifyCheckoutSignature({ orderId, paymentId, signature, keySecret: 'attacker_secret_value' })
    ).toBe(false);
  });

  it('rejects a swapped payment id', () => {
    // The classic attack: pay once, replay the signature against a new payment.
    expect(
      verifyCheckoutSignature({
        orderId,
        paymentId: 'pay_ATTACKER',
        signature,
        keySecret: KEY_SECRET,
      })
    ).toBe(false);
  });

  it('rejects a swapped order id', () => {
    expect(
      verifyCheckoutSignature({
        orderId: 'order_ATTACKER',
        paymentId,
        signature,
        keySecret: KEY_SECRET,
      })
    ).toBe(false);
  });

  it('rejects a mangled signature of the same length', () => {
    const mangled = (signature[0] === 'a' ? 'b' : 'a') + signature.slice(1);
    expect(
      verifyCheckoutSignature({ orderId, paymentId, signature: mangled, keySecret: KEY_SECRET })
    ).toBe(false);
  });

  it('rejects empty, missing or non-string values', () => {
    expect(
      verifyCheckoutSignature({ orderId, paymentId, signature: '', keySecret: KEY_SECRET })
    ).toBe(false);
    expect(
      verifyCheckoutSignature({ orderId: '', paymentId, signature, keySecret: KEY_SECRET })
    ).toBe(false);
    expect(
      verifyCheckoutSignature({ orderId, paymentId, signature, keySecret: '' })
    ).toBe(false);
    expect(
      verifyCheckoutSignature({
        orderId,
        paymentId,
        signature,
        keySecret: undefined as unknown as string,
      })
    ).toBe(false);
  });

  it('does not throw on a length-mismatched signature', () => {
    // timingSafeEqual throws on length mismatch; a remote attacker controls
    // this length, so it must not be able to crash the route.
    expect(() =>
      verifyCheckoutSignature({ orderId, paymentId, signature: 'short', keySecret: KEY_SECRET })
    ).not.toThrow();
    expect(
      verifyCheckoutSignature({ orderId, paymentId, signature: 'short', keySecret: KEY_SECRET })
    ).toBe(false);
  });
});

describe('razorpay webhook signature', () => {
  const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_1' } } } });
  const signature = computeWebhookSignature(body, WEBHOOK_SECRET);

  it('accepts a genuine signature over the raw body', () => {
    expect(verifyWebhookSignature({ rawBody: body, signature, webhookSecret: WEBHOOK_SECRET })).toBe(true);
  });

  it('rejects a body that changed after signing', () => {
    const tampered = body.replace('pay_1', 'pay_2');
    expect(
      verifyWebhookSignature({ rawBody: tampered, signature, webhookSecret: WEBHOOK_SECRET })
    ).toBe(false);
  });

  it('rejects a missing signature', () => {
    expect(verifyWebhookSignature({ rawBody: body, signature: null, webhookSecret: WEBHOOK_SECRET })).toBe(
      false
    );
  });

  it('fails closed when the webhook secret is unconfigured', () => {
    // An empty secret must never accept a payload, or anyone can mint plans.
    expect(verifyWebhookSignature({ rawBody: body, signature, webhookSecret: '' })).toBe(false);
  });
});

describe('plan catalog', () => {
  it('prices from the catalog, not the caller', () => {
    expect(resolvePlan('PRO', 'monthly')?.amountMinor).toBe(29900);
    expect(resolvePlan('PRO', 'annual')?.amountMinor).toBe(238800);
    expect(resolvePlan('ENTERPRISE', 'monthly')?.amountMinor).toBe(69900);
    expect(resolvePlan('ENTERPRISE', 'annual')?.amountMinor).toBe(598800);
  });

  it('rejects unknown tiers and cycles', () => {
    expect(resolvePlan('FREE', 'monthly')).toBeNull();
    expect(resolvePlan('PRO', 'lifetime')).toBeNull();
    expect(resolvePlan('SUPER_ADMIN', 'monthly')).toBeNull();
    expect(resolvePlan(undefined, 'monthly')).toBeNull();
    expect(resolvePlan({ toString: () => 'PRO' }, 'monthly')).toBeNull();
  });

  it('returns the annual price for the full annual billing cycle', () => {
    const annual = resolvePlan('PRO', 'annual');
    expect(annual?.amountMinor).toBe(238800);
  });

  it('validates tier and cycle predicates', () => {
    expect(isPaidTier('PRO')).toBe(true);
    expect(isPaidTier('FREE')).toBe(false);
    expect(isBillingCycle('annual')).toBe(true);
    expect(isBillingCycle('yearly')).toBe(false);
  });

  it('extends the period by the catalog duration', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const monthly = periodEndFromNow('monthly', start);
    const annual = periodEndFromNow('annual', start);
    expect(monthly.getTime()).toBeGreaterThan(start.getTime());
    expect(annual.getTime()).toBeGreaterThan(monthly.getTime());
  });
});
