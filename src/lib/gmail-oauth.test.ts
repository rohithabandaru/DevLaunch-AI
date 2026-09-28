import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import {
  buildGoogleAuthUrl,
  buildMailboxQuery,
  buildSyncReturnUrl,
  exchangeAuthorizationCode,
  extractPlainText,
  fetchGmailMessages,
  GMAIL_ERROR_MESSAGES,
  generateOAuthState,
  generatePkcePair,
  getGoogleOAuthConfig,
  gmailErrorStatus,
  GmailSyncError,
  mapWithConcurrency,
  statesMatch,
} from './gmail-oauth';

const CONFIG = {
  clientId: 'client-id.apps.googleusercontent.com',
  clientSecret: 'client-secret',
  redirectUri: 'https://app.example.com/api/email/gmail/callback',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Gmail encodes message bodies as base64url. */
function b64(text: string) {
  return Buffer.from(text, 'utf8').toString('base64url');
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.GOOGLE_OAUTH_CLIENT_ID = CONFIG.clientId;
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = CONFIG.clientSecret;
  delete process.env.GOOGLE_OAUTH_REDIRECT_URI;
  delete process.env.GMAIL_SYNC_QUERY;
  delete process.env.GMAIL_SYNC_DAYS;
  delete process.env.GMAIL_SYNC_MAX_MESSAGES;
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...ORIGINAL_ENV };
});

describe('getGoogleOAuthConfig', () => {
  it('returns null when the client id is missing', () => {
    delete process.env.GOOGLE_OAUTH_CLIENT_ID;
    expect(getGoogleOAuthConfig('https://app.example.com')).toBeNull();
  });

  it('is configured with a client id alone — PKCE needs no secret', () => {
    delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const config = getGoogleOAuthConfig('https://app.example.com');
    expect(config?.clientId).toBe(CONFIG.clientId);
    expect(config?.clientSecret).toBeNull();
  });

  it('derives the callback URL from the request origin', () => {
    expect(getGoogleOAuthConfig('https://app.example.com')?.redirectUri).toBe(
      `${CONFIG.redirectUri}`,
    );
    expect(getGoogleOAuthConfig('https://app.example.com/')?.redirectUri).toBe(CONFIG.redirectUri);
  });

  it('honours an explicit redirect URI override', () => {
    process.env.GOOGLE_OAUTH_REDIRECT_URI = 'https://other.example.com/cb';
    expect(getGoogleOAuthConfig('https://app.example.com')?.redirectUri).toBe(
      'https://other.example.com/cb',
    );
  });
});

describe('PKCE + state', () => {
  it('produces a verifier whose S256 challenge matches', () => {
    const { verifier, challenge } = generatePkcePair();
    expect(createHash('sha256').update(verifier).digest('base64url')).toBe(challenge);
    expect(verifier.length).toBeGreaterThanOrEqual(43);
  });

  it('produces unique verifiers', () => {
    expect(generatePkcePair().verifier).not.toBe(generatePkcePair().verifier);
  });

  it('generates unique state values', () => {
    expect(generateOAuthState()).not.toBe(generateOAuthState());
  });

  it('compares state in constant time', () => {
    const state = generateOAuthState();
    expect(statesMatch(state, state)).toBe(true);
    expect(statesMatch(state, generateOAuthState())).toBe(false);
    expect(statesMatch(state, '')).toBe(false);
    expect(statesMatch(state, null)).toBe(false);
    expect(statesMatch(undefined, state)).toBe(false);
    expect(statesMatch('abc', 'abcd')).toBe(false);
  });
});

describe('buildGoogleAuthUrl', () => {
  it('uses the authorization-code flow with PKCE — never the implicit flow', () => {
    const url = new URL(buildGoogleAuthUrl(CONFIG, 'state-123', 'challenge-456'));

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge')).toBe('challenge-456');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('state')).toBe('state-123');
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('scope')).toContain('gmail.readonly');
    // The secret must never travel to the browser.
    expect(url.search).not.toContain(CONFIG.clientSecret);
  });

  it('does not force consent on a silent reconnect', () => {
    const url = new URL(buildGoogleAuthUrl(CONFIG, 's', 'c'));
    expect(url.searchParams.get('prompt')).toBe('select_account');
  });

  it('forces consent when the caller has no stored refresh token', () => {
    const url = new URL(buildGoogleAuthUrl(CONFIG, 's', 'c', { forceConsent: true }));
    // Without `consent`, Google skips the screen for a user who already granted
    // access and returns no refresh_token, breaking the reconnect.
    expect(url.searchParams.get('prompt')).toBe('select_account consent');
  });

  it('works without a client secret', () => {
    const url = new URL(buildGoogleAuthUrl({ ...CONFIG, clientSecret: null }, 's', 'c'));
    expect(url.searchParams.get('client_id')).toBe(CONFIG.clientId);
  });
});

describe('exchangeAuthorizationCode', () => {
  it('omits client_secret entirely for a public PKCE client', async () => {
    let body = '';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        body = String(init.body);
        return jsonResponse({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 });
      }),
    );

    await exchangeAuthorizationCode({ ...CONFIG, clientSecret: null }, 'code-1', 'verifier-1');

    const params = new URLSearchParams(body);
    expect(params.get('client_id')).toBe(CONFIG.clientId);
    expect(params.has('client_secret')).toBe(false);
    expect(params.get('code_verifier')).toBe('verifier-1');
  });

  it('still sends client_secret when one is configured', async () => {
    let body = '';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        body = String(init.body);
        return jsonResponse({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 });
      }),
    );

    await exchangeAuthorizationCode(CONFIG, 'code-1', 'verifier-1');

    expect(new URLSearchParams(body).get('client_secret')).toBe(CONFIG.clientSecret);
  });
});

describe('buildSyncReturnUrl', () => {
  it('builds a same-origin return path with the status', () => {
    expect(buildSyncReturnUrl('https://app.example.com', 'connected')).toBe(
      'https://app.example.com/dashboard/jobs?email_sync=connected',
    );
  });
});

describe('exchangeAuthorizationCode', () => {
  it('sends the code, PKCE verifier and secret, and maps the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ access_token: 'ya29.access', refresh_token: '1//refresh', expires_in: 3600, scope: 'gmail.readonly' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const token = await exchangeAuthorizationCode(CONFIG, 'auth-code', 'verifier-123');

    expect(token.accessToken).toBe('ya29.access');
    expect(token.refreshToken).toBe('1//refresh');
    expect(token.expiresAt).toBeInstanceOf(Date);

    const body = new URLSearchParams(String(fetchMock.mock.calls[0][1].body));
    expect(body.get('code')).toBe('auth-code');
    expect(body.get('code_verifier')).toBe('verifier-123');
    expect(body.get('grant_type')).toBe('authorization_code');
  });

  it('surfaces invalid_grant as a revocation, not a generic failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'invalid_grant' }, 400)));

    await expect(exchangeAuthorizationCode(CONFIG, 'code', 'verifier')).rejects.toMatchObject({
      code: 'revoked',
    });
  });

  it('surfaces invalid_client as a configuration problem', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'invalid_client' }, 401)));

    await expect(exchangeAuthorizationCode(CONFIG, 'code', 'verifier')).rejects.toMatchObject({
      code: 'not_configured',
    });
  });

  it('fails when Google returns no access token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ token_type: 'Bearer' })));

    await expect(exchangeAuthorizationCode(CONFIG, 'code', 'verifier')).rejects.toBeInstanceOf(
      GmailSyncError,
    );
  });
});

describe('extractPlainText', () => {
  it('decodes a text/plain body', () => {
    const payload = { mimeType: 'text/plain', body: { data: b64('We would like to invite you to interview.') } };
    expect(extractPlainText(payload, 'fallback snippet')).toBe('We would like to invite you to interview.');
  });

  it('walks a multipart tree', () => {
    const payload = {
      mimeType: 'multipart/alternative',
      parts: [
        { mimeType: 'text/plain', body: { data: b64('Plain body') } },
        { mimeType: 'text/html', body: { data: b64('<p>HTML <b>body</b></p>') } },
      ],
    };
    expect(extractPlainText(payload, '')).toContain('Plain body');
    expect(extractPlainText(payload, '')).toContain('HTML body');
  });

  it('strips HTML markup, scripts and entities', () => {
    const payload = {
      mimeType: 'text/html',
      body: {
        data: b64('<html><head><style>p{color:red}</style></head><body><script>alert(1)</script><p>Offer &amp; onboarding</p></body></html>'),
      },
    };
    const text = extractPlainText(payload, '');
    expect(text).toContain('Offer & onboarding');
    expect(text).not.toContain('alert(1)');
    expect(text).not.toContain('<p>');
    expect(text).not.toContain('color:red');
  });

  it('falls back to the snippet when there is no readable body', () => {
    expect(extractPlainText(undefined, 'snippet text')).toBe('snippet text');
    expect(extractPlainText({ mimeType: 'text/plain', body: {} }, 'snippet text')).toBe('snippet text');
  });

  it('truncates very long bodies', () => {
    const payload = { mimeType: 'text/plain', body: { data: b64('x'.repeat(9000)) } };
    const text = extractPlainText(payload, '');
    expect(text.length).toBeLessThan(4200);
    expect(text).toContain('truncated');
  });
});

describe('buildMailboxQuery', () => {
  it('targets recent inbox mail and excludes bulk categories', () => {
    const query = buildMailboxQuery(30);
    expect(query).toContain('in:inbox');
    expect(query).toContain('newer_than:30d');
    expect(query).toContain('-category:promotions');
  });

  it('honours an override', () => {
    process.env.GMAIL_SYNC_QUERY = 'label:jobs';
    expect(buildMailboxQuery(30)).toBe('label:jobs');
  });
});

describe('mapWithConcurrency', () => {
  it('preserves order and runs every item', async () => {
    const items = [5, 1, 4, 2, 3];
    const result = await mapWithConcurrency(items, 2, async (n) => {
      await new Promise((r) => setTimeout(r, n));
      return n * 10;
    });
    expect(result).toEqual([50, 10, 40, 20, 30]);
  });

  it('never exceeds the concurrency limit', async () => {
    let inFlight = 0;
    let peak = 0;
    await mapWithConcurrency(Array.from({ length: 20 }, (_, i) => i), 4, async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 1));
      inFlight -= 1;
    });
    expect(peak).toBeLessThanOrEqual(4);
  });

  it('handles an empty list', async () => {
    expect(await mapWithConcurrency([], 4, async () => 1)).toEqual([]);
  });
});

describe('fetchGmailMessages', () => {
  function stubGmail(handlers: {
    list?: () => Promise<Response>;
    message?: (id: string) => Promise<Response>;
  }) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const idMatch = url.match(/\/messages\/([^?]+)\?/);
      if (idMatch) {
        return handlers.message ? handlers.message(idMatch[1]) : new Response('{}', { status: 404 });
      }
      return handlers.list ? handlers.list() : jsonResponse({ messages: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('returns [] for an empty mailbox', async () => {
    stubGmail({ list: async () => jsonResponse({ messages: [] }) });
    expect(await fetchGmailMessages('token')).toEqual([]);
  });

  it('normalises headers, dates and bodies', async () => {
    stubGmail({
      list: async () => jsonResponse({ messages: [{ id: 'm1' }] }),
      message: async () =>
        jsonResponse({
          id: 'm1',
          snippet: 'snippet',
          internalDate: '1700000000000',
          payload: {
            mimeType: 'text/plain',
            headers: [
              { name: 'From', value: '"Jane Recruiter" <jane@acme.com>' },
              { name: 'Subject', value: 'Interview Invitation' },
              { name: 'Date', value: 'Tue, 14 Nov 2023 22:13:20 GMT' },
            ],
            body: { data: b64('Come in for a technical screen.') },
          },
        }),
    });

    const [message] = await fetchGmailMessages('token');
    expect(message.id).toBe('m1');
    expect(message.sender).toBe('jane@acme.com');
    expect(message.subject).toBe('Interview Invitation');
    expect(message.date).toBe(new Date(1700000000000).toISOString());
    expect(message.body).toBe('Come in for a technical screen.');
  });

  it('skips individual unreadable messages but keeps the rest', async () => {
    stubGmail({
      list: async () => jsonResponse({ messages: [{ id: 'ok' }, { id: 'bad' }] }),
      message: async (id) => {
        if (id === 'bad') return new Response('nope', { status: 500 });
        return jsonResponse({
          snippet: 's',
          internalDate: '1700000000000',
          payload: { mimeType: 'text/plain', headers: [], body: { data: b64('body') } },
        });
      },
    });

    const messages = await fetchGmailMessages('token');
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe('ok');
  });

  it('aborts the sync when the token itself is dead', async () => {
    stubGmail({
      list: async () => jsonResponse({ messages: [{ id: 'm1' }] }),
      message: async () => jsonResponse({ error: 'invalid' }, 401),
    });

    await expect(fetchGmailMessages('token')).rejects.toMatchObject({ code: 'token_expired' });
  });

  it('maps a 401 on the list call to token_expired', async () => {
    stubGmail({ list: async () => new Response('unauthorized', { status: 401 }) });
    await expect(fetchGmailMessages('token')).rejects.toMatchObject({ code: 'token_expired' });
  });

  it('detects a disabled Gmail API', async () => {
    stubGmail({
      list: async () =>
        new Response('SERVICE_DISABLED: the Gmail API is not enabled for your project', { status: 403 }),
    });
    await expect(fetchGmailMessages('token')).rejects.toMatchObject({ code: 'api_disabled' });
  });

  it('detects a revoked scope', async () => {
    stubGmail({
      list: async () => new Response('ACCESS_TOKEN_SCOPE_INSUFFICIENT', { status: 403 }),
    });
    await expect(fetchGmailMessages('token')).rejects.toMatchObject({ code: 'insufficient_scope' });
  });

  it('maps 429 to rate_limited and 5xx to upstream', async () => {
    stubGmail({ list: async () => new Response('slow down', { status: 429 }) });
    await expect(fetchGmailMessages('token')).rejects.toMatchObject({ code: 'rate_limited' });

    stubGmail({ list: async () => new Response('boom', { status: 503 }) });
    await expect(fetchGmailMessages('token')).rejects.toMatchObject({ code: 'upstream' });
  });

  it('respects the message cap', async () => {
    process.env.GMAIL_SYNC_MAX_MESSAGES = '2';
    const requested: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (/\/messages\//.test(url)) {
          const id = url.match(/\/messages\/([^?]+)\?/)?.[1] || '';
          requested.push(id);
          return jsonResponse({ internalDate: '1', payload: { headers: [] } });
        }
        expect(url).toContain('maxResults=2');
        return jsonResponse({ messages: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });
      }),
    );

    const messages = await fetchGmailMessages('token');
    expect(messages).toHaveLength(2);
    expect(requested).toEqual(['a', 'b']);
  });

  it('never returns fabricated data when the upstream fails', async () => {
    stubGmail({ list: async () => new Response('boom', { status: 500 }) });
    await expect(fetchGmailMessages('token')).rejects.toBeInstanceOf(GmailSyncError);
  });
});

describe('gmailErrorStatus', () => {
  it('maps every error code to a sensible status', () => {
    expect(gmailErrorStatus('not_configured')).toBe(503);
    expect(gmailErrorStatus('not_connected')).toBe(409);
    expect(gmailErrorStatus('token_expired')).toBe(401);
    expect(gmailErrorStatus('revoked')).toBe(401);
    expect(gmailErrorStatus('insufficient_scope')).toBe(401);
    expect(gmailErrorStatus('rate_limited')).toBe(429);
    expect(gmailErrorStatus('upstream')).toBe(502);
  });

  it('has a user-safe message for every code', () => {
    for (const [code, message] of Object.entries(GMAIL_ERROR_MESSAGES)) {
      expect(message.length).toBeGreaterThan(10);
      // No stack traces or generic error objects leak to the client.
      expect(message).not.toMatch(/\n|at .*\.ts:\d+/);
      expect(message).not.toContain('Error');
      expect(message.endsWith('.')).toBe(true);
      expect(GMAIL_ERROR_MESSAGES[code as keyof typeof GMAIL_ERROR_MESSAGES]).toBe(message);
    }
  });
});
