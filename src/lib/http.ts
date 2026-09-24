import { NextResponse } from 'next/server';

export const MAX_BODY_BYTES = 64 * 1024;

/** Generic, safe JSON error. Never exposes internal parser/runtime details. */
export function jsonError(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export interface ParsedBody<T> {
  ok: true;
  data: T;
}

export interface BodyParseFailure {
  ok: false;
  status: 400 | 413;
  message: string;
}

/**
 * Reads and parses a JSON request body without leaking parser internals.
 * - Missing/empty bodies -> 400 (generic)
 * - Malformed JSON -> 400 (generic, no parser message)
 * - Oversized bodies -> 413
 * - Non-object JSON -> 400
 */
export async function readJsonBody(raw: string): Promise<ParsedBody<unknown> | BodyParseFailure> {
  if (raw.length === 0) {
    return { ok: false, status: 400, message: 'A JSON request body is required.' };
  }
  const byteLength = Buffer.byteLength(raw, 'utf8');
  if (byteLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, message: 'Request body is too large.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, message: 'Invalid JSON request body.' };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, status: 400, message: 'Invalid JSON request body.' };
  }
  return { ok: true, data: parsed };
}

const EXTENSION_SCHEME = 'chrome-extension://';

/**
 * Determines whether a browser origin is permitted to call extension API routes
 * cross-origin. Only `chrome-extension://` origins are considered.
 *
 * - Development environments allow any extension origin (extension IDs are
 *   ephemeral while unpacked).
 * - Production only allows explicitly configured extension origin(s) via the
 *   `ALLOWED_EXTENSION_ORIGINS` environment variable (comma separated), or `*`
 *   to allow any extension origin. Unconfigured production fails CLOSED.
 */
export function isAllowedExtensionOrigin(origin: string | null): boolean {
  if (!origin || !origin.startsWith(EXTENSION_SCHEME)) return false;
  if (process.env.NODE_ENV === 'development') return true;
  const configured = (process.env.ALLOWED_EXTENSION_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (configured.includes('*')) return true;
  return configured.includes(origin);
}

export function applyCorsHeaders(response: NextResponse, request: Request): NextResponse {
  const origin = request.headers.get('origin');
  if (origin && isAllowedExtensionOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  return response;
}

/**
 * Handles OPTIONS preflight for extension origins. Returns a 204 response for
 * allowed origins, or null when the request is not an OPTIONS preflight.
 */
export function handlePreflight(request: Request): NextResponse | null {
  if (request.method !== 'OPTIONS') return null;
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  if (isAllowedExtensionOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin as string);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '600');
  }
  return response;
}