/**
 * Razorpay credential resolution.
 *
 * Centralised so every payment route fails the same way. Placeholder values
 * (the `...` templates shipped in `.env.example`) are treated as
 * unconfigured — a placeholder that reaches the Razorpay SDK produces a
 * confusing 500 from the provider rather than a clear local error.
 */

export interface RazorpayCredentials {
  key_id: string;
  key_secret: string;
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  return trimmed.length < 8 || trimmed.includes('...') || trimmed.includes('your_');
}

/** Public key id, safe to send to the browser. Null when unconfigured. */
export function getRazorpayKeyId(): string | null {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  return isPlaceholder(keyId) ? null : (keyId as string);
}

/** Full credentials for server-side API calls, or null when unconfigured. */
export function getRazorpayCredentials(): RazorpayCredentials | null {
  const keyId = getRazorpayKeyId();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || isPlaceholder(keySecret)) return null;
  return { key_id: keyId, key_secret: keySecret as string };
}

/** Webhook signing secret. Null when unconfigured, which must fail closed. */
export function getRazorpayWebhookSecret(): string | null {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  return isPlaceholder(secret) ? null : (secret as string);
}
