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

-- 5. TRIGGER FOR USER SIGN UP
-- Automatically create profile row when new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, target_role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'Full Stack Developer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
