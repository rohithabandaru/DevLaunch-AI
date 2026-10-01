-- DEVLAUNCH AI — RESUMES, COVER LETTERS & ATS REPORTS MIGRATION
-- Database persistence for user-created resumes, cover letters, and ATS reports.
-- RLS enforced with auth.uid() = user_id.

-- 1. RESUMES TABLE
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

-- 2. COVER LETTERS TABLE
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

-- 3. ATS REPORTS TABLE
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
