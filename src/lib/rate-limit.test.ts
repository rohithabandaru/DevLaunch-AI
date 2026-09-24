import { describe, it, expect } from 'vitest';
import { rateLimit, checkRateLimit } from './rate-limit';
import { NextRequest } from 'next/server';

describe('Server API Rate Limiting Utility', () => {
  it('allows requests under the rate limit', () => {
    const req = new NextRequest('https://devlaunch.ai/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    const res = rateLimit(req, 5, 60000);
    expect(res).toBeNull(); // Allowed
  });

  it('blocks requests exceeding the specified rate limit with 429 status', () => {
    const ip = '192.168.1.100';

    for (let i = 0; i < 3; i++) {
      const req = new NextRequest('https://devlaunch.ai/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      rateLimit(req, 3, 60000);
    }

    // 4th request should be blocked
    const blockedReq = new NextRequest('https://devlaunch.ai/api/test', {
      headers: { 'x-forwarded-for': ip },
    });
    const res = rateLimit(blockedReq, 3, 60000);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(429);
  });
});

describe('checkRateLimit (identifier-based, authenticated)', () => {
  it('allows the configured number of requests for an identifier', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('user:abc', 5, 60000)).toBeNull();
    }
  });

  it('blocks once the limit is exceeded', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('user:xyz', 3, 60000);
    }
    expect(checkRateLimit('user:xyz', 3, 60000)?.status).toBe(429);
  });

  it('keeps separate counters for different identifiers (unspoofable by headers)', () => {
    checkRateLimit('user:aaa', 1, 60000);
    expect(checkRateLimit('user:aaa', 1, 60000)?.status).toBe(429);
    expect(checkRateLimit('user:bbb', 1, 60000)).toBeNull();
  });
});