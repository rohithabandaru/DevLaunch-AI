/**
 * Compatibility exports for browser code.
 * Prefer `@/lib/supabase/client` and `@/lib/supabase/server` for new code.
 */
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export { isSupabaseConfigured };
export { isDemoMode } from "@/lib/env";

/** Singleton-style browser client (null when Supabase is not configured). */
export const supabase = createBrowserClient();
