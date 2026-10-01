-- DEVLAUNCH AI DATABASE SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor to configure your production database tables.

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    target_role TEXT DEFAULT 'Full Stack Developer',
    experience_level TEXT DEFAULT 'Mid Level',
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    salary TEXT,
    location TEXT,
    location_type TEXT NOT NULL CHECK (location_type IN ('Remote', 'Hybrid', 'Onsite')),
    job_link TEXT,
    referral TEXT,
    status TEXT NOT NULL CHECK (status IN ('Wishlist', 'Applied', 'OA Received', 'Interview', 'HR Round', 'Technical Round', 'Offer', 'Rejected', 'Accepted')),
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs" 
    ON public.jobs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" 
    ON public.jobs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" 
    ON public.jobs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" 
    ON public.jobs FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for speed
CREATE INDEX IF NOT EXISTS idx_jobs_user ON public.jobs(user_id);

-- 3. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    round TEXT NOT NULL CHECK (round IN ('HR', 'Technical', 'System Design', 'Behavioral', 'Coding', 'Managerial')),
    feedback TEXT,
    score INT CHECK (score >= 0 AND score <= 10),
    result TEXT NOT NULL CHECK (result IN ('Passed', 'Failed', 'Pending')) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interviews" 
    ON public.interviews FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews" 
    ON public.interviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" 
    ON public.interviews FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews" 
    ON public.interviews FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_interviews_user ON public.interviews(user_id);

-- 4. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Resume', 'Cover Letter', 'Certificate', 'Offer Letter', 'Portfolio Link')),
    company TEXT,
    uploaded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT FALSE,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" 
    ON public.documents FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
    ON public.documents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
    ON public.documents FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
    ON public.documents FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);

-- 5. AUTHORITATIVE USER ROLES (server-controlled; users can never promote themselves)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Owners may read their own role. No INSERT/UPDATE/DELETE policies exist, so API
-- clients cannot create or modify role rows (self-promotion is impossible).
CREATE POLICY "user_roles owner select"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- 6. EXTENSION SESSIONS (short-lived, single-use, hashed tokens for the extension)
CREATE TABLE IF NOT EXISTS public.extension_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.extension_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extension_sessions owner select"
    ON public.extension_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "extension_sessions owner delete"
    ON public.extension_sessions FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_extension_sessions_token_hash
    ON public.extension_sessions (token_hash);

CREATE INDEX IF NOT EXISTS idx_extension_sessions_user
    ON public.extension_sessions (user_id);

-- 7. TRIGGER FOR USER SIGN UP
-- Automatically create profile + authoritative role row when a new user signs up
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

-- 6. PORTFOLIOS TABLE (multiple portfolios per user)
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    theme TEXT DEFAULT 'modern',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, slug)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolios_published_slug
    ON public.portfolios (slug)
    WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolios"
    ON public.portfolios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view published portfolios"
    ON public.portfolios FOR SELECT
    USING (is_published = TRUE);

CREATE POLICY "Users can insert their own portfolios"
    ON public.portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
    ON public.portfolios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
    ON public.portfolios FOR DELETE
    USING (auth.uid() = user_id);

-- 7. PORTFOLIO ANALYTICS (aggregated counters)
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL UNIQUE,
    views BIGINT DEFAULT 0 NOT NULL,
    unique_visitors BIGINT DEFAULT 0 NOT NULL,
    resume_downloads BIGINT DEFAULT 0 NOT NULL,
    contact_submissions BIGINT DEFAULT 0 NOT NULL,
    github_clicks BIGINT DEFAULT 0 NOT NULL,
    linkedin_clicks BIGINT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view analytics"
    ON public.portfolio_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update analytics"
    ON public.portfolio_analytics FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can insert analytics"
    ON public.portfolio_analytics FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_id AND p.user_id = auth.uid()
        )
    );

-- 8. PORTFOLIO EVENTS (optional event stream for analytics)
CREATE TABLE IF NOT EXISTS public.portfolio_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'view', 'unique_view', 'resume_download', 'contact_submit',
        'github_click', 'linkedin_click'
    )),
    visitor_hash TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_portfolio_events_portfolio
    ON public.portfolio_events(portfolio_id, created_at DESC);

ALTER TABLE public.portfolio_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert portfolio events for published portfolios"
    ON public.portfolio_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_id AND p.is_published = TRUE
        )
    );

CREATE POLICY "Owners can view portfolio events"
    ON public.portfolio_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.portfolios p
            WHERE p.id = portfolio_id AND p.user_id = auth.uid()
        )
    );

-- 9. EMAIL CONNECTIONS (server-side, encrypted-at-rest mailbox OAuth tokens)
-- Supports the "AI Email Sync Engine": OAuth tokens are encrypted with
-- AES-256-GCM (EMAIL_ENCRYPTION_KEY) by server code and never touch the browser.
-- See supabase/migrations/0002_email_connections.sql for the full rationale.
CREATE TABLE IF NOT EXISTS public.email_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
    mailbox_email TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT,
    auto_sync BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'connected'
        CHECK (status IN ('connected', 'error', 'disconnected')),
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, provider)
);

ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;

-- No owner SELECT policy on purpose: the token columns are credentials and the
-- app only ever reads this table through the service role
-- (/api/email/connections), which projects them away. Owners may still delete
-- their own row. There is no INSERT/UPDATE policy, so connections are only ever
-- created, refreshed and updated by server code.
CREATE POLICY "email_connections owner delete"
    ON public.email_connections FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_email_connections_user
    ON public.email_connections (user_id);

DROP TRIGGER IF EXISTS email_connections_updated_at ON public.email_connections;
CREATE TRIGGER email_connections_updated_at
    BEFORE UPDATE ON public.email_connections
    FOR EACH ROW EXECUTE FUNCTION public.touch_email_connections_updated_at();

-- Auto-touch updated_at on portfolios
CREATE OR REPLACE FUNCTION public.touch_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portfolios_updated_at ON public.portfolios;
CREATE TRIGGER portfolios_updated_at
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW EXECUTE FUNCTION public.touch_portfolio_updated_at();

-- 10. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Resume',
    template_id TEXT NOT NULL DEFAULT 'modern',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INT DEFAULT 85,
    is_public BOOLEAN DEFAULT FALSE,
    slug TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resumes"
    ON public.resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
    ON public.resumes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
    ON public.resumes FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);

-- 11. COVER LETTERS TABLE
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    job_description TEXT,
    tone TEXT DEFAULT 'Professional',
    length TEXT DEFAULT 'Medium',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cover letters"
    ON public.cover_letters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cover letters"
    ON public.cover_letters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters"
    ON public.cover_letters FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters"
    ON public.cover_letters FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user ON public.cover_letters(user_id);

-- 12. ATS REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.ats_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_title TEXT NOT NULL,
    overall_score INT NOT NULL,
    keyword_match INT NOT NULL,
    formatting TEXT NOT NULL,
    skills_match TEXT NOT NULL,
    readability TEXT NOT NULL,
    suggestions JSONB DEFAULT '[]'::jsonb,
    missing_keywords JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ats reports"
    ON public.ats_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ats reports"
    ON public.ats_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ats reports"
    ON public.ats_reports FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ats reports"
    ON public.ats_reports FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ats_reports_user ON public.ats_reports(user_id);

