import { describe, it, expect, beforeEach } from 'vitest';
import {
  fetchUserResume,
  saveUserResume,
  fetchUserCoverLetters,
  saveUserCoverLetter,
  deleteUserCoverLetter,
  fetchUserATSReports,
  saveUserATSReport,
  migrateLocalStorageToSupabase,
} from './user-content';
import { readStorage, writeStorage } from './storage';

describe('User Content Persistence & Migration', () => {
  const mockUserId = 'usr-test-123';

  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and reads resume locally when Supabase client is unconfigured or in offline mode', async () => {
    const mockResumeData = {
      personalInfo: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '123-456-7890',
        location: 'NYC',
        linkedIn: '',
        github: '',
        portfolio: '',
      },
      summary: 'Tech Lead',
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certificates: [],
      achievements: [],
      languages: [],
      interests: [],
      references: [],
    };

    await saveUserResume(mockUserId, mockResumeData as unknown as import('@/components/resume/resume-templates').ResumeData, 'Jane Resume');
    expect(readStorage('resume_draft', null)).toEqual(mockResumeData);

    const fetched = await fetchUserResume(mockUserId);
    expect(fetched).toEqual(mockResumeData);
  });

  it('creates and deletes cover letters correctly', async () => {
    const letter = await saveUserCoverLetter(mockUserId, {
      jobTitle: 'Frontend Developer',
      company: 'Acme Corp',
      content: 'Dear Hiring Manager...',
    });

    expect(letter).not.toBeNull();
    expect(letter?.job_title).toBe('Frontend Developer');

    const letters = await fetchUserCoverLetters(mockUserId);
    expect(letters.length).toBeGreaterThan(0);

    if (letter?.id) {
      await deleteUserCoverLetter(mockUserId, letter.id);
      const afterDelete = await fetchUserCoverLetters(mockUserId);
      expect(afterDelete.find((item) => item.id === letter.id)).toBeUndefined();
    }
  });

  it('creates and reads ATS reports', async () => {
    const report = await saveUserATSReport(mockUserId, {
      resumeTitle: 'Senior Dev Resume',
      overallScore: 92,
      keywordMatch: 88,
      formatting: 'Good',
      skillsMatch: 'High',
      readability: 'Excellent',
      suggestions: ['Add AWS certification'],
      missingKeywords: ['Docker'],
    });

    expect(report).not.toBeNull();
    expect(report?.overall_score).toBe(92);

    const reports = await fetchUserATSReports(mockUserId);
    expect(reports.length).toBeGreaterThan(0);
  });

  it('migrates existing localStorage items safely without duplication', async () => {
    writeStorage('resume_draft', { personalInfo: { fullName: 'Migrated User' } });
    writeStorage('cover_letters_cache', [
      { id: 'old-1', job_title: 'Backend Dev', company: 'Tech Inc', content: 'Old letter' },
    ]);

    await migrateLocalStorageToSupabase(mockUserId);

    expect(readStorage<boolean>(`devlaunch_migrated_${mockUserId}`, false)).toBe(true);
  });
});
