import { type NextRequest, NextResponse } from 'next/server';

const ipCache = new Map<string, { count: number; expires: number }>();

export function rateLimit(req: NextRequest, limit = 60, windowMs = 60 * 1000) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();
  const record = ipCache.get(ip);

  if (!record || now > record.expires) {
    ipCache.set(ip, { count: 1, expires: now + windowMs });
    return null;
  }

  record.count += 1;
  if (record.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  return null;
}
