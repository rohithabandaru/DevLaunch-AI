import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import {
  buildSyncReturnUrl,
  exchangeAuthorizationCode,
  fetchGoogleUserProfile,
  getGoogleOAuthConfig,
  GmailSyncError,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  statesMatch,
} from '@/lib/gmail-oauth';
import { upsertEmailConnection } from '@/lib/email-connections';

/**
 * OAuth callback: verifies CSRF state, exchanges the authorization code for
 * tokens on the server, and stores them AES-256-GCM encrypted. The plaintext
 * tokens are never returned to the browser.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const redirectWith = (status: string) => {
    const response = NextResponse.redirect(buildSyncReturnUrl(origin, status));
    clearOauthCookies(response);
    return response;
  };

  const user = await getSessionUser();
  if (!user) {
    return redirectWith('unauthenticated');
  }

  // Google reports user-denied consent (and other refusals) via ?error=.
  const providerError = request.nextUrl.searchParams.get('error');
  if (providerError) {
    return redirectWith(providerError === 'access_denied' ? 'denied' : 'provider_error');
  }

  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const receivedState = request.nextUrl.searchParams.get('state');
  if (!statesMatch(expectedState, receivedState)) {
    return redirectWith('invalid_state');
  }

  const codeVerifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
  if (!codeVerifier) {
    return redirectWith('invalid_state');
  }

  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return redirectWith('missing_code');
  }

  const config = getGoogleOAuthConfig(origin);
  if (!config) {
    return redirectWith('not_configured');
  }

  try {
    const token = await exchangeAuthorizationCode(config, code, codeVerifier);

    const profile = await fetchGoogleUserProfile(token.accessToken);
    if (!profile) {
      return redirectWith('profile_unavailable');
    }

    // A missing refresh_token is NOT fatal here: upsertEmailConnection reuses
    // the one already stored for this (user, provider) and only throws when
    // there is genuinely nothing to refresh with.
    const saved = await upsertEmailConnection({
      userId: user.id,
      provider: 'gmail',
      mailboxEmail: profile.email,
      token,
    });
    if (!saved) {
      return redirectWith('storage_unavailable');
    }

    return redirectWith('connected');
  } catch (error) {
    if (error instanceof GmailSyncError && error.code === 'revoked') {
      return redirectWith('missing_refresh_token');
    }
    return redirectWith('exchange_failed');
  }
}

function clearOauthCookies(response: NextResponse) {
  for (const name of [OAUTH_STATE_COOKIE, OAUTH_VERIFIER_COOKIE]) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
}
