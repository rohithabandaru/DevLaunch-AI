-- DEVLAUNCH AI — EMAIL SYNC CONNECTIONS MIGRATION
-- Server-side, encrypted-at-rest storage for mailbox OAuth tokens.
--
-- Why this exists: the job tracker's "AI Email Sync Engine" previously kept a raw
-- Gmail access token in localStorage/sessionStorage and called the Gmail REST API
-- straight from the browser. That token is a live credential for the user's inbox
-- (gmail.readonly), it was never encrypted, and the implicit flow
-- (`response_type=token`) it used has been deprecated by Google.
--
-- This table fixes the storage half of that:
--   * Tokens are only ever written by server code using the service role key.
--   * Tokens are AES-256-GCM encrypted before they are written (see
--     `src/lib/email-token-crypto.ts`); the key lives in EMAIL_ENCRYPTION_KEY.
--   * RLS grants the owner SELECT and DELETE only. There is deliberately no
--     INSERT/UPDATE policy, so an authenticated browser client can neither read
--     the ciphertext out of the table nor mint itself a connection.
--
-- Run via the Supabase SQL Editor (postgres role) or `supabase db push`.

CREATE TABLE IF NOT EXISTS public.email_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
    -- The Gmail address the token belongs to (from Google userinfo).
    mailbox_email TEXT NOT NULL,
    -- AES-256-GCM envelopes produced by src/lib/email-token-crypto.ts.
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    -- Google's access tokens are short lived (~1h); a null value means
    -- "treat as expired and use the refresh token".
    token_expires_at TIMESTAMPTZ,
    scopes TEXT,
    auto_sync BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'connected'
        CHECK (status IN ('connected', 'error', 'disconnected')),
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- One live connection per provider per user; re-connecting updates in place.
    UNIQUE (user_id, provider)
);

ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;

-- Deliberately NO owner SELECT policy. The ciphertext columns are credentials,
-- and nothing in the app ever queries this table with a user-scoped client —
-- /api/email/connections reads it through the service role and projects the
-- token columns away. With no SELECT, INSERT or UPDATE policy, an authenticated
-- browser client can neither read the table nor create/tamper with a connection.
-- Owners can still remove their own row (disconnect).

-- Owners may delete their own connection (disconnect).
CREATE POLICY "email_connections owner delete"
    ON public.email_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Token minting, refreshing, re-encrypting and status updates happen server-side
-- through the service role only.

CREATE INDEX IF NOT EXISTS idx_email_connections_user
    ON public.email_connections (user_id);

-- Auto-touch updated_at.
CREATE OR REPLACE FUNCTION public.touch_email_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_connections_updated_at ON public.email_connections;
CREATE TRIGGER email_connections_updated_at
    BEFORE UPDATE ON public.email_connections
    FOR EACH ROW EXECUTE FUNCTION public.touch_email_connections_updated_at();
