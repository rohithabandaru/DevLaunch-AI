import { NextResponse } from 'next/server';
import { createExtensionSessionToken, getSessionUser, EXTENSION_TOKEN_TTL_SECONDS } from '@/lib/auth-server';
import { jsonError } from '@/lib/http';

/**
 * Mints a short-lived, single-use extension session token bound to the
 * authenticated user. Called from the same-origin "/extension/connect" flow.
 * The raw token is returned once; the extension then presents it via the
 * Authorization header on the clip API.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  const token = await createExtensionSessionToken(user.id);
  if (!token) {
    return jsonError(503, 'Extension authentication is not configured on the server.');
  }

  return NextResponse.json({
    token,
    expiresInSeconds: EXTENSION_TOKEN_TTL_SECONDS,
  });
}