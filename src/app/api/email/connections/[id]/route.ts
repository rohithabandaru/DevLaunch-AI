import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError, readJsonBody } from '@/lib/http';
import { GMAIL_ERROR_MESSAGES, GmailSyncError, gmailErrorStatus } from '@/lib/gmail-oauth';
import {
  deleteEmailConnection,
  getEmailConnectionRow,
  setConnectionAutoSync,
  toClientConnection,
} from '@/lib/email-connections';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return jsonError(400, 'Invalid connection id.');
  }

  const body = await readJsonBody(await request.text());
  if (!body.ok) {
    return jsonError(body.status, body.message);
  }
  const autoSync = (body.data as { autoSync?: unknown }).autoSync;
  if (typeof autoSync !== 'boolean') {
    return jsonError(400, 'autoSync must be a boolean.');
  }

  try {
    const row = await getEmailConnectionRow(user.id, id);
    if (!row) {
      return jsonError(404, 'Connection not found.');
    }
    await setConnectionAutoSync(row.id, autoSync);
    return NextResponse.json({ connection: toClientConnection({ ...row, auto_sync: autoSync }) });
  } catch (error) {
    if (error instanceof GmailSyncError) {
      return jsonError(gmailErrorStatus(error.code), GMAIL_ERROR_MESSAGES[error.code]);
    }
    return jsonError(500, 'Could not update the mailbox connection.');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  const { id } = await params;
  if (!isUuid(id)) {
    return jsonError(400, 'Invalid connection id.');
  }

  try {
    const row = await getEmailConnectionRow(user.id, id);
    if (!row) {
      return jsonError(404, 'Connection not found.');
    }
    await deleteEmailConnection(row);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof GmailSyncError) {
      return jsonError(gmailErrorStatus(error.code), GMAIL_ERROR_MESSAGES[error.code]);
    }
    return jsonError(500, 'Could not disconnect the mailbox.');
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
