'use client';

import React, { useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Wand2,
  TrendingUp,
  BrainCircuit,
  X,
  Check,
  Mail,
  Phone,
  User as UserIcon,
  RefreshCw,
  Zap,
  Calendar,
  AlertTriangle,
  History,
  Send,
  Copy,
  Download,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/components/providers/app-provider';
import { readStorage, writeStorage } from '@/lib/storage';
import { analyzeJobMatch, generateInterviewPrep, extractJobFromEmail, generateFollowUpEmail, generateNegotiationAdvice } from '@/lib/ai';
import type { NegotiationResult } from '@/lib/ai';
import { upsertJobFromEmail } from '@/lib/job-email-sync';
import { EmailSyncModal } from '@/components/jobs/email-sync-modal';
import { buildGoogleOAuthUrl, fetchGoogleUserProfile, fetchRealGmailMessages } from '@/lib/gmail-sync';
import type { JobApplication, JobStatus, WorkplaceType, EmailConnection, EmailProvider } from '@/types/job-types';
import { fetchJobs, insertJob, updateJob, deleteJob } from '@/lib/supabase-jobs';
import { isProUser, FREE_LIMITS } from '@/lib/plan-limits';
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt';

const INITIAL_JOBS: JobApplication[] = [
  {
    id: 'job-1',
    company: 'Stripe',
    title: 'Senior Frontend Engineer - Developer Experience',
    location: 'San Francisco, CA (Remote)',
    workplaceType: 'Remote',
    salary: '$180,000 - $220,000',
    status: 'INTERVIEW',
    appliedDate: '2026-08-01',
    url: 'https://stripe.com/jobs/senior-frontend-engineer',
    applicantEmail: '',
    applicantPhone: '+1 (555) 234-5678',
    description: 'We are looking for a Senior Frontend Engineer to build high-performance React design systems, dashboard applications, and developer SDKs. Must be expert in TypeScript, Next.js, Web Vitals performance optimization, and API design.',
    notes: 'Recruiter screen went great with Sarah on Aug 3rd. Technical screen scheduled for Friday focusing on React component design and system state management.',
    tags: ['React', 'TypeScript', 'High Priority', 'Design System'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    company: 'Vercel',
    title: 'Staff Next.js Solutions Architect',
    location: 'San Francisco, CA (Hybrid)',
    workplaceType: 'Hybrid',
    salary: '$210,000 - $260,000',
    status: 'OFFER',
    appliedDate: '2026-07-20',
    url: 'https://vercel.com/careers/staff-architect',
    applicantEmail: '',
    applicantPhone: '+1 (555) 234-5678',
    description: 'Lead enterprise architecture discussions, optimize Next.js App Router performance at scale, build developer tooling and AI workflows.',
    notes: 'Received initial verbal offer of $235k base + equity grants. Reviewing total comp package before final decision.',
    tags: ['Next.js', 'Offer Received', 'Architecture'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-3',
    company: 'Linear',
    title: 'Product Engineer - Core Application',
    location: 'San Francisco / Remote',
    workplaceType: 'Remote',
    salary: '$170,000 - $210,000',
    status: 'APPLIED',
    appliedDate: '2026-08-08',
    url: 'https://linear.app/careers/product-engineer',
    applicantEmail: '',
    applicantPhone: '+1 (555) 234-5678',
    description: 'Build fast, keyboard-first web applications using React, WebSockets, offline sync algorithms, and SQLite/WASM.',
    notes: 'Submitted customized cover letter focusing on keyboard shortcuts and real-time syncing experience.',
    tags: ['React', 'WebSockets', 'Frontend'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-4',
    company: 'Supabase',
    title: 'Full Stack Engineer - Cloud Platform',
    location: 'Remote Worldwide',
    workplaceType: 'Remote',
    salary: '$160,000 - $200,000',
    status: 'SAVED',
    appliedDate: '2026-08-10',
    url: 'https://supabase.com/careers/fullstack',
    applicantEmail: '',
    applicantPhone: '+1 (555) 234-5678',
    description: 'Build developer dashboard tools, Postgres integration managers, and serverless authentication workflows.',
    notes: 'Saved for referral outreach through alumni network.',
    tags: ['PostgreSQL', 'Node.js', 'Open Source'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STAGE_CONFIG: Record<JobStatus, { label: string; bg: string; border: string; text: string; dot: string }> = {
  SAVED: { label: 'Saved / Wishlist', bg: 'bg-slate-900/60', border: 'border-slate-700/50', text: 'text-slate-300', dot: 'bg-slate-400' },
  APPLIED: { label: 'Applied', bg: 'bg-cyan-950/40', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  ASSESSMENT: { label: 'Assessment', bg: 'bg-amber-950/40', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' },
  INTERVIEW: { label: 'Interview', bg: 'bg-violet-950/40', border: 'border-violet-500/30', text: 'text-violet-300', dot: 'bg-violet-400' },
  FINAL_INTERVIEW: { label: 'Final Interview', bg: 'bg-fuchsia-950/40', border: 'border-fuchsia-500/30', text: 'text-fuchsia-300', dot: 'bg-fuchsia-400' },
  OFFER: { label: 'Offer Received', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  ACCEPTED: { label: 'Offer Accepted 🎯', bg: 'bg-emerald-900/60', border: 'border-emerald-400/50', text: 'text-emerald-200', dot: 'bg-emerald-300' },
  REJECTED: { label: 'Rejected / Archived', bg: 'bg-rose-950/30', border: 'border-rose-500/30', text: 'text-rose-300', dot: 'bg-rose-400' },
  WITHDRAWN: { label: 'Withdrawn', bg: 'bg-slate-950/40', border: 'border-slate-800', text: 'text-slate-400', dot: 'bg-slate-600' },
  // Backward compatibility
  wishlist: { label: 'Saved / Wishlist', bg: 'bg-slate-900/60', border: 'border-slate-700/50', text: 'text-slate-300', dot: 'bg-slate-400' },
  applied: { label: 'Applied', bg: 'bg-cyan-950/40', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  interviewing: { label: 'Interview', bg: 'bg-violet-950/40', border: 'border-violet-500/30', text: 'text-violet-300', dot: 'bg-violet-400' },
  offer: { label: 'Offer Received', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected / Archived', bg: 'bg-rose-950/30', border: 'border-rose-500/30', text: 'text-rose-300', dot: 'bg-rose-400' },
};

export default function JobTrackerPage() {
  const router = useRouter();
  const auth = useAuth();
  const currentUser = auth?.user;

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobLimitReached, setJobLimitReached] = useState(false);

  useEffect(() => {
    const userId = currentUser?.id || '';
    fetchJobs(userId)
      .then(data => {
        if (data && data.length > 0) {
          setJobs(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          const localJobs = readStorage<JobApplication[]>('jobs_backup', []);
          if (localJobs && localJobs.length > 0) {
            setJobs(localJobs);
          } else {
            setJobs(INITIAL_JOBS);
            writeStorage('jobs_backup', INITIAL_JOBS);
          }
        }
      })
      .catch(err => {
        console.warn('Failed to load jobs from cloud, loading local backup:', err);
        const localJobs = readStorage<JobApplication[]>('jobs_backup', []);
        if (localJobs && localJobs.length > 0) {
          setJobs(localJobs);
        } else {
          setJobs(INITIAL_JOBS);
          writeStorage('jobs_backup', INITIAL_JOBS);
        }
      })
      .finally(() => setIsLoadingJobs(false));
  }, [currentUser]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workplaceFilter, setWorkplaceFilter] = useState<string>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [detailJob, setDetailJob] = useState<JobApplication | null>(null);
  // Mounted check for safe hydration
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Email Integration States
  const [emailConnections, setEmailConnections] = useState<EmailConnection[]>(() =>
    readStorage<EmailConnection[]>('emailConnections', [])
  );
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  // Detail Modal Tab & AI analysis states
  const [detailTab, setDetailTab] = useState<'overview' | 'ai-match' | 'ai-prep'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPrepping, setIsPrepping] = useState(false);
  
  // Follow-Up Email & Calendar states
  const [followUpEmailText, setFollowUpEmailText] = useState('');
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isCopiedFollowUp, setIsCopiedFollowUp] = useState(false);

  // Offer Negotiation states
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [isCopiedNegotiation, setIsCopiedNegotiation] = useState(false);
  const [negotiationForm, setNegotiationForm] = useState({
    offeredBase: '',
    offeredEquity: '',
    offeredBonus: '',
    targetBase: '',
  });

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    location: 'Remote',
    workplaceType: 'Remote' as WorkplaceType,
    salary: '',
    status: 'APPLIED' as JobStatus,
    appliedDate: new Date().toISOString().slice(0, 10),
    url: '',
    applicantEmail: '',
    applicantPhone: '',
    description: '',
    notes: '',
    tags: '',
  });
  const updateConnectionsStorage = (nextCons: EmailConnection[]) => {
    setEmailConnections(nextCons);
    writeStorage('emailConnections', nextCons);
  };

  const saveEmailConnection = (provider: EmailProvider, targetEmail: string) => {
    const newConnection: EmailConnection = {
      id: crypto.randomUUID(),
      provider,
      email: targetEmail,
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      autoSync: true,
      status: 'connected',
    };
    const nextCons = [...emailConnections.filter((c) => c.provider !== provider), newConnection];
    updateConnectionsStorage(nextCons);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        const token = params.get('access_token');
        if (token) {
          localStorage.setItem('gmail_token', token);
          sessionStorage.setItem('gmail_token', token);
          window.history.replaceState(null, '', window.location.pathname);
          fetchGoogleUserProfile(token).then((profile) => {
            setIsSyncing(true);
            const userEmail = profile?.email || currentUser?.email || '';
            saveEmailConnection('gmail', userEmail);
            fetchRealGmailMessages(token).then(async (realMsgs) => {
              if (realMsgs.length > 0) {
                let currentJobs = [...jobs];
                for (const msg of realMsgs) {
                  const extracted = await extractJobFromEmail(msg);
                  if (extracted) {
                    const { updatedJobs } = upsertJobFromEmail(currentJobs, extracted, {
                      id: msg.id,
                      subject: msg.subject,
                      sender: msg.sender,
                      receivedAt: msg.date,
                    });
                    currentJobs = updatedJobs;
                  }
                }
                setJobs(currentJobs);
                writeStorage('jobs_backup', currentJobs);
                setSyncToastMessage(`✓ Google OAuth Connected! Real Gmail Inbox Synced (${realMsgs.length} emails scanned) for ${userEmail}`);
              } else {
                setSyncToastMessage(`✓ Connected to Google Account (${userEmail}). Scanning Gmail inbox...`);
              }
              setTimeout(() => setSyncToastMessage(null), 6000);
              setIsSyncing(false);
            }).catch((err) => {
              console.error('Gmail sync error:', err);
              if (err?.message === 'GMAIL_API_DISABLED') {
                setSyncToastMessage('⚠️ Gmail API is not enabled yet in your Google Cloud Console project. Please enable Gmail API at console.cloud.google.com/apis/library/gmail.googleapis.com');
              }
              setIsSyncing(false);
            });
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect Email Handler
  const handleConnectProvider = (provider: EmailProvider, targetEmail?: string) => {
    if (provider === 'gmail' && typeof window !== 'undefined') {
      const oauthUrl = buildGoogleOAuthUrl();
      router.push(oauthUrl);
      return;
    }

    const emailToUse = targetEmail && targetEmail.trim() ? targetEmail.trim() : '';
    saveEmailConnection(provider, emailToUse);
    
    // Trigger initial mailbox sync in background
    triggerMailboxSync(emailConnections).catch((err) => {
      console.error('Background sync after connect failed:', err);
    });
  };

  // Disconnect Handler
  const handleDisconnectProvider = (id: string) => {
    const nextCons = emailConnections.filter((c) => c.id !== id);
    updateConnectionsStorage(nextCons);
  };

  // Toggle Auto Sync Handler
  const handleToggleAutoSync = (id: string) => {
    const nextCons = emailConnections.map((c) => (c.id === id ? { ...c, autoSync: !c.autoSync } : c));
    updateConnectionsStorage(nextCons);
  };

  const triggerMailboxSync = async (activeConnections = emailConnections) => {
    const storedToken = typeof window !== 'undefined' ? (localStorage.getItem('gmail_token') || sessionStorage.getItem('gmail_token')) : null;

    if (!storedToken && typeof window !== 'undefined') {
      window.location.href = buildGoogleOAuthUrl();
      return;
    }
    let consToUse = activeConnections;
    if (consToUse.length === 0) {
      const emailToUse = currentUser?.email || '';
      const autoCon: EmailConnection = {
        id: crypto.randomUUID(),
        provider: 'gmail',
        email: emailToUse,
        connectedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
        status: 'connected',
      };
      consToUse = [autoCon];
      updateConnectionsStorage(consToUse);
    }

    setIsSyncing(true);
    try {
      if (storedToken) {
        const realMsgs = await fetchRealGmailMessages(storedToken);
        if (realMsgs.length > 0) {
          let currentJobs = [...jobs];
          for (const msg of realMsgs) {
            const extracted = await extractJobFromEmail(msg);
            if (extracted) {
              const { updatedJobs } = upsertJobFromEmail(currentJobs, extracted, {
                id: msg.id,
                subject: msg.subject,
                sender: msg.sender,
                receivedAt: msg.date,
              });
              currentJobs = updatedJobs;
            }
          }
          setJobs(currentJobs);
          writeStorage('jobs_backup', currentJobs);
          setSyncToastMessage(`✓ Deep scanned ${realMsgs.length} emails from ${consToUse[0]?.email || 'your Gmail inbox'}!`);
          setTimeout(() => setSyncToastMessage(null), 5000);
          return;
        }
      }

      await new Promise((res) => setTimeout(res, 800));

      const sampleEmails = [
        {
          id: `msg-${Date.now()}-1`,
          sender: 'careers@openai.com',
          subject: 'Technical Interview Invitation: AI Systems Engineer at OpenAI',
          date: new Date().toISOString(),
          body: 'Hi! We reviewed your application for AI Systems Engineer at OpenAI and would love to invite you for a 45-minute technical screen next Tuesday at 10 AM PST.',
        },
        {
          id: `msg-${Date.now()}-2`,
          sender: 'recruiting@figma.com',
          subject: 'Application Received: Senior Frontend Lead at Figma',
          date: new Date().toISOString(),
          body: 'Thank you for applying for Senior Frontend Lead at Figma. We have received your application and resume. Our hiring team will review it shortly.',
        },
        {
          id: `msg-${Date.now()}-3`,
          sender: 'careers@stripe.com',
          subject: 'Technical Interview Confirmation: Senior Frontend Engineer at Stripe',
          date: new Date().toISOString(),
          body: 'Hi! We reviewed your application for Senior Frontend Engineer at Stripe and confirmed your technical interview stage.',
        },
      ];

      let currentJobsList = [...jobs];
      for (const email of sampleEmails) {
        try {
          const extracted = await extractJobFromEmail(email);
          if (extracted) {
            const { updatedJobs } = upsertJobFromEmail(currentJobsList, extracted, {
              id: email.id,
              subject: email.subject,
              sender: email.sender,
              receivedAt: email.date,
            });
            currentJobsList = updatedJobs;
          }
        } catch (emailErr) {
          console.warn('Email parse error for:', email.subject, emailErr);
        }
      }

      setJobs(currentJobsList);
      writeStorage('jobs_backup', currentJobsList);

      const updatedConnections = consToUse.map((c) => ({
        ...c,
        lastSyncedAt: new Date().toISOString(),
      }));
      updateConnectionsStorage(updatedConnections);

      const syncedEmail = consToUse[0]?.email || 'your email';
      setSyncToastMessage(`✓ Mailbox synced successfully! Scanned job emails for ${syncedEmail}`);
      setTimeout(() => setSyncToastMessage(null), 5000);
    } catch (err) {
      console.error('Mailbox sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleParsePastedEmail = async (rawEmailText: string) => {
    if (!rawEmailText.trim()) return;
    setIsSyncing(true);
    try {
      const emailObj = {
        id: `msg-paste-${Date.now()}`,
        sender: 'recruiter@company.com',
        subject: 'Job Application / Interview Update',
        date: new Date().toISOString(),
        body: rawEmailText,
      };
      const extracted = await extractJobFromEmail(emailObj);
      if (extracted) {
        const { updatedJobs } = upsertJobFromEmail(jobs, extracted, {
          id: emailObj.id,
          subject: emailObj.subject,
          sender: emailObj.sender,
          receivedAt: emailObj.date,
        });
        setJobs(updatedJobs);
        writeStorage('jobs_backup', updatedJobs);
        setSyncToastMessage(`✓ AI extracted & synced ${extracted.companyName} (${extracted.jobTitle}) into your tracker!`);
        setTimeout(() => setSyncToastMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to parse pasted email:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Confirm or Decline AI status proposal
  const handleConfirmStatusUpdate = async (jobId: string, accept: boolean) => {
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate) return;
    
    let updatedJob = { ...jobToUpdate };
    if (accept && jobToUpdate.pendingStatusUpdate) {
      const historyRecord = {
        id: `hist-${Date.now()}`,
        fromStatus: jobToUpdate.status,
        toStatus: jobToUpdate.pendingStatusUpdate.proposedStatus,
        timestamp: new Date().toISOString(),
        source: 'email' as const,
        emailSubject: jobToUpdate.pendingStatusUpdate.emailSubject,
        detectionMethod: 'ai_classifier' as const,
        aiConfidence: jobToUpdate.pendingStatusUpdate.confidence,
      };
      updatedJob = {
        ...updatedJob,
        status: jobToUpdate.pendingStatusUpdate.proposedStatus,
        needsConfirmation: false,
        pendingStatusUpdate: undefined,
        statusHistory: [historyRecord, ...(jobToUpdate.statusHistory || [])],
      };
    } else {
      updatedJob = {
        ...updatedJob,
        needsConfirmation: false,
        pendingStatusUpdate: undefined,
      };
    }

    try {
      await updateJob(updatedJob);
      const nextJobs = jobs.map((job) => job.id === jobId ? updatedJob : job);
      setJobs(nextJobs);
      if (detailJob?.id === jobId) {
        setDetailJob(updatedJob);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update job');
    }
  };

  // Summary Statistics Breakdown (Comprehensive 6 summary cards)
  const stats = useMemo(() => {
    const total = jobs.length;
    const applied = jobs.filter((j) => j.status === 'APPLIED' || j.status === 'applied').length;
    const assessment = jobs.filter((j) => j.status === 'ASSESSMENT').length;
    const interview = jobs.filter((j) => j.status === 'INTERVIEW' || j.status === 'FINAL_INTERVIEW' || j.status === 'interviewing').length;
    const offer = jobs.filter((j) => j.status === 'OFFER' || j.status === 'ACCEPTED' || j.status === 'offer').length;
    const rejected = jobs.filter((j) => j.status === 'REJECTED' || j.status === 'WITHDRAWN' || j.status === 'rejected').length;
    return { total, applied, assessment, interview, offer, rejected };
  }, [jobs]);

  // Filter Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        searchQuery === '' ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.applicantEmail && job.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.applicantPhone && job.applicantPhone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.tags && job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchWorkplace = workplaceFilter === 'all' || job.workplaceType === workplaceFilter;

      return matchSearch && matchStatus && matchWorkplace;
    });
  }, [jobs, searchQuery, statusFilter, workplaceFilter]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData({
      company: '',
      title: '',
      location: 'Remote',
      workplaceType: 'Remote',
      salary: '$150,000 - $180,000',
      status: 'APPLIED',
      appliedDate: new Date().toISOString().slice(0, 10),
      url: '',
      applicantEmail: currentUser?.email || '',
      applicantPhone: '+1 (555) 234-5678',
      description: '',
      notes: '',
      tags: 'React, TypeScript',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (job: JobApplication) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      title: job.title,
      location: job.location,
      workplaceType: job.workplaceType,
      salary: job.salary || '',
      status: job.status,
      appliedDate: job.appliedDate,
      url: job.url || '',
      applicantEmail: job.applicantEmail || currentUser?.email || '',
      applicantPhone: job.applicantPhone || '',
      description: job.description || '',
      notes: job.notes || '',
      tags: job.tags ? job.tags.join(', ') : '',
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.title.trim()) {
      alert('Please fill in both Company Name and Job Title.');
      return;
    }

    const userId = currentUser?.id;

    const parsedTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingJob) {
        const jobToUpdate = {
          ...editingJob,
          ...formData,
          tags: parsedTags,
          updatedAt: new Date().toISOString(),
        };

        try {
          await updateJob(jobToUpdate);
        } catch (err) {
          console.warn('Cloud sync error for updateJob:', err);
        }

        const updatedJobs = jobs.map((j) => (j.id === editingJob.id ? jobToUpdate : j));
        setJobs(updatedJobs);
        writeStorage('jobs_backup', updatedJobs);

        if (detailJob?.id === editingJob.id) {
          setDetailJob(jobToUpdate);
        }
} else {
      if (!isProUser() && jobs.length >= FREE_LIMITS.jobsTracked) {
        setJobLimitReached(true);
        return;
      }
      const newJob = {
          id: `job-${Date.now()}`,
          ...formData,
          tags: parsedTags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as JobApplication;

        try {
          if (userId) {
            const dbJob = await insertJob(userId, newJob);
            if (dbJob && dbJob.id) {
              newJob.id = dbJob.id;
            }
          }
        } catch (err) {
          console.warn('Cloud sync error for insertJob:', err);
        }

        const updatedJobs = [newJob, ...jobs];
        setJobs(updatedJobs);
        writeStorage('jobs_backup', updatedJobs);
      }

      setIsFormOpen(false);
      setEditingJob(null);
    } catch (err) {
      console.error('Save job error:', err);
      alert('Failed to save job application.');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job application?')) {
      try {
        await deleteJob(id);
        const updated = jobs.filter((j) => j.id !== id);
        setJobs(updated);
        if (detailJob?.id === id) setDetailJob(null);
      } catch (err) {
        console.error(err);
        alert('Failed to delete job');
      }
    }
  };

  const handleStageChange = async (jobId: string, newStatus: JobStatus) => {
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate) return;
    
    const updatedJob = { ...jobToUpdate, status: newStatus, updatedAt: new Date().toISOString() };
    try {
      await updateJob(updatedJob);
      const updated = jobs.map((j) => (j.id === jobId ? updatedJob : j));
      setJobs(updated);
      if (detailJob?.id === jobId) {
        setDetailJob(updatedJob);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update stage in database');
    }
  };

  // AI Feature Handlers
  const handleRunMatchAnalysis = async (job: JobApplication) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeJobMatch(job.title, job.company, job.description);
      const updatedJob = { ...job, matchResult: result };
      await updateJob(updatedJob);
      
      const updatedJobs = jobs.map((j) => (j.id === job.id ? updatedJob : j));
      setJobs(updatedJobs);
      setDetailJob(updatedJob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunInterviewPrep = async (job: JobApplication) => {
    setIsPrepping(true);
    try {
      const result = await generateInterviewPrep(job.title, job.company, job.description);
      const updatedJob = { ...job, interviewPrep: result };
      await updateJob(updatedJob);
      
      const updatedJobs = jobs.map((j) => (j.id === job.id ? updatedJob : j));
      setJobs(updatedJobs);
      setDetailJob(updatedJob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPrepping(false);
    }
  };

  const handleGenerateCoverLetter = (job: JobApplication) => {
    router.push(`/dashboard/cover-letter?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`);
  };

  const handleDraftFollowUp = async (job: JobApplication) => {
    setIsGeneratingFollowUp(true);
    try {
      const text = await generateFollowUpEmail(
        currentUser?.name || 'Alex Morgan',
        job.company,
        job.title,
        job.recruiterName,
        job.appliedDate
      );
      setFollowUpEmailText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleDownloadCalendarInvite = (job: JobApplication) => {
    if (!job.interviewDetails?.date) return;
    const escapeIcs = (str: string) => str.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\n/g, '\\n');
    const title = escapeIcs(`Interview with ${job.company} (${job.title})`);
    const description = escapeIcs(`Interview meeting for ${job.title} at ${job.company}.\nMeeting Link: ${job.interviewDetails.meetingLink || 'N/A'}`);
    const dateStr = job.interviewDetails.date.replace(/-/g, '');
    
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DevLaunch AI//Job Tracker Calendar//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `DTSTART:${dateStr}T140000Z`,
      `DTEND:${dateStr}T150000Z`,
      `LOCATION:${escapeIcs(job.interviewDetails.meetingLink || 'Online Video Call')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Interview_${job.company.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunNegotiation = async (job: JobApplication) => {
    setIsNegotiating(true);
    try {
      const result = await generateNegotiationAdvice({
        candidateName: currentUser?.name || 'Alex Morgan',
        companyName: job.company,
        jobTitle: job.title,
        offeredBase: negotiationForm.offeredBase || job.salary || '$150,000',
        offeredEquity: negotiationForm.offeredEquity || undefined,
        offeredBonus: negotiationForm.offeredBonus || undefined,
        targetBase: negotiationForm.targetBase || '$175,000',
        yearsExperience: '5',
        location: job.location || 'Remote US',
      });
      setNegotiationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsNegotiating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-tr from-amber-500/20 via-violet-600/20 to-cyan-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Kanban className="h-3.5 w-3.5" /> Career Application Command Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Job Application Tracker
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
              Track your recruitment pipeline, analyze job fit with AI match scoring, and prepare for interviews all in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              title={isMounted && emailConnections.length > 0 ? `Connected to ${emailConnections[0].email}` : 'Connect Gmail or Outlook'}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-3 text-xs font-bold text-cyan-200 transition"
            >
              <Mail className="h-4 w-4 text-cyan-400" />
              {isMounted && emailConnections.length > 0
                ? `Connected (${emailConnections[0].email})`
                : 'Connect Email'}
            </button>

            <button
              onClick={() => triggerMailboxSync()}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 px-4 py-3 text-xs font-bold text-violet-200 transition"
            >
              <RefreshCw className={`h-4 w-4 text-violet-400 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Mailbox'}
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 text-slate-950" /> Add Application
            </button>
          </div>
        </div>

        {/* Sync Toast Notification Banner */}
        {syncToastMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 flex items-center justify-between gap-3 text-emerald-200 text-xs font-semibold shadow-lg backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{syncToastMessage}</span>
            </div>
            <button
              onClick={() => setSyncToastMessage(null)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Low Confidence AI Proposal Banner if any */}
        {jobs.some((j) => j.needsConfirmation && j.pendingStatusUpdate) && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-200">AI Status Update Confirmation Needed</div>
                <div className="text-[11px] text-amber-300/80">
                  DevLaunch AI detected application updates with moderate confidence. Review proposals in application details.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Data Clarification Banner */}
        {isMounted && emailConnections.length === 0 && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-950/30 p-3 flex items-center justify-between gap-3 text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-400 shrink-0" />
              <span><strong>Demo — Gmail / Outlook not connected</strong> — Connect to sync real job application emails. Fake syncing is disabled.</span>
            </div>
          </div>
        )}

        {/* Summary cards: Total, Applied, Assessment, Interviews, Offers, Rejected */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-6 pt-4 border-t border-white/10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <span className="text-[11px] font-medium text-slate-400">Total Tracked</span>
            <div className="mt-1 text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3.5">
            <span className="text-[11px] font-medium text-cyan-300">Applied</span>
            <div className="mt-1 text-2xl font-bold text-cyan-200">{stats.applied}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5">
            <span className="text-[11px] font-medium text-amber-300">Assessments</span>
            <div className="mt-1 text-2xl font-bold text-amber-200">{stats.assessment}</div>
          </div>
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3.5">
            <span className="text-[11px] font-medium text-violet-300">Interviews</span>
            <div className="mt-1 text-2xl font-bold text-violet-200">{stats.interview}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
            <span className="text-[11px] font-medium text-emerald-300">Offers</span>
            <div className="mt-1 text-2xl font-bold text-emerald-200">{stats.offer}</div>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5">
            <span className="text-[11px] font-medium text-rose-300">Archived / Rejected</span>
            <div className="mt-1 text-2xl font-bold text-rose-200">{stats.rejected}</div>
          </div>
        </div>
        {isLoadingJobs && (
          <div className="mt-6 flex justify-center text-xs text-slate-400">Loading your jobs from Supabase...</div>
        )}
      </section>

      {/* Free plan job limit banner */}
      {jobLimitReached && (
        <UpgradePrompt
          message={`The Free plan tracks up to ${FREE_LIMITS.jobsTracked} jobs. Upgrade to Pro for unlimited job application tracking, priority Gmail sync, and AI interview prep.`}
          ctaLabel="Upgrade to Pro"
        />
      )}

      {/* Control Bar: View Toggle & Search Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, title, or skills tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="SAVED">SAVED (Wishlist)</option>
            <option value="APPLIED">APPLIED</option>
            <option value="ASSESSMENT">ASSESSMENT</option>
            <option value="INTERVIEW">INTERVIEW</option>
            <option value="FINAL_INTERVIEW">FINAL INTERVIEW</option>
            <option value="OFFER">OFFER</option>
            <option value="ACCEPTED">ACCEPTED 🎯</option>
            <option value="REJECTED">REJECTED</option>
            <option value="WITHDRAWN">WITHDRAWN</option>
          </select>

          {/* Workplace Filter */}
          <select
            value={workplaceFilter}
            onChange={(e) => setWorkplaceFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Workplace Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>

          {(statusFilter !== 'all' || workplaceFilter !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setWorkplaceFilter('all');
                setSearchQuery('');
              }}
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-300 transition"
            >
              Reset Filters
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'kanban' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'table' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Alert Banner */}
      {filteredJobs.length === 0 && jobs.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 flex items-center justify-between gap-4 text-xs text-amber-200">
          <div>
            <strong>Active Filters Applied:</strong> No applications match your current filter selection
            {statusFilter !== 'all' ? ` [Stage: ${statusFilter}]` : ''}
            {workplaceFilter !== 'all' ? ` [Workplace: ${workplaceFilter}]` : ''}
            {searchQuery ? ` [Search: "${searchQuery}"]` : ''}.
          </div>
          <button
            onClick={() => {
              setStatusFilter('all');
              setWorkplaceFilter('all');
              setSearchQuery('');
            }}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shrink-0 shadow"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Main View: Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {(['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'] as JobStatus[]).map((statusKey) => {
            const columnJobs = filteredJobs.filter((j) => {
              if (statusKey === 'SAVED') return j.status === 'SAVED' || j.status === 'wishlist';
              if (statusKey === 'INTERVIEW') return j.status === 'INTERVIEW' || j.status === 'FINAL_INTERVIEW' || j.status === 'interviewing';
              if (statusKey === 'OFFER') return j.status === 'OFFER' || j.status === 'ACCEPTED' || j.status === 'offer';
              if (statusKey === 'REJECTED') return j.status === 'REJECTED' || j.status === 'WITHDRAWN' || j.status === 'rejected';
              if (statusKey === 'APPLIED') return j.status === 'APPLIED' || j.status === 'applied';
              return j.status === statusKey;
            });
            const conf = STAGE_CONFIG[statusKey];

            return (
              <div key={statusKey} className={`flex flex-col rounded-3xl border ${conf.border} ${conf.bg} p-4 backdrop-blur-xl min-w-[300px] max-w-[340px] flex-1 min-h-[500px]`}>
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${conf.dot}`} />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${conf.text}`}>{conf.label}</h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                    {columnJobs.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3">
                  {columnJobs.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                      No jobs in this stage
                    </div>
                  ) : (
                    columnJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => setDetailJob(job)}
                        className="group relative cursor-pointer rounded-2xl border border-white/10 bg-slate-900/90 p-4 transition-all duration-200 hover:border-violet-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-violet-950/30"
                      >
                        {/* Top Header: Company Name & Email Synced Badge */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-wider truncate max-w-[170px]">
                            {job.company}
                          </span>
                          {(job.source === 'email' || (job.emailEvents && job.emailEvents.length > 0)) && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30 shrink-0">
                              <Mail className="h-2.5 w-2.5" /> Email Synced
                            </span>
                          )}
                        </div>

                        {/* Job Title & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-white group-hover:text-violet-300 transition line-clamp-2 leading-snug">
                            {job.title}
                          </h4>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(job)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                              title="Edit application"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-300"
                              title="Delete application"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Salary & Location */}
                        <div className="mt-2.5 space-y-1 text-[11px] text-slate-400">
                          {job.salary && (
                            <div className="flex items-center gap-1.5 text-slate-300 font-semibold truncate">
                              <DollarSign className="h-3 w-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{job.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-400 truncate">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {job.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="rounded-md bg-white/5 px-2 py-0.5 text-[9px] font-medium text-slate-300 border border-white/5">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer Info & Match Badge */}
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 text-slate-400 font-medium">
                            <Clock className="h-3 w-3 text-slate-500" /> {job.appliedDate}
                          </span>

                          {job.matchResult ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 font-bold text-violet-300 border border-violet-500/30">
                              <Sparkles className="h-3 w-3" /> {job.matchResult.matchScore}% Match
                            </span>
                          ) : (
                            <span className="rounded-lg bg-violet-500/10 hover:bg-violet-500/20 px-2 py-1 font-bold text-violet-300 transition border border-violet-500/20">
                              ✨ AI Match
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Main View: Table List */
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company & Role</th>
                  <th className="px-4 py-4">Stage</th>
                  <th className="px-4 py-4">Applicant Contact</th>
                  <th className="px-4 py-4">Workplace</th>
                  <th className="px-4 py-4">Salary Range</th>
                  <th className="px-4 py-4">Date Applied</th>
                  <th className="px-4 py-4">AI Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      No matching job applications found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const conf = STAGE_CONFIG[job.status];
                    return (
                      <tr
                        key={job.id}
                        onClick={() => setDetailJob(job)}
                        className="cursor-pointer hover:bg-white/5 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm text-white">{job.title}</div>
                          <div className="text-violet-400 font-semibold text-xs">{job.company}</div>
                        </td>

                        <td className="px-4 py-4">
                          <select
                            value={job.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStageChange(job.id, e.target.value as JobStatus)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border ${conf?.border || 'border-slate-700'} ${conf?.bg || 'bg-slate-900'} ${conf?.text || 'text-slate-200'} focus:outline-none cursor-pointer`}
                          >
                            <option value="SAVED">Saved / Wishlist</option>
                            <option value="APPLIED">Applied</option>
                            <option value="ASSESSMENT">Assessment</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="FINAL_INTERVIEW">Final Interview</option>
                            <option value="OFFER">Offer Received</option>
                            <option value="ACCEPTED">Accepted 🎯</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="WITHDRAWN">Withdrawn</option>
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-0.5 text-[11px]">
                            {job.applicantEmail ? (
                              <div className="flex items-center gap-1.5 text-slate-200">
                                <Mail className="h-3 w-3 text-violet-400 shrink-0" />
                                <span>{job.applicantEmail}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">—</span>
                            )}
                            {job.applicantPhone && (
                              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                                <Phone className="h-3 w-3 text-cyan-400 shrink-0" />
                                <span>{job.applicantPhone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-medium text-slate-300">
                            {job.workplaceType}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-200 font-medium">
                          {job.salary || '—'}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {job.appliedDate}
                        </td>

                        <td className="px-4 py-4">
                          {job.matchResult ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2.5 py-1 font-bold text-violet-300 border border-violet-500/30 text-[11px]">
                              <Sparkles className="h-3 w-3" /> {job.matchResult.matchScore}%
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Unanalyzed</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEdit(job)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                            title="Edit Job"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 hover:bg-red-500/20"
                            title="Delete Job"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add / Edit Job Application */}
      {isFormOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-violet-400" />
                Back
              </button>
              <h2 className="text-lg font-bold text-white">
                {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
              >
                <span>Close</span> ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Vercel, OpenAI"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pipeline Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="SAVED">Saved / Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="ASSESSMENT">Assessment</option>
                    <option value="INTERVIEW">Interviewing</option>
                    <option value="OFFER">Offer Received</option>
                    <option value="REJECTED">Archived / Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Workplace Type</label>
                  <select
                    value={formData.workplaceType}
                    onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value as WorkplaceType })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Applicant Email (Used for applying)</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={formData.applicantEmail}
                    onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Applicant Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.applicantPhone}
                    onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $160,000 - $200,000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Posting URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/job"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, High Priority, Referral"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  placeholder="Paste job description highlights here for AI matching..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Interview logs, contacts, outreach notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  {editingJob ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Detailed Drawer / AI Assistant Modal */}
      {detailJob && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailJob(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-900 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
            {/* Fixed Header Top Navigation Bar */}
            <div className="flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-6 sm:px-8 py-4 border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setDetailJob(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <ArrowLeft className="h-4 w-4 text-violet-400" />
                <span>← Back to Board</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailJob(null)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-white transition shadow-sm"
              >
                <span>Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

            {/* Modal Header */}
            <div className="space-y-3 pb-6 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-violet-500/20 px-2.5 py-1 text-xs font-bold text-violet-300 border border-violet-500/30">
                  {detailJob.company}
                </span>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {detailJob.workplaceType}
                </span>
                {detailJob.salary && (
                  <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                    {detailJob.salary}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-white">{detailJob.title}</h2>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Current Stage:</span>
                  <select
                    value={detailJob.status}
                    onChange={(e) => handleStageChange(detailJob.id, e.target.value as JobStatus)}
                    className="rounded-xl border border-violet-500/30 bg-violet-950/50 px-3 py-1.5 text-xs font-bold text-violet-200 focus:outline-none cursor-pointer"
                  >
                    <option value="SAVED">Saved / Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="ASSESSMENT">Assessment</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="FINAL_INTERVIEW">Final Interview</option>
                    <option value="OFFER">Offer Received</option>
                    <option value="ACCEPTED">Offer Accepted 🎯</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {detailJob.url && (
                    <a
                      href={detailJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Job Posting
                    </a>
                  )}
                  <button
                    onClick={() => handleGenerateCoverLetter(detailJob)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md"
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Write Cover Letter
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10 pt-4">
              <button
                onClick={() => setDetailTab('overview')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                  detailTab === 'overview'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Overview & Notes
              </button>
              <button
                onClick={() => setDetailTab('ai-match')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                  detailTab === 'ai-match'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Match Analysis
              </button>
              <button
                onClick={() => setDetailTab('ai-prep')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                  detailTab === 'ai-prep'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" /> AI Interview Prep
              </button>
            </div>

            {/* Tab 1 Content: Overview */}
            {detailTab === 'overview' && (
              <div className="py-6 space-y-6 text-xs text-slate-300">
                {/* Low Confidence Proposal Banner */}
                {detailJob.needsConfirmation && detailJob.pendingStatusUpdate && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Status Confirmation Requested
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                       DevLaunch AI parsed an email with subject <strong>&quot;{detailJob.pendingStatusUpdate.emailSubject}&quot;</strong> proposing a status change to <strong>{detailJob.pendingStatusUpdate.proposedStatus}</strong> (Confidence: {detailJob.pendingStatusUpdate.confidence}%).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmStatusUpdate(detailJob.id, true)}
                        className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md"
                      >
                        Accept Status Update
                      </button>
                      <button
                        onClick={() => handleConfirmStatusUpdate(detailJob.id, false)}
                        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-300"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Next Action Recommendation */}
                {detailJob.nextAction && (
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-cyan-300 text-xs">
                        <Zap className="h-4 w-4 text-cyan-400" /> AI Recommended Next Action
                      </div>
                      <button
                        onClick={() => handleDraftFollowUp(detailJob)}
                        disabled={isGeneratingFollowUp}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-3 py-1 text-[11px] font-bold text-white shadow-md transition"
                      >
                        <Send className="h-3 w-3" />
                        {isGeneratingFollowUp ? 'Drafting...' : 'Draft Follow-Up Email'}
                      </button>
                    </div>
                    <p className="text-xs text-cyan-100 font-medium leading-relaxed">
                      {detailJob.nextAction}
                    </p>

                    {/* AI Generated Follow-Up Email Box */}
                    {followUpEmailText && (
                      <div className="mt-3 rounded-xl border border-cyan-500/30 bg-slate-950 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Generated Follow-up Draft</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(followUpEmailText);
                              setIsCopiedFollowUp(true);
                              setTimeout(() => setIsCopiedFollowUp(false), 2000);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white"
                          >
                            {isCopiedFollowUp ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            {isCopiedFollowUp ? 'Copied!' : 'Copy to Clipboard'}
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {followUpEmailText}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Tracking Section */}
                {detailJob.interviewDetails && (
                  <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-violet-300 text-xs uppercase tracking-wider">
                        <Calendar className="h-4 w-4 text-violet-400" /> Interview Schedule & Details
                      </div>
                      <div className="flex items-center gap-2">
                        {detailJob.interviewDetails.date && (
                          <button
                            onClick={() => handleDownloadCalendarInvite(detailJob)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/20 hover:bg-violet-500/30 px-2.5 py-1 text-[10px] font-bold text-violet-200"
                            title="Export Calendar Event (.ics)"
                          >
                            <Download className="h-3 w-3" /> Add to Calendar
                          </button>
                        )}
                        {detailJob.interviewDetails.type && (
                          <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-200">
                            {detailJob.interviewDetails.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400">Scheduled Date</div>
                        <div className="font-bold text-white text-xs">{detailJob.interviewDetails.date || 'TBD'}</div>
                      </div>
                      {detailJob.interviewDetails.meetingLink && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-400">Video Call Link</div>
                          <a
                            href={detailJob.interviewDetails.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-violet-400 hover:underline text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Join Video Interview
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 💰 Offer Negotiation AI Assistant (only for OFFER / ACCEPTED status) */}
                {(detailJob.status === 'OFFER' || detailJob.status === 'offer' || detailJob.status === 'ACCEPTED') && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs uppercase tracking-wider">
                      <DollarSign className="h-4 w-4 text-emerald-400" /> AI Offer Negotiation Assistant
                    </div>
                    <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                      Enter your offer details to get a personalized market comparison, negotiation email draft, and talking points.
                    </p>

                    {/* Negotiation Input Form */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Offered Base Salary</label>
                        <input
                          type="text"
                          value={negotiationForm.offeredBase}
                          onChange={(e) => setNegotiationForm({ ...negotiationForm, offeredBase: e.target.value })}
                          placeholder={detailJob.salary || '$150,000'}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Your Target Base</label>
                        <input
                          type="text"
                          value={negotiationForm.targetBase}
                          onChange={(e) => setNegotiationForm({ ...negotiationForm, targetBase: e.target.value })}
                          placeholder="$175,000"
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Equity (Optional)</label>
                        <input
                          type="text"
                          value={negotiationForm.offeredEquity}
                          onChange={(e) => setNegotiationForm({ ...negotiationForm, offeredEquity: e.target.value })}
                          placeholder="$50,000 RSU over 4 years"
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Sign-On Bonus (Optional)</label>
                        <input
                          type="text"
                          value={negotiationForm.offeredBonus}
                          onChange={(e) => setNegotiationForm({ ...negotiationForm, offeredBonus: e.target.value })}
                          placeholder="$15,000"
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleRunNegotiation(detailJob)}
                      disabled={isNegotiating}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      {isNegotiating ? 'Analyzing Offer...' : 'Generate Negotiation Strategy'}
                    </button>

                    {/* Results */}
                    {negotiationResult && (
                      <div className="space-y-4 pt-2">
                        {/* Risk Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Negotiation Risk:</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            negotiationResult.riskLevel === 'Low'
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                              : negotiationResult.riskLevel === 'Medium'
                              ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                              : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                          }`}>
                            {negotiationResult.riskLevel} Risk
                          </span>
                        </div>

                        {/* Market Analysis */}
                        <div className="rounded-xl border border-emerald-500/20 bg-slate-950 p-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                            <BarChart3 className="h-3 w-3" /> Market Analysis
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{negotiationResult.marketAnalysis}</p>
                        </div>

                        {/* Talking Points */}
                        <div className="rounded-xl border border-white/10 bg-slate-950 p-3">
                          <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Key Talking Points</div>
                          <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                            {negotiationResult.talkingPoints.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Negotiation Email Draft */}
                        <div className="rounded-xl border border-emerald-500/20 bg-slate-950 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Negotiation Email Draft</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(negotiationResult.negotiationEmail);
                                setIsCopiedNegotiation(true);
                                setTimeout(() => setIsCopiedNegotiation(false), 2000);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white"
                            >
                              {isCopiedNegotiation ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              {isCopiedNegotiation ? 'Copied!' : 'Copy Email'}
                            </button>
                          </div>
                          <pre className="text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{negotiationResult.negotiationEmail}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Information Card */}
                <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 space-y-3">
                  <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" /> Candidate & Recruiter Contact
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-900 p-2.5 border border-white/5">
                      <Mail className="h-4 w-4 text-violet-400 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-slate-400">Application Email</div>
                        <div className="font-semibold text-slate-200 truncate">{detailJob.applicantEmail || 'Not specified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-900 p-2.5 border border-white/5">
                      <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-slate-400">Application Phone</div>
                        <div className="font-semibold text-slate-200 truncate">{detailJob.applicantPhone || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                  {detailJob.recruiterEmail && (
                    <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      Recruiter Contact: <span className="font-semibold text-slate-200">{detailJob.recruiterName ? `${detailJob.recruiterName} (${detailJob.recruiterEmail})` : detailJob.recruiterEmail}</span>
                    </div>
                  )}
                </div>

                {/* Status History Timeline */}
                {detailJob.statusHistory && detailJob.statusHistory.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 space-y-3">
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-amber-400" /> Status Pipeline History Timeline
                    </h3>
                    <div className="relative border-l border-white/10 pl-4 space-y-3">
                      {detailJob.statusHistory.map((hist) => (
                        <div key={hist.id} className="relative space-y-1">
                          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-violet-500 ring-4 ring-slate-950" />
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white uppercase">{hist.toStatus}</span>
                            <span className="text-[10px] text-slate-400">{new Date(hist.timestamp).toLocaleDateString()}</span>
                          </div>
                          {hist.emailSubject && (
                            <div className="text-[11px] text-slate-400 italic truncate">
                              &quot;{hist.emailSubject}&quot;
                            </div>
                          )}
                          {hist.aiConfidence && (
                            <div className="text-[10px] text-violet-400 font-semibold">
                              AI Confidence: {hist.aiConfidence}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailJob.description && (
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm mb-2">Job Description Highlights</h3>
                    <p className="rounded-2xl border border-white/10 bg-slate-950 p-4 leading-relaxed whitespace-pre-wrap text-slate-300">
                      {detailJob.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-slate-200 text-sm mb-2">Application Notes</h3>
                  <p className="rounded-2xl border border-white/10 bg-slate-950 p-4 leading-relaxed whitespace-pre-wrap text-slate-400">
                    {detailJob.notes || 'No notes added yet. Use edit to add recruiter contacts, interview dates, or technical questions.'}
                  </p>
                </div>

                {detailJob.tags && detailJob.tags.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {detailJob.tags.map((t, i) => (
                        <span key={i} className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 font-semibold text-violet-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2 Content: AI Match */}
            {detailTab === 'ai-match' && (
              <div className="py-6 space-y-6">
                {!detailJob.matchResult ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-950 p-8 text-center space-y-4">
                    <Sparkles className="mx-auto h-10 w-10 text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="text-base font-bold text-white">Analyze Fit for {detailJob.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        DevLaunch AI will evaluate the job requirements against candidate technical skills to produce a match score and actionable tips.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunMatchAnalysis(detailJob)}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20"
                    >
                      {isAnalyzing ? 'Analyzing Job Fit...' : 'Run AI Match Score'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Score Bar */}
                    <div className="flex items-center justify-between rounded-2xl border border-violet-500/30 bg-slate-950 p-5">
                      <div>
                        <span className="text-xs font-semibold text-violet-300">AI Role Compatibility</span>
                        <div className="text-3xl font-extrabold text-white mt-1">
                          {detailJob.matchResult.matchScore}%
                        </div>
                      </div>
                      <button
                        onClick={() => handleRunMatchAnalysis(detailJob)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                      >
                        Re-analyze
                      </button>
                    </div>

                    {/* Matched Skills & Gaps */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                          <CheckCircle2 className="h-4 w-4" /> Strong Skill Overlaps
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {detailJob.matchResult.matchingSkills.map((s, idx) => (
                            <span key={idx} className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200 border border-emerald-500/30">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                          <TrendingUp className="h-4 w-4" /> Recommended Keywords
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {detailJob.matchResult.missingKeywords.map((s, idx) => (
                            <span key={idx} className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-200 border border-amber-500/30">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 space-y-2">
                      <h4 className="font-bold text-white text-xs">AI Resume Positioning Tips</h4>
                      <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                        {detailJob.matchResult.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3 Content: AI Interview Prep */}
            {detailTab === 'ai-prep' && (
              <div className="py-6 space-y-6">
                {!detailJob.interviewPrep ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-950 p-8 text-center space-y-4">
                    <BrainCircuit className="mx-auto h-10 w-10 text-cyan-400 animate-pulse" />
                    <div>
                      <h3 className="text-base font-bold text-white">Generate Interview Briefing</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Get tailored technical & behavioral interview questions, talking points, and smart questions to ask the interviewer.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunInterviewPrep(detailJob)}
                      disabled={isPrepping}
                      className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/20"
                    >
                      {isPrepping ? 'Building Interview Brief...' : 'Generate AI Interview Prep'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 p-4 text-xs text-cyan-200 leading-relaxed">
                      {detailJob.interviewPrep.summary}
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-bold text-white text-sm">Key Interview Questions & Talking Points</h4>
                      {detailJob.interviewPrep.questions.map((q, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 uppercase">
                              {q.category}
                            </span>
                          </div>
                          <p className="font-bold text-xs text-white">{q.question}</p>
                          <ul className="pl-4 text-xs text-slate-400 list-disc space-y-1">
                            {q.talkingPoints.map((tp, i) => (
                              <li key={i}>{tp}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 space-y-2">
                      <h4 className="font-bold text-white text-xs">Questions to Ask the Hiring Team</h4>
                      <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                        {detailJob.interviewPrep.questionsToAskInterviewer.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation & Close Bar */}
            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDetailJob(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-violet-400" />
                Back to Applications
              </button>
              <button
                type="button"
                onClick={() => setDetailJob(null)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-300 transition"
              >
                Close Modal ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* MODAL 3: Email Connection & Sync Settings Modal */}
      <EmailSyncModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        connections={emailConnections}
        onConnect={handleConnectProvider}
        onDisconnect={handleDisconnectProvider}
        onToggleAutoSync={handleToggleAutoSync}
        onSyncNow={() => triggerMailboxSync()}
        onParsePastedEmail={handleParsePastedEmail}
        isSyncing={isSyncing}
        defaultEmail={currentUser?.email || ''}
      />
    </div>
  );
}
