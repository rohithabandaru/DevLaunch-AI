-- DEVLAUNCH AI — SECURITY HARDENING MIGRATION
-- 1. Authoritative application role (V-2): server-controlled, never client-selected.
-- 2. Short-lived single-use extension session tokens (V-4 / V-5).
--
-- Run via the Supabase SQL Editor (postgres role) or `supabase db push`.
-- Promotion of a user to 'admin' is done ONLY by an operator/administrator, e.g.:
--
--   INSERT INTO public.user_roles (user_id, role) VALUES ('<auth-user-uuid>', 'admin')
--   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
--
-- Users can NEVER grant themselves a role through the API: the only RLS policy on
-- user_roles allows owners to read their own role. There is no INSERT/UPDATE/DELETE
-- policy, so `auth.uid()` clients cannot create or modify role rows.

-- ---------------------------------------------------------------------------
-- USER ROLES (authoritative authorization source)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Owners may read their own role. No other policy exists, so API clients cannot
-- INSERT (self-promotion), UPDATE, or DELETE role rows.
CREATE POLICY "user_roles owner select"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- EXTENSION SESSIONS (short-lived, single-use tokens for the Chrome extension)
-- ---------------------------------------------------------------------------
-- Tokens are generated server-side, stored only as a SHA-256 hash, bound to the
-- authenticated user, expire after 10 minutes and can be redeemed exactly once.
CREATE TABLE IF NOT EXISTS public.extension_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.extension_sessions ENABLE ROW LEVEL SECURITY;

-- Owners may view their own token metadata (hashes only, not usable secrets).
CREATE POLICY "extension_sessions owner select"
    ON public.extension_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Owners may delete their own token records (cleanup).
CREATE POLICY "extension_sessions owner delete"
    ON public.extension_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Token minting / redemption happens server-side through the service role only.
-- No INSERT/UPDATE policy is granted to API clients.

CREATE INDEX IF NOT EXISTS idx_extension_sessions_token_hash
    ON public.extension_sessions (token_hash);

CREATE INDEX IF NOT EXISTS idx_extension_sessions_user
    ON public.extension_sessions (user_id);

-- ---------------------------------------------------------------------------
-- SIGNUP TRIGGER: seed authoritative role row for every new user
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, target_role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'Full Stack Developer')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();