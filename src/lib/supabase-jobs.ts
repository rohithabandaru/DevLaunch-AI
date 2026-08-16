import { supabase } from '@/components/providers/app-provider';
import { JobApplication, JobStatus, WorkplaceType } from '@/types/job-types';

// Map UI Status to DB Status
const mapToDbStatus = (status: JobStatus): string => {
  switch (status) {
    case 'SAVED': case 'wishlist': return 'Wishlist';
    case 'APPLIED': case 'applied': return 'Applied';
    case 'ASSESSMENT': return 'OA Received';
    case 'INTERVIEW': case 'FINAL_INTERVIEW': case 'interviewing': return 'Interview';
    case 'OFFER': case 'offer': return 'Offer';
    case 'ACCEPTED': return 'Accepted';
    case 'REJECTED': case 'WITHDRAWN': case 'rejected': return 'Rejected';
    default: return 'Applied';
  }
};

const mapFromDbStatus = (status: string): JobStatus => {
  switch (status) {
    case 'Wishlist': return 'SAVED';
    case 'Applied': return 'APPLIED';
    case 'OA Received': return 'ASSESSMENT';
    case 'Interview': case 'HR Round': case 'Technical Round': return 'INTERVIEW';
    case 'Offer': return 'OFFER';
    case 'Accepted': return 'ACCEPTED';
    case 'Rejected': return 'REJECTED';
    default: return 'APPLIED';
  }
};

// Serialize extra fields into the notes column as JSON to avoid schema changes
const serializeNotes = (job: Partial<JobApplication>): string => {
  return JSON.stringify({
    notes: job.notes,
    tags: job.tags,
    description: job.description,
    applicantEmail: job.applicantEmail,
    applicantPhone: job.applicantPhone,
    recruiterName: job.recruiterName,
    recruiterEmail: job.recruiterEmail,
    source: job.source,
    matchResult: job.matchResult,
    interviewPrep: job.interviewPrep,
    interviewDetails: job.interviewDetails,
    statusHistory: job.statusHistory,
    emailEvents: job.emailEvents,
    nextAction: job.nextAction,
    needsConfirmation: job.needsConfirmation,
    pendingStatusUpdate: job.pendingStatusUpdate,
  });
};

const deserializeNotes = (dbNotes: string | null): Partial<JobApplication> => {
  if (!dbNotes) return { notes: '' };
  try {
    const parsed = JSON.parse(dbNotes);
    if (typeof parsed === 'object') return parsed;
    return { notes: dbNotes };
  } catch {
    return { notes: dbNotes }; // Fallback for plain text notes
  }
};

export const fetchJobs = async (userId: string): Promise<JobApplication[]> => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('jobs').select('*').eq('user_id', userId);
  if (error) throw error;
  
  return (data || []).map(row => {
    const extra = deserializeNotes(row.notes);
    return {
      id: row.id,
      company: row.company,
      title: row.role,
      location: row.location || 'Remote',
      workplaceType: (row.location_type as WorkplaceType) || 'Remote',
      salary: row.salary || '',
      status: mapFromDbStatus(row.status),
      appliedDate: row.applied_date,
      url: row.job_link || '',
      createdAt: row.created_at,
      updatedAt: row.created_at, // Mock updated_at since DB doesn't have it
      ...extra, // Expand tags, description, etc.
    } as JobApplication;
  });
};

export const insertJob = async (userId: string, job: JobApplication) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('jobs').insert({
    id: job.id.startsWith('job-') ? undefined : job.id, // Let DB generate UUID if it's a mock ID
    user_id: userId,
    company: job.company,
    role: job.title,
    salary: job.salary,
    location: job.location,
    location_type: job.workplaceType,
    job_link: job.url,
    status: mapToDbStatus(job.status),
    applied_date: job.appliedDate,
    notes: serializeNotes(job)
  }).select().single();
  
  if (error) throw error;
  return data;
};

export const updateJob = async (job: JobApplication) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('jobs').update({
    company: job.company,
    role: job.title,
    salary: job.salary,
    location: job.location,
    location_type: job.workplaceType,
    job_link: job.url,
    status: mapToDbStatus(job.status),
    applied_date: job.appliedDate,
    notes: serializeNotes(job)
  }).eq('id', job.id);
  
  if (error) throw error;
};

export const deleteJob = async (jobId: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);
  if (error) throw error;
};
