import { createBrowserClient } from '@supabase/ssr';
import { z } from 'zod';
import { readStorage, writeStorage } from '@/lib/storage';
import { ResumeData } from '@/components/resume/resume-templates';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && key ? createBrowserClient(url, key) : null;

// Validation Schemas
export const coverLetterSchema = z.object({
  id: z.string().optional(),
  jobTitle: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  jobDescription: z.string().max(10000).optional(),
  tone: z.string().max(100).default('Professional'),
  length: z.string().max(100).default('Medium'),
  content: z.string().min(1).max(20000),
});

export const atsReportSchema = z.object({
  id: z.string().optional(),
  resumeTitle: z.string().min(1).max(200),
  overallScore: z.number().int().min(0).max(100),
  keywordMatch: z.number().int().min(0).max(100),
  formatting: z.string().max(200),
  skillsMatch: z.string().max(200),
  readability: z.string().max(200),
  suggestions: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
});

export interface CoverLetterRecord {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  job_description?: string;
  tone: string;
  length: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ATSReportRecord {
  id: string;
  user_id: string;
  resume_title: string;
  overall_score: number;
  keyword_match: number;
  formatting: string;
  skills_match: string;
  readability: string;
  suggestions: string[];
  missing_keywords: string[];
  created_at: string;
}

// ==========================================
// RESUMES PERSISTENCE
// ==========================================
export async function fetchUserResume(userId: string): Promise<ResumeData | null> {
  if (!supabase || !userId) {
    return readStorage<ResumeData | null>('resume_draft', null);
  }

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[user-content] fetchUserResume error:', error.message);
      return readStorage<ResumeData | null>('resume_draft', null);
    }

    if (data && data.content) {
      const resume = data.content as ResumeData;
      // Sync back to local storage cache
      writeStorage('resume_draft', resume);
      return resume;
    }
  } catch (err) {
    console.error('[user-content] fetchUserResume unexpected error:', err);
  }

  return readStorage<ResumeData | null>('resume_draft', null);
}

export async function saveUserResume(userId: string, resumeData: ResumeData, title = 'My Resume'): Promise<boolean> {
  // Always update local cache first
  writeStorage('resume_draft', resumeData);

  if (!supabase || !userId) return false;

  try {
    const { data: existing } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('resumes')
        .update({
          title,
          content: resumeData as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .eq('user_id', userId);

      if (error) {
        console.error('[user-content] saveUserResume update error:', error.message);
        return false;
      }
    } else {
      const { error } = await supabase.from('resumes').insert({
        user_id: userId,
        title,
        template_id: 'modern',
        content: resumeData as unknown as Record<string, unknown>,
        score: 85,
      });

      if (error) {
        console.error('[user-content] saveUserResume insert error:', error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('[user-content] saveUserResume unexpected error:', err);
    return false;
  }
}

// ==========================================
// COVER LETTERS PERSISTENCE
// ==========================================
export async function fetchUserCoverLetters(userId: string): Promise<CoverLetterRecord[]> {
  if (!supabase || !userId) {
    return readStorage<CoverLetterRecord[]>('cover_letters_cache', []);
  }

  try {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[user-content] fetchUserCoverLetters error:', error.message);
      return readStorage<CoverLetterRecord[]>('cover_letters_cache', []);
    }

    if (data) {
      writeStorage('cover_letters_cache', data);
      return data as CoverLetterRecord[];
    }
  } catch (err) {
    console.error('[user-content] fetchUserCoverLetters unexpected error:', err);
  }

  return readStorage<CoverLetterRecord[]>('cover_letters_cache', []);
}

export async function saveUserCoverLetter(
  userId: string,
  input: {
    jobTitle: string;
    company: string;
    jobDescription?: string;
    tone?: string;
    length?: string;
    content: string;
  }
): Promise<CoverLetterRecord | null> {
  const validated = coverLetterSchema.parse(input);

  if (!supabase || !userId) {
    const localRecord: CoverLetterRecord = {
      id: `local-${Date.now()}`,
      user_id: userId || 'local',
      job_title: validated.jobTitle,
      company: validated.company,
      job_description: validated.jobDescription,
      tone: validated.tone,
      length: validated.length,
      content: validated.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readStorage<CoverLetterRecord[]>('cover_letters_cache', []);
    writeStorage('cover_letters_cache', [localRecord, ...current]);
    return localRecord;
  }

  try {
    const { data, error } = await supabase
      .from('cover_letters')
      .insert({
        user_id: userId,
        job_title: validated.jobTitle,
        company: validated.company,
        job_description: validated.jobDescription || '',
        tone: validated.tone,
        length: validated.length,
        content: validated.content,
      })
      .select()
      .single();

    if (error) {
      console.error('[user-content] saveUserCoverLetter error:', error.message);
      return null;
    }

    return data as CoverLetterRecord;
  } catch (err) {
    console.error('[user-content] saveUserCoverLetter unexpected error:', err);
    return null;
  }
}

export async function deleteUserCoverLetter(userId: string, coverLetterId: string): Promise<boolean> {
  if (!supabase || !userId) {
    const current = readStorage<CoverLetterRecord[]>('cover_letters_cache', []);
    writeStorage(
      'cover_letters_cache',
      current.filter((c) => c.id !== coverLetterId)
    );
    return true;
  }

  try {
    const { error } = await supabase
      .from('cover_letters')
      .delete()
      .eq('id', coverLetterId)
      .eq('user_id', userId);

    if (error) {
      console.error('[user-content] deleteUserCoverLetter error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[user-content] deleteUserCoverLetter unexpected error:', err);
    return false;
  }
}

// ==========================================
// ATS REPORTS PERSISTENCE
// ==========================================
export async function fetchUserATSReports(userId: string): Promise<ATSReportRecord[]> {
  if (!supabase || !userId) {
    return readStorage<ATSReportRecord[]>('ats_reports_cache', []);
  }

  try {
    const { data, error } = await supabase
      .from('ats_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[user-content] fetchUserATSReports error:', error.message);
      return readStorage<ATSReportRecord[]>('ats_reports_cache', []);
    }

    if (data) {
      writeStorage('ats_reports_cache', data);
      return data as ATSReportRecord[];
    }
  } catch (err) {
    console.error('[user-content] fetchUserATSReports unexpected error:', err);
  }

  return readStorage<ATSReportRecord[]>('ats_reports_cache', []);
}

export async function saveUserATSReport(
  userId: string,
  input: {
    resumeTitle: string;
    overallScore: number;
    keywordMatch: number;
    formatting: string;
    skillsMatch: string;
    readability: string;
    suggestions?: string[];
    missingKeywords?: string[];
  }
): Promise<ATSReportRecord | null> {
  const validated = atsReportSchema.parse(input);

  if (!supabase || !userId) {
    const localRecord: ATSReportRecord = {
      id: `local-ats-${Date.now()}`,
      user_id: userId || 'local',
      resume_title: validated.resumeTitle,
      overall_score: validated.overallScore,
      keyword_match: validated.keywordMatch,
      formatting: validated.formatting,
      skills_match: validated.skillsMatch,
      readability: validated.readability,
      suggestions: validated.suggestions,
      missing_keywords: validated.missingKeywords,
      created_at: new Date().toISOString(),
    };
    const current = readStorage<ATSReportRecord[]>('ats_reports_cache', []);
    writeStorage('ats_reports_cache', [localRecord, ...current]);
    return localRecord;
  }

  try {
    const { data, error } = await supabase
      .from('ats_reports')
      .insert({
        user_id: userId,
        resume_title: validated.resumeTitle,
        overall_score: validated.overallScore,
        keyword_match: validated.keywordMatch,
        formatting: validated.formatting,
        skills_match: validated.skillsMatch,
        readability: validated.readability,
        suggestions: validated.suggestions as unknown as Record<string, unknown>,
        missing_keywords: validated.missingKeywords as unknown as Record<string, unknown>,
      })
      .select()
      .single();

    if (error) {
      console.error('[user-content] saveUserATSReport error:', error.message);
      return null;
    }

    return data as ATSReportRecord;
  } catch (err) {
    console.error('[user-content] saveUserATSReport unexpected error:', err);
    return null;
  }
}

// ==========================================
// LOCALSTORAGE TO SUPABASE MIGRATION HELPER
// ==========================================
export async function migrateLocalStorageToSupabase(userId: string): Promise<void> {
  if (!userId) return;

  const migrationKey = `devlaunch_migrated_${userId}`;
  if (readStorage<boolean>(migrationKey, false)) {
    return;
  }

  try {
    if (supabase) {
      // 1. Migrate Local Resume Draft if exists
      const localResume = readStorage<ResumeData | null>('resume_draft', null);
      if (localResume && localResume.personalInfo && localResume.personalInfo.fullName) {
        await saveUserResume(userId, localResume, `${localResume.personalInfo.fullName} Resume`);
      }

      // 2. Migrate Local Cover Letters if exist
      const localLetters = readStorage<CoverLetterRecord[]>('cover_letters_cache', []);
      for (const letter of localLetters) {
        if (letter.content && letter.job_title) {
          await saveUserCoverLetter(userId, {
            jobTitle: letter.job_title,
            company: letter.company,
            jobDescription: letter.job_description,
            tone: letter.tone,
            length: letter.length,
            content: letter.content,
          });
        }
      }

      // 3. Migrate Local ATS Reports if exist
      const localATS = readStorage<ATSReportRecord[]>('ats_reports_cache', []);
      for (const report of localATS) {
        if (report.resume_title && typeof report.overall_score === 'number') {
          await saveUserATSReport(userId, {
            resumeTitle: report.resume_title,
            overallScore: report.overall_score,
            keywordMatch: report.keyword_match,
            formatting: report.formatting,
            skillsMatch: report.skills_match,
            readability: report.readability,
            suggestions: report.suggestions,
            missingKeywords: report.missing_keywords,
          });
        }
      }
    }

    writeStorage(migrationKey, true);
  } catch (err) {
    console.error('[user-content] Migration error:', err);
  }
}
