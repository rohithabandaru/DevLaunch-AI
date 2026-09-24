import { NextResponse } from 'next/server';
import { getSessionIdentity } from '@/lib/auth-server';
import { jsonError } from '@/lib/http';

export async function GET() {
  const identity = await getSessionIdentity();
  if (!identity) {
    return jsonError(401, 'Authentication required.');
  }
  return NextResponse.json({
    user: {
      id: identity.id,
      email: identity.email,
      role: identity.role,
    },
  });
}