import { NextResponse } from 'next/server';
import {
  getSessionUser,
  getServerSupabase,
  getServiceRoleClient,
  redeemExtensionSessionToken,
} from '@/lib/auth-server';
import { checkRateLimit } from '@/lib/rate-limit';
import { applyCorsHeaders, handlePreflight, jsonError, readJsonBody, MAX_BODY_BYTES } from '@/lib/http';
import { clipJobSchema, CLIP_RATE_LIMIT, CLIP_RATE_WINDOW_MS } from '@/lib/extension-clip';

export async function OPTIONS(request: Request) {
  return handlePreflight(request) ?? new NextResponse(null, { status: 204 });
}

export async function POST(request: Request) {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  // Authenticated identity comes ONLY from the server-side session (cookie) or
  // from a redeemed single-use extension token. Client-supplied ids are ignored.
  const sessionUser = await getSessionUser();
  let authMethod: 'session' | 'token' | null = null;
  let userId: string | null = null;

  if (sessionUser) {
    userId = sessionUser.id;
    authMethod = 'session';
  } else {
    const authorization = request.headers.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length).trim();
      userId = await redeemExtensionSessionToken(token);
      if (userId) authMethod = 'token';
    }
  }

  if (!userId) {
    return applyCorsHeaders(jsonError(401, 'Authentication required.'), request);
  }

  const rateLimitResult = checkRateLimit(
    `clip:${authMethod === 'session' ? 'session' : 'token'}:${userId}`,
    CLIP_RATE_LIMIT,
    CLIP_RATE_WINDOW_MS
  );
  if (rateLimitResult) {
    return applyCorsHeaders(jsonError(429, 'Too many requests. Please try again later.'), request);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return applyCorsHeaders(jsonError(400, 'Invalid request body.'), request);
  }
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return applyCorsHeaders(jsonError(413, 'Request body is too large.'), request);
  }

  const parsedBody = await readJsonBody(rawBody);
  if (!parsedBody.ok) {
    return applyCorsHeaders(jsonError(parsedBody.status, parsedBody.message), request);
  }

  const parsed = clipJobSchema.safeParse(parsedBody.data);
  if (!parsed.success) {
    return applyCorsHeaders(
      jsonError(400, 'Invalid job data payload.'),
      request
    );
  }

  const job = parsed.data;
  const insertRow = {
    user_id: userId,
    company: job.company,
    role: job.title,
    location: job.location,
    location_type: job.workplaceType,
    job_link: job.url,
    salary: job.salary,
    status: 'Wishlist' as const,
    applied_date: new Date().toISOString().slice(0, 10),
    notes: JSON.stringify({ description: job.description, source: 'Chrome Extension' }),
  };

  try {
    if (authMethod === 'session') {
      // Cookie-based session: insert with the user's own RLS-authorized client.
      const supabase = await getServerSupabase();
      if (!supabase) {
        return applyCorsHeaders(jsonError(503, 'Clip service is not configured on the server.'), request);
      }
      const { data, error } = await supabase.from('jobs').insert(insertRow).select().single();
      if (error) {
         
        console.error('[extension/clip] insert failed:', error.message);
        return applyCorsHeaders(jsonError(500, 'Failed to save clip.'), request);
      }
      return applyCorsHeaders(
        NextResponse.json({ success: true, job: data }, { status: 201 }),
        request
      );
    }

    // Extension token path: insert elevated, since no browser session cookie is
    // sent from the extension origin. Requires the server-only service role key.
    const serviceRole = getServiceRoleClient();
    if (!serviceRole) {
      return applyCorsHeaders(jsonError(503, 'Extension clip service is not configured on the server.'), request);
    }
    const { data, error } = await serviceRole.from('jobs').insert(insertRow).select().single();
    if (error) {
       
      console.error('[extension/clip] insert failed (token path):', error.message);
      return applyCorsHeaders(jsonError(500, 'Failed to save clip.'), request);
    }
    return applyCorsHeaders(
      NextResponse.json({ success: true, job: data }, { status: 201 }),
      request
    );
  } catch (err) {
     
    console.error('[extension/clip] unexpected error:', err);
    return applyCorsHeaders(jsonError(500, 'Failed to save clip.'), request);
  }
}