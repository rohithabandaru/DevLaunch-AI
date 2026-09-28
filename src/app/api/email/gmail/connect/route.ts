import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { hasStoredRefreshToken } from '@/lib/email-connections';
import {
  buildGoogleAuthUrl,
  buildSyncReturnUrl,
  generateOAuthState,
  generatePkcePair,
  getGoogleOAuthConfig,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  oauthCookieOptions,
} from '@/lib/gmail-oauth';

/**
 * Starts the Gmail authorization-code + PKCE flow.
 *
 * Replaces the old `response_type=token` implicit flow, which Google has
 * deprecated. The client secret and the resulting tokens stay on the server:
 * the browser only ever sees a redirect to Google and a redirect back.
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
  }

  const config = getGoogleOAuthConfig(request.nextUrl.origin);
  if (!config) {
    return NextResponse.redirect(buildSyncReturnUrl(request.nextUrl.origin, 'not_configured'));
  }

  const state = generateOAuthState();
  const { verifier, challenge } = generatePkcePair();

  // Only nag for consent when we have nothing to fall back on. With a refresh
  // token already stored, the silent `select_account` picker is enough and the
  // existing token is reused (see upsertEmailConnection).
  const forceConsent = !(await hasStoredRefreshToken(user.id, 'gmail'));

  const response = NextResponse.redirect(buildGoogleAuthUrl(config, state, challenge, { forceConsent }));
  const cookieOptions = oauthCookieOptions();
  response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, {
    ...cookieOptions,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
