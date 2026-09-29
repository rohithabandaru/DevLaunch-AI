-- DEVLAUNCH AI — SUBSCRIPTIONS MIGRATION
-- Server-side, payment-verified entitlement records.
--
-- Why this exists: pricing previously granted access entirely in the browser.
-- `activateSubscription()` in `src/lib/subscription-storage.ts` was called from
-- the Razorpay checkout success callback, wrote the tier to localStorage, and
-- `subscription-gate.tsx` + `plan-limits.ts` read that localStorage value as
-- the authority on what the user had paid for.
--
-- That is not an authorization boundary. Anyone could call
-- `activateSubscription('ENTERPRISE', ...)` from devtools, or edit one
-- localStorage key, and receive unlimited access. Nothing on the server knew
-- whether a payment had happened at all.
--
-- This table makes the server the source of truth:
--   * A row is only ever written by server code, and only after a Razorpay
--     signature has been verified (see `src/lib/razorpay-signature.ts`).
--   * RLS is enabled with NO policies. There is deliberately no INSERT, UPDATE
--     or client-readable SELECT, so an authenticated browser client can neither
--     read this table nor grant itself a tier. `/api/subscription` reads it
--     through the service role and returns only the caller's own row.
--   * `subscription_events` is the append-only ledger powering the billing
--     page's invoice list.
--
-- Run via the Supabase SQL Editor (postgres role) or `supabase db push`.

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'FREE'
        CHECK (tier IN ('FREE', 'PRO', 'ENTERPRISE')),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    plan_id TEXT NOT NULL DEFAULT 'free',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly'
        CHECK (billing_cycle IN ('monthly', 'annual')),
    -- Minor units (paise) actually paid, copied from the verified Razorpay
    -- order, not from anything the client sent.
    amount_paid_minor BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT '2099-12-31 23:59:59+00',
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    payment_provider TEXT NOT NULL DEFAULT 'razorpay',
    -- Provider-side identifiers, for reconciliation against webhooks.
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    -- Set when a refund is processed, which revokes the entitlement.
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- One subscription per user; the verified payment updates it in place.
    UNIQUE (user_id)
);

-- Prevents double-granting the same payment if the success callback and the
-- payment.captured webhook both fire (they always both do).
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_razorpay_payment
    ON public.subscriptions (razorpay_payment_id)
    WHERE razorpay_payment_id IS NOT NULL;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Deliberately NO policies. Unlike email_connections there is not even an
-- owner SELECT: the tier itself is the thing being protected, and a readable
-- table is one refactor away from a writable one. Every read and write goes
-- through the service role in `src/lib/subscriptions.ts`.

CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL
        CHECK (event_type IN ('activated', 'renewed', 'canceled', 'payment_failed', 'refunded')),
    tier TEXT NOT NULL
        CHECK (tier IN ('FREE', 'PRO', 'ENTERPRISE')),
    billing_cycle TEXT,
    amount_paid_minor BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    -- Raw provider event, kept for disputes. Payment ids are not secrets, but
    -- the payload is only ever read server-side.
    provider_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Append-only ledger, service role only. No policies by design.

CREATE INDEX IF NOT EXISTS idx_subscriptions_user
    ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user
    ON public.subscription_events (user_id, created_at DESC);

-- Auto-touch updated_at.
CREATE OR REPLACE FUNCTION public.touch_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.touch_subscriptions_updated_at();
