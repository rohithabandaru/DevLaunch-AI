export type JobStatus = 
  | 'SAVED'
  | 'APPLIED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  // Backward compatibility aliases
  | 'wishlist'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected';

export type WorkplaceType = 'Remote' | 'Hybrid' | 'Onsite';

export type EmailProvider = 'gmail' | 'outlook';

export interface EmailConnection {
  id: string;
  provider: EmailProvider;
  email: string;
  connectedAt: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  status: 'connected' | 'error' | 'disconnected';
}

export interface InterviewDetails {
  date?: string;
  time?: string;
  timeZone?: string;
  type?: 'Screening' | 'Technical' | 'System Design' | 'Behavioral' | 'Hiring Manager' | 'Final';
  meetingLink?: string;
  interviewer?: string;
  notes?: string;
}

export interface StatusHistoryRecord {
  id: string;
  fromStatus?: JobStatus;
  toStatus: JobStatus;
  timestamp: string;
  source: 'email' | 'manual';
  emailSubject?: string;
  detectionMethod: 'ai_classifier' | 'keyword_rule' | 'user_manual';
  aiConfidence?: number;
  notes?: string;
}

export interface EmailEvent {
  id: string;
  emailId: string;
  subject: string;
  sender: string;
  receivedAt: string;
  extractedStatus?: JobStatus;
  aiConfidence?: number;
  requiresConfirmation?: boolean;
  snippet?: string;
}

export interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingKeywords: string[];
  recommendations: string[];
}

export interface InterviewPrepQuestion {
  question: string;
  category: 'Technical' | 'Behavioral' | 'Architecture' | 'Company Fit';
  talkingPoints: string[];
}

export interface InterviewPrepResult {
  summary: string;
  questions: InterviewPrepQuestion[];
  questionsToAskInterviewer: string[];
}

export interface JobApplication {
  id: string;
  company: string;
  title: string;
  location: string;
  workplaceType: WorkplaceType;
  salary?: string;
  status: JobStatus;
  appliedDate: string;
  url?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  applicantEmail?: string;
  applicantPhone?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  source?: 'email' | 'manual' | string;
  matchResult?: JobMatchResult;
  interviewPrep?: InterviewPrepResult;
  interviewDetails?: InterviewDetails;
  statusHistory?: StatusHistoryRecord[];
  emailEvents?: EmailEvent[];
  nextAction?: string;
  needsConfirmation?: boolean;
  pendingStatusUpdate?: {
    proposedStatus: JobStatus;
    confidence: number;
    emailSubject: string;
    emailDate: string;
    emailId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedEmailJobData {
  companyName: string;
  jobTitle: string;
  location?: string;
  employmentType?: WorkplaceType;
  appliedDate?: string;
  status: JobStatus;
  interviewDate?: string;
  interviewType?: string;
  meetingLink?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  jobUrl?: string;
  source?: string;
  confidence: number; // 0 - 100
  nextActionRecommendation?: string;
  rawEmailSnippet?: string;
}

