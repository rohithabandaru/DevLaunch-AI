import { type NextRequest } from 'next/server';

const ipCache = new Map<string, { count: number; expires: number }>();

/**
 * Rate limit keyed by a server-provided identifier (authenticated user id).
 * Attacker-controlled forwarding headers are never used as the primary key, so
 * a client cannot bypass the limit simply by changing `x-forwarded-for`.
 */
export function checkRateLimit(identifier: string, limit: number, windowMs: number) {
  if (!identifier) return null;
  const now = Date.now();
  const record = ipCache.get(identifier);

  if (!record || now > record.expires) {
    ipCache.set(identifier, { count: 1, expires: now + windowMs });
    return null;
  }

  record.count += 1;
  if (record.count > limit) {
    return { status: 429 as const };
  }

  return null;
}

/**
 * Backwards-compatible IP-based limiter. Only used as a secondary safeguard for
 * requests where no authenticated identity exists; the trusted identifier-based
 * limiter is preferred for authenticated endpoints.
 */
export function rateLimit(req: NextRequest, limit = 60, windowMs = 60 * 1000) {
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const record = ipCache.get(ip);

  if (!record || now > record.expires) {
    ipCache.set(ip, { count: 1, expires: now + windowMs });
    return null;
  }

  record.count += 1;
  if (record.count > limit) {
    return { status: 429 as const };
  }

  return null;
}