import { JobApplication, ExtractedEmailJobData, StatusHistoryRecord, EmailEvent } from '@/types/job-types';

/**
 * Deduplicates and upserts parsed email job applications into the user's existing application list.
 * 
 * Rules:
 * 1. Matches by normalized Company Name + Job Title OR Recruiter Email domain.
 * 2. If matched: Updates status, appends status history timeline, adds email event, updates interview details if found.
 * 3. Low confidence updates (< 80%) flag `needsConfirmation` and set `pendingStatusUpdate` instead of blindly mutating status.
 * 4. If not matched: Creates a brand new application record.
 */
export function upsertJobFromEmail(
  existingJobs: JobApplication[],
  extracted: ExtractedEmailJobData,
  emailMeta: { id: string; subject: string; sender: string; receivedAt: string }
): { updatedJobs: JobApplication[]; isNew: boolean; updatedId: string } {
  const normCompany = extracted.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normTitle = extracted.jobTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

  const existingIndex = existingJobs.findIndex((job) => {
    const existingNormCompany = job.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingNormTitle = job.title.toLowerCase().replace(/[^a-z0-9]/g, '');

    const companyMatch =
      normCompany.length > 2 && (existingNormCompany === normCompany || (existingNormCompany.length > 3 && normCompany.length > 3 && (existingNormCompany.includes(normCompany) || normCompany.includes(existingNormCompany))));
    
    const titleMatch =
      normTitle.length > 3 && (existingNormTitle === normTitle || (existingNormTitle.length > 4 && normTitle.length > 4 && existingNormTitle.includes(normTitle)));

    return companyMatch && titleMatch;
  });

  const nextJobs = [...existingJobs];
  const nowIso = new Date().toISOString();

  const newEmailEvent: EmailEvent = {
    id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    emailId: emailMeta.id,
    subject: emailMeta.subject,
    sender: emailMeta.sender,
    receivedAt: emailMeta.receivedAt,
    extractedStatus: extracted.status,
    aiConfidence: extracted.confidence,
    requiresConfirmation: extracted.confidence < 80,
    snippet: extracted.rawEmailSnippet,
  };

  if (existingIndex !== -1) {
    const target = { ...nextJobs[existingIndex] };

    // Check if status needs update
    const isStatusDifferent = target.status !== extracted.status;
    let updatedStatusHistory = target.statusHistory || [];
    let isNeedsConfirmation = target.needsConfirmation;
    let pendingStatusUpdate = target.pendingStatusUpdate;

    if (isStatusDifferent) {
      if (extracted.confidence >= 80) {
        // High confidence: automatic status transition
        const newHistoryRecord: StatusHistoryRecord = {
          id: `hist-${Date.now()}`,
          fromStatus: target.status,
          toStatus: extracted.status,
          timestamp: nowIso,
          source: 'email',
          emailSubject: emailMeta.subject,
          detectionMethod: 'ai_classifier',
          aiConfidence: extracted.confidence,
        };
        updatedStatusHistory = [newHistoryRecord, ...updatedStatusHistory];
        target.status = extracted.status;
        target.needsConfirmation = false;
        target.pendingStatusUpdate = undefined;
      } else {
        // Low confidence: require user confirmation
        isNeedsConfirmation = true;
        pendingStatusUpdate = {
          proposedStatus: extracted.status,
          confidence: extracted.confidence,
          emailSubject: emailMeta.subject,
          emailDate: emailMeta.receivedAt,
          emailId: emailMeta.id,
        };
      }
    }

    // Update interview details if detected
    if (extracted.interviewDate || extracted.meetingLink) {
      target.interviewDetails = {
        ...target.interviewDetails,
        date: extracted.interviewDate || target.interviewDetails?.date,
        meetingLink: extracted.meetingLink || target.interviewDetails?.meetingLink,
        type: (extracted.interviewType as NonNullable<JobApplication['interviewDetails']>['type']) || target.interviewDetails?.type || 'Technical',
      };
    }

    target.updatedAt = nowIso;
    target.nextAction = extracted.nextActionRecommendation || target.nextAction;
    target.statusHistory = updatedStatusHistory;
    target.emailEvents = [newEmailEvent, ...(target.emailEvents || [])];
    target.needsConfirmation = isNeedsConfirmation;
    target.pendingStatusUpdate = pendingStatusUpdate;
    if (extracted.recruiterEmail) target.recruiterEmail = extracted.recruiterEmail;
    if (extracted.recruiterName) target.recruiterName = extracted.recruiterName;

    nextJobs[existingIndex] = target;
    return { updatedJobs: nextJobs, isNew: false, updatedId: target.id };
  } else {
    // Create new Application
    const initialHistoryRecord: StatusHistoryRecord = {
      id: `hist-${Date.now()}`,
      toStatus: extracted.status,
      timestamp: nowIso,
      source: 'email',
      emailSubject: emailMeta.subject,
      detectionMethod: 'ai_classifier',
      aiConfidence: extracted.confidence,
    };

    const newJob: JobApplication = {
      id: `job-email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      company: extracted.companyName,
      title: extracted.jobTitle,
      location: extracted.location || 'Remote',
      workplaceType: extracted.employmentType || 'Remote',
      status: extracted.status,
      appliedDate: extracted.appliedDate || nowIso.slice(0, 10),
      source: 'email',
      recruiterEmail: extracted.recruiterEmail,
      recruiterName: extracted.recruiterName,
      nextAction: extracted.nextActionRecommendation,
      statusHistory: [initialHistoryRecord],
      emailEvents: [newEmailEvent],
      interviewDetails:
        extracted.interviewDate || extracted.meetingLink
          ? {
              date: extracted.interviewDate,
              meetingLink: extracted.meetingLink,
              type: (extracted.interviewType as NonNullable<JobApplication['interviewDetails']>['type']) || 'Technical',
            }
          : undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    return { updatedJobs: [newJob, ...nextJobs], isNew: true, updatedId: newJob.id };
  }
}
