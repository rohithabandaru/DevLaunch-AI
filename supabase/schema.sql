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
