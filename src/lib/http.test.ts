import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyCorsHeaders,
  handlePreflight,
  isAllowedExtensionOrigin,
  jsonError,
  MAX_BODY_BYTES,
  readJsonBody,
} from './http';
import { NextResponse } from 'next/server';

const EXT_ID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function makeRequest(url: string, init: { method?: string; headers?: Record<string, string> }) {
  return new Request(url, {
    method: init.method || 'GET',
    headers: init.headers || {},
  });
}

describe('readJsonBody', () => {
  it('parses valid JSON objects', async () => {
    const result = await readJsonBody('{"company":"Stripe","title":"Engineer"}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ company: 'Stripe', title: 'Engineer' });
    }
  });

  it('rejects empty bodies with 400', async () => {
    const result = await readJsonBody('');
    if (!result.ok) expect(result.status).toBe(400);
    expect(result.ok).toBe(false);
  });

  it('returns a generic 400 for malformed JSON (no leak of parser details)', async () => {
    const result = await readJsonBody('{"company": broken');
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.message.toLowerCase()).not.toContain('unexpected');
      expect(result.message.toLowerCase()).not.toContain('syntax');
    }
    expect(result.ok).toBe(false);
  });

  it('returns 413 for oversized bodies exceeding the limit', async () => {
    const big = `{"a":"${'x'.repeat(MAX_BODY_BYTES + 100)}"}`;
    const result = await readJsonBody(big);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(413);
  });

  it('rejects non-object JSON like arrays and scalars', async () => {
    const arr = await readJsonBody('[1,2,3]');
    expect(arr.ok).toBe(false);
    const scalar = await readJsonBody('"just-a-string"');
    expect(scalar.ok).toBe(false);
  });
});

describe('jsonError', () => {
  it('produces a NextResponse with the given status and JSON error', async () => {
    const res = jsonError(401, 'Authentication required.');
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Authentication required.');
  });
});

describe('Extension origin allowlist', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('rejects non-extension origins in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOWED_EXTENSION_ORIGINS', '');
    expect(isAllowedExtensionOrigin('https://evil.example')).toBe(false);
  });

  it('rejects unknown extension origins in production (fails closed)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOWED_EXTENSION_ORIGINS', '');
    expect(isAllowedExtensionOrigin(`chrome-extension://${EXT_ID}`)).toBe(false);
  });

  it('explicitly allows listed chrome-extension origins in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOWED_EXTENSION_ORIGINS', `chrome-extension://${EXT_ID}`);
    expect(isAllowedExtensionOrigin(`chrome-extension://${EXT_ID}`)).toBe(true);
    expect(isAllowedExtensionOrigin('chrome-extension://bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')).toBe(
      false
    );
  });

  it('supports a wildcard allowlist in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOWED_EXTENSION_ORIGINS', '*');
    expect(isAllowedExtensionOrigin(`chrome-extension://${EXT_ID}`)).toBe(true);
  });

  it('allows any extension origin in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isAllowedExtensionOrigin(`chrome-extension://${EXT_ID}`)).toBe(true);
  });
});

describe('CORS helpers', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('adds CORS headers for an allowed extension origin', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const res = applyCorsHeaders(
      NextResponse.json({ ok: true }),
      makeRequest('http://localhost:3000/api/extension/clip', {
        headers: { origin: `chrome-extension://${EXT_ID}` },
      })
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(`chrome-extension://${EXT_ID}`);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('omits CORS headers for disallowed origins', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOWED_EXTENSION_ORIGINS', '');
    const res = applyCorsHeaders(
      NextResponse.json({ ok: true }),
      makeRequest('http://localhost:3000/api/extension/clip', {
        headers: { origin: `chrome-extension://${EXT_ID}` },
      })
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('handlePreflight returns null for non-OPTIONS requests', () => {
    const req = makeRequest('http://localhost:3000/api/extension/clip', { method: 'POST' });
    expect(handlePreflight(req)).toBeNull();
  });

  it('handlePreflight responds 204 for an allowed OPTIONS request', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = makeRequest('http://localhost:3000/api/extension/clip', {
      method: 'OPTIONS',
      headers: {
        origin: `chrome-extension://${EXT_ID}`,
        'access-control-request-method': 'POST',
      },
    });
    const res = handlePreflight(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(204);
    expect(res!.headers.get('Access-Control-Allow-Origin')).toBe(`chrome-extension://${EXT_ID}`);
  });
});