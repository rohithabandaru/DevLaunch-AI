import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError } from '@/lib/http';
import { fetchGmailMessages, GMAIL_ERROR_MESSAGES, GmailSyncError, gmailErrorStatus } from '@/lib/gmail-oauth';
import { getEmailConnectionRowByProvider, getFreshAccessToken, markConnectionSynced, setConnectionStatus } from '@/lib/email-connections';

/** Upper bound on messages returned to the browser in one sync. */
const MAX_MESSAGES_PER_SYNC = 50;

/**
 * Reads recent job-related mail for the connected mailbox and returns it to the
 * client for AI extraction.
 *
 * The access token is decrypted and used entirely server-side. Any upstream
 * failure is reported as a real error — this route never fabricates messages,
 * which is what previously let the UI silently create fake OpenAI/Figma/Stripe
 * applications when a sync failed.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  let connection;
  try {
    connection = await getEmailConnectionRowByProvider(user.id, 'gmail');
  } catch (error) {
    return handleSyncError(error);
  }

  if (!connection) {
    return jsonError(409, GMAIL_ERROR_MESSAGES.not_connected);
  }

  let accessToken: string;
  try {
    accessToken = await getFreshAccessToken(connection, request.nextUrl.origin);
  } catch (error) {
    return handleSyncError(error);
  }

  let messages;
  try {
    messages = await fetchGmailMessages(accessToken, { maxMessages: MAX_MESSAGES_PER_SYNC });
  } catch (error) {
    // Record the failure so the UI can show the connection as degraded, then
    // report it. Swallowing this is exactly what produced fake jobs before.
    if (error instanceof GmailSyncError && (error.code === 'token_expired' || error.code === 'revoked' || error.code === 'insufficient_scope')) {
      await setConnectionStatus(connection.id, 'error');
    }
    return handleSyncError(error);
  }

  try {
    await markConnectionSynced(connection.id);
  } catch {
    // A bookkeeping failure must not invalidate a successful read.
  }

  return NextResponse.json({
    messages,
    mailboxEmail: connection.mailbox_email,
    scannedAt: new Date().toISOString(),
  });
}

function handleSyncError(error: unknown) {
  if (error instanceof GmailSyncError) {
    return jsonError(gmailErrorStatus(error.code), GMAIL_ERROR_MESSAGES[error.code]);
  }
  return jsonError(500, 'Could not sync the mailbox.');
}
