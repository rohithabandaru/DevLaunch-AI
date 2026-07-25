
/**
 * Environment helpers for Supabase, OpenAI, and Stripe.
 * Demo mode is allowed only when Supabase is not configured AND not forced off.
 */

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return (
    !!url &&
    !!key &&
    (url.startsWith("http://") || url.startsWith("https://")) &&
    url !== "https://your-project-id.supabase.co" &&
    key !== "your-anon-key-here" &&
    !url.includes("dummy.supabase")
  );
}

/** Local sandbox without real Supabase. Disabled in production builds. */
export function isDemoMode(): boolean {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_MODE !== "true") {
    return false;
  }
  return !isSupabaseConfigured();
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const DEMO_SESSION_COOKIE = "devlaunch_demo_session";
export const FREE_JOB_LIMIT = 50;
export const FREE_AI_DAILY_LIMIT = 5;
export const PRO_AI_DAILY_LIMIT = 200;
