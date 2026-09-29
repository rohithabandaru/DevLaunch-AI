/**
 * Razorpay signature verification.
 *
 * Pure crypto with no I/O so it can be unit tested directly. Both checks are
 * constant-time: a `===` on an HMAC leaks timing information and, more
 * importantly, a non-constant-time comparison is the wrong default for
 * "attacker controls the value being compared".
 *
 * Checkout: Razorpay sends `razorpay_order_id` and `razorpay_payment_id` back
 * to the browser on success. The signature is
 *   HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 * and proves the pair was issued by Razorpay. The browser cannot forge it
 * without the key secret, which only lives server-side.
 *
 * Webhook: Razorpay signs the exact raw request body with the webhook secret
 * and sends it as `x-razorpay-signature`.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

function safeCompareHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length || a.length === 0) return false;
  // timingSafeEqual throws on length mismatch, and we must never feed it
  // attacker-controlled buffers of differing sizes.
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function computeCheckoutSignature(
  orderId: string,
  paymentId: string,
  keySecret: string
): string {
  return createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
}

export function computeWebhookSignature(rawBody: string, webhookSecret: string): string {
  return createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
}

export function verifyCheckoutSignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const { orderId, paymentId, signature, keySecret } = args;
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  return safeCompareHex(computeCheckoutSignature(orderId, paymentId, keySecret), signature);
}

export function verifyWebhookSignature(args: {
  rawBody: string;
  signature: string | null;
  webhookSecret: string;
}): boolean {
  const { rawBody, signature, webhookSecret } = args;
  // Fail closed: an unconfigured webhook secret must never accept a payload.
  if (!webhookSecret || !signature) return false;
  return safeCompareHex(computeWebhookSignature(rawBody, webhookSecret), signature);
}
