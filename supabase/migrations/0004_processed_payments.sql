-- DEVLAUNCH AI — PAYMENT IDEMPOTENCY LEDGER
--
-- Why this exists
-- ---------------
-- `grant_entitlement` used to decide "have I already applied this payment?" by
-- comparing the incoming payment id against `subscriptions.razorpay_payment_id`.
-- That column holds only the single most recent payment, because the grant
-- overwrites it. A replay of an *older* payment therefore found no match, fell
-- through, and extended the paid period again:
--
--   buy PRO annual (pay_1)      -> +365d, row remembers pay_1
--   upgrade to ENTERPRISE (pay_2) -> +30d,  row now remembers pay_2
--   Razorpay retries pay_1      -> dedup misses -> +30d, free
--
-- Razorpay retries a non-2xx for roughly 24 hours, and the dashboard can resend
-- any delivery by hand, so this was reachable in normal operation and not just
-- by an attacker.
--
-- The fix is to record processed payments in their own append-only table whose
-- primary key is the payment id. The claim is written BEFORE the entitlement is
-- mutated, so a duplicate delivery loses the insert race and becomes a no-op
-- instead of a second grant. The key is never updated, so unlike the column
-- above it remembers every payment, not just the newest one.
--
-- `subscription_events` cannot serve this purpose: a refund writes a `refunded`
-- row carrying the same payment id as the original `activated` row, so a unique
-- index there would block legitimate refunds. Claims and ledger entries are
-- different facts and live in different tables.
--
-- Run via the Supabase SQL Editor (postgres role) or `supabase db push`.
-- Must be applied BEFORE deploying the code that reads it: until this table
-- exists every grant fails closed with a storage error and payments are not
-- delivered.

CREATE TABLE IF NOT EXISTS public.processed_payments (
    -- The Razorpay payment id. Primary key is the entire idempotency mechanism:
    -- a duplicate insert is what identifies a replay.
    razorpay_payment_id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.processed_payments ENABLE ROW LEVEL SECURITY;

-- Deliberately NO policies, matching `subscriptions`. This table records who
-- paid what; an authenticated browser client has no business reading it and
-- therefore has no policy at all.

-- Supports the compensating delete in `releasePaymentClaim`, which is what makes
-- a transient write failure retryable instead of permanently lost.
CREATE INDEX IF NOT EXISTS idx_processed_payments_user
    ON public.processed_payments (user_id);
