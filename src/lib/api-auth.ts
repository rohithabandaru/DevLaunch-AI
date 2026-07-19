import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DEMO_SESSION_COOKIE,
  FREE_AI_DAILY_LIMIT,
  isDemoMode,
  PRO_AI_DAILY_LIMIT,
} from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import type { AuthUser, UserTier } from "@/lib/types";

export type ApiAuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; response: NextResponse };

async function getDemoUser(): Promise<AuthUser | null> {
  if (!isDemoMode()) return null;
  const cookieStore = await cookies();
  const demo = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  if (!demo) return null;
  return {
    id: "demo-user",
    email: "demo@devlaunch.local",
    fullName: "Demo User",
    tier: "pro",
    isDemo: true,
  };
}

async function getSupabaseUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  let tier: UserTier = "free";
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.tier === "pro" || profile?.tier === "free") {
    tier = profile.tier;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    fullName:
      (profile?.full_name as string | null) ??
      (user.user_metadata?.full_name as string | undefined) ??
      null,
    tier,
    isDemo: false,
  };
}

/** Require a logged-in user (Supabase session or demo cookie). */
export async function requireApiUser(): Promise<ApiAuthResult> {
  const real = await getSupabaseUser();
  if (real) return { ok: true, user: real };

  const demo = await getDemoUser();
  if (demo) return { ok: true, user: demo };

  return {
    ok: false,
    response: NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    ),
  };
}

/** Require Pro tier (demo users are treated as Pro). */
export async function requireProUser(): Promise<ApiAuthResult> {
  const auth = await requireApiUser();
  if (!auth.ok) return auth;

  if (auth.user.tier !== "pro") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Pro subscription required",
          code: "PRO_REQUIRED",
        },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Auth + daily AI rate limit.
 * Free: FREE_AI_DAILY_LIMIT, Pro: PRO_AI_DAILY_LIMIT.
 */
export async function requireAiAccess(): Promise<ApiAuthResult> {
  const auth = await requireApiUser();
  if (!auth.ok) return auth;

  const limit =
    auth.user.tier === "pro" ? PRO_AI_DAILY_LIMIT : FREE_AI_DAILY_LIMIT;
  const dayKey = new Date().toISOString().slice(0, 10);
  const result = rateLimit(
    `ai:${auth.user.id}:${dayKey}`,
    limit,
    24 * 60 * 60 * 1000
  );

  if (!result.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Daily AI limit reached. Upgrade to Pro or try again tomorrow.",
          code: "RATE_LIMITED",
          resetAt: result.resetAt,
        },
        { status: 429 }
      ),
    };
  }

  return auth;
}

export function jsonError(message: string, status = 400, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status });
}
