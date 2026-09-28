import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError } from '@/lib/http';
import { GMAIL_ERROR_MESSAGES, GmailSyncError, gmailErrorStatus } from '@/lib/gmail-oauth';
import { listEmailConnections } from '@/lib/email-connections';

/**
 * Lists the caller's mailbox connections (metadata only — never token
 * material). The job tracker treats this as the source of truth; nothing about
 * a connection is read from localStorage.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  try {
    const connections = await listEmailConnections(user.id);
    return NextResponse.json({ connections });
  } catch (error) {
    if (error instanceof GmailSyncError) {
      return jsonError(gmailErrorStatus(error.code), GMAIL_ERROR_MESSAGES[error.code]);
    }
    return jsonError(500, 'Could not load mailbox connections.');
  }
}
