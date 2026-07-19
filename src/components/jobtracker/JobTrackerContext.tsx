/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/* ──────────────────────────── Types ──────────────────────────── */

export type LocationType = "Remote" | "Hybrid" | "Onsite";

export type JobStatus =
  | "Wishlist"
  | "Applied"
  | "OA Received"
  | "Interview"
  | "HR Round"
  | "Technical Round"
  | "Offer"
  | "Rejected"
  | "Accepted";

export type InterviewRound = "HR" | "Technical" | "System Design" | "Behavioral" | "Coding" | "Managerial";
export type InterviewResult = "Passed" | "Failed" | "Pending";

export type Job = {
  id: string;
  company: string;
  role: string;
  salary?: string;
  location?: string;
  locationType: LocationType;
  jobLink?: string;
  referral?: string;
  status: JobStatus;
  appliedDate: string;
  deadline?: string;
  notes?: string;
};

export type Interview = {
  id: string;
  jobId: string;
  company: string;
  role: string;
  date: string;
  time: string;
  round: InterviewRound;
  feedback?: string;
  score?: number;
  result: InterviewResult;
};

export type Document = {
  id: string;
  name: string;
  type: "Resume" | "Cover Letter" | "Certificate" | "Offer Letter" | "Portfolio Link";
  company?: string;
  uploadedAt: string;
  isActive?: boolean;
  url?: string;
};

/* ──────────────────────────── Seed Data ──────────────────────── */

const seedJobs: Job[] = [
  {
    id: "j1",
    company: "Google",
    role: "Frontend Developer",
    salary: "₹18,00,000",
    location: "Bangalore",
    locationType: "Hybrid",
    jobLink: "https://careers.google.com/jobs/123",
    referral: "Priya Sharma",
    status: "Interview",
    appliedDate: "2026-06-15",
    deadline: "2026-07-20",
    notes: "Referral from senior engineer. Need to brush up on System Design.",
  },
  {
    id: "j2",
    company: "Amazon",
    role: "SDE 1",
    salary: "₹24,00,000",
    location: "Hyderabad",
    locationType: "Onsite",
    status: "Wishlist",
    appliedDate: "2026-07-12",
    notes: "Job listing found on LinkedIn. Focuses heavily on Data Structures.",
  },
  {
    id: "j3",
    company: "Microsoft",
    role: "Software Engineer",
    salary: "₹22,00,000",
    location: "Noida",
    locationType: "Hybrid",
    status: "Offer",
    appliedDate: "2026-06-01",
    notes: "Final loop completed. Received official offer letter on June 28th.",
  },
  {
    id: "j4",
    company: "Meta",
    role: "React Developer",
    salary: "₹28,00,000",
    location: "Remote",
    locationType: "Remote",
    jobLink: "https://metacareers.com/jobs/456",
    status: "Applied",
    appliedDate: "2026-07-05",
    deadline: "2026-07-25",
  },
  {
    id: "j5",
    company: "Infosys",
    role: "Systems Engineer",
    salary: "₹6,50,000",
    location: "Pune",
    locationType: "Onsite",
    status: "Rejected",
    appliedDate: "2026-05-20",
    notes: "Rejected after aptitude round.",
  },
  {
    id: "j6",
    company: "TCS",
    role: "Assistant Systems Engineer",
    salary: "₹7,00,000",
    location: "Chennai",
    locationType: "Onsite",
    status: "Accepted",
    appliedDate: "2026-04-10",
    notes: "NQT qualified. Joining date: August 2026.",
  },
  {
    id: "j7",
    company: "Netflix",
    role: "UI Engineer",
    salary: "₹35,00,000",
    location: "Remote",
    locationType: "Remote",
    status: "OA Received",
    appliedDate: "2026-07-08",
    deadline: "2026-07-18",
    notes: "Online assessment link received. 90 min DSA + System Design.",
  },
  {
    id: "j8",
    company: "Accenture",
    role: "Full Stack Developer",
    salary: "₹8,00,000",
    location: "Mumbai",
    locationType: "Hybrid",
    status: "HR Round",
    appliedDate: "2026-06-22",
    notes: "Technical round cleared. HR discussion on salary.",
  },
  {
    id: "j9",
    company: "Flipkart",
    role: "SDE 2",
    salary: "₹30,00,000",
    location: "Bangalore",
    locationType: "Hybrid",
    status: "Technical Round",
    appliedDate: "2026-06-28",
    deadline: "2026-07-22",
    notes: "DSA round cleared. System Design round scheduled.",
  },
];

const seedInterviews: Interview[] = [
  {
    id: "i1",
    jobId: "j1",
    company: "Google",
    role: "Frontend Developer",
    date: "2026-07-18",
    time: "10:30 AM",
    round: "Technical",
    result: "Pending",
  },
  {
    id: "i2",
    jobId: "j9",
    company: "Flipkart",
    role: "SDE 2",
    date: "2026-07-20",
    time: "2:00 PM",
    round: "System Design",
    result: "Pending",
  },
  {
    id: "i3",
    jobId: "j8",
    company: "Accenture",
    role: "Full Stack Developer",
    date: "2026-07-15",
    time: "11:00 AM",
    round: "HR",
    feedback: "Good communication. Salary negotiation pending.",
    score: 8,
    result: "Passed",
  },
  {
    id: "i4",
    jobId: "j3",
    company: "Microsoft",
    role: "Software Engineer",
    date: "2026-06-25",
    time: "3:00 PM",
    round: "Behavioral",
    feedback: "Strong STAR responses. Demonstrated leadership qualities.",
    score: 9,
    result: "Passed",
  },
];

const seedDocuments: Document[] = [
  {
    id: "d1",
    name: "Resume_v3_July2026.pdf",
    type: "Resume",
    uploadedAt: "2026-07-10",
    isActive: true,
  },
  {
    id: "d2",
    name: "Resume_v2_June2026.pdf",
    type: "Resume",
    uploadedAt: "2026-06-15",
    isActive: false,
  },
  {
    id: "d3",
    name: "Google_Cover_Letter.pdf",
    type: "Cover Letter",
    company: "Google",
    uploadedAt: "2026-06-14",
  },
  {
    id: "d4",
    name: "AWS_Cloud_Practitioner.pdf",
    type: "Certificate",
    uploadedAt: "2026-05-20",
  },
  {
    id: "d5",
    name: "Microsoft_Offer.pdf",
    type: "Offer Letter",
    company: "Microsoft",
    uploadedAt: "2026-06-28",
  },
  {
    id: "d6",
    name: "https://github.com/rohitha",
    type: "Portfolio Link",
    url: "https://github.com/rohitha",
    uploadedAt: "2026-07-01",
  },
  {
    id: "d7",
    name: "https://linkedin.com/in/rohitha",
    type: "Portfolio Link",
    url: "https://linkedin.com/in/rohitha",
    uploadedAt: "2026-07-01",
  },
];

/* ──────────────────────────── Context ──────────────────────────── */

type JobTrackerContextType = {
  jobs: Job[];
  interviews: Interview[];
  documents: Document[];
  tier: "free" | "pro";
  searchQuery: string;
  locationFilter: LocationType | "All";
  statusFilter: JobStatus | "All";
  setSearchQuery: (q: string) => void;
  setLocationFilter: (f: LocationType | "All") => void;
  setStatusFilter: (f: JobStatus | "All") => void;
  addJob: (job: Omit<Job, "id">) => Promise<void>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  addInterview: (interview: Omit<Interview, "id">) => Promise<void>;
  updateInterview: (id: string, updates: Partial<Interview>) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;
  addDocument: (doc: Omit<Document, "id">) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setActiveResume: (id: string) => Promise<void>;
  filteredJobs: Job[];
};

const JobTrackerContext = createContext<JobTrackerContextType | null>(null);

export function useJobTracker() {
  const ctx = useContext(JobTrackerContext);
  if (!ctx) throw new Error("useJobTracker must be used within JobTrackerProvider");
  return ctx;
}

export function JobTrackerProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [interviews, setInterviews] = useState<Interview[]>(seedInterviews);
  const [documents, setDocuments] = useState<Document[]>(seedDocuments);
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<LocationType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");

  // Load from Supabase on mount
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (session?.user) {
          const userId = session.user.id;

          // Fetch User Profile for Tier
          supabase!
            .from("profiles")
            .select("tier")
            .eq("id", userId)
            .single()
            .then(({ data }: any) => {
              if (data?.tier) setTier(data.tier);
            });

          // Fetch Jobs
          supabase!
            .from("jobs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })
            .then(({ data }: any) => {
              if (data && data.length > 0) {
                setJobs(
                  data.map((j: any) => ({
                    id: j.id,
                    company: j.company,
                    role: j.role,
                    salary: j.salary,
                    location: j.location,
                    locationType: j.location_type as LocationType,
                    jobLink: j.job_link,
                    referral: j.referral,
                    status: j.status as JobStatus,
                    appliedDate: j.applied_date,
                    deadline: j.deadline,
                    notes: j.notes,
                  }))
                );
              }
            });

          // Fetch Interviews
          supabase!
            .from("interviews")
            .select("*")
            .eq("user_id", userId)
            .then(({ data }: any) => {
              if (data && data.length > 0) {
                setInterviews(
                  data.map((i: any) => ({
                    id: i.id,
                    jobId: i.job_id,
                    company: i.company,
                    role: i.role,
                    date: i.date,
                    time: i.time,
                    round: i.round as InterviewRound,
                    feedback: i.feedback,
                    score: i.score,
                    result: i.result as InterviewResult,
                  }))
                );
              }
            });

          // Fetch Documents
          supabase!
            .from("documents")
            .select("*")
            .eq("user_id", userId)
            .then(({ data }: any) => {
              if (data && data.length > 0) {
                setDocuments(
                  data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    type: d.type as Document["type"],
                    company: d.company,
                    uploadedAt: d.uploaded_at,
                    isActive: d.is_active,
                    url: d.url,
                  }))
                );
              }
            });
        }
      });
    }
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      !searchQuery ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLocation = locationFilter === "All" || job.locationType === locationFilter;
    const matchStatus = statusFilter === "All" || job.status === statusFilter;
    return matchSearch && matchLocation && matchStatus;
  });

  const addJob = async (job: Omit<Job, "id">) => {
    const tempId = `j${Date.now()}`;
    setJobs((prev) => [...prev, { ...job, id: tempId }]);

    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("jobs")
          .insert([
            {
              user_id: session.user.id,
              company: job.company,
              role: job.role,
              salary: job.salary,
              location: job.location,
              location_type: job.locationType,
              job_link: job.jobLink,
              referral: job.referral,
              status: job.status,
              applied_date: job.appliedDate,
              deadline: job.deadline,
              notes: job.notes,
            },
          ])
          .select();

        if (error) {
          console.error("Supabase Add Job Error:", error);
        } else if (data && data[0]) {
          setJobs((prev) => prev.map((j) => (j.id === tempId ? { ...job, id: data[0].id } : j)));
        }
      }
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));

    if (isSupabaseConfigured() && supabase && !id.startsWith("j")) {
      const dbUpdates: any = {};
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.salary !== undefined) dbUpdates.salary = updates.salary;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.locationType !== undefined) dbUpdates.location_type = updates.locationType;
      if (updates.jobLink !== undefined) dbUpdates.job_link = updates.jobLink;
      if (updates.referral !== undefined) dbUpdates.referral = updates.referral;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.appliedDate !== undefined) dbUpdates.applied_date = updates.appliedDate;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase.from("jobs").update(dbUpdates).eq("id", id);
      if (error) {
        console.error("Supabase Update Job Error:", error);
      }
    }
  };

  const deleteJob = async (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));

    if (isSupabaseConfigured() && supabase && !id.startsWith("j")) {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) {
        console.error("Supabase Delete Job Error:", error);
      }
    }
  };

  const addInterview = async (interview: Omit<Interview, "id">) => {
    const tempId = `i${Date.now()}`;
    setInterviews((prev) => [...prev, { ...interview, id: tempId }]);

    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("interviews")
          .insert([
            {
              user_id: session.user.id,
              job_id: interview.jobId.startsWith("j") ? null : interview.jobId,
              company: interview.company,
              role: interview.role,
              date: interview.date,
              time: interview.time,
              round: interview.round,
              feedback: interview.feedback,
              score: interview.score,
              result: interview.result,
            },
          ])
          .select();

        if (error) {
          console.error("Supabase Add Interview Error:", error);
        } else if (data && data[0]) {
          setInterviews((prev) =>
            prev.map((i) => (i.id === tempId ? { ...interview, id: data[0].id } : i))
          );
        }
      }
    }
  };

  const updateInterview = async (id: string, updates: Partial<Interview>) => {
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));

    if (isSupabaseConfigured() && supabase && !id.startsWith("i")) {
      const dbUpdates: any = {};
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.round !== undefined) dbUpdates.round = updates.round;
      if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
      if (updates.score !== undefined) dbUpdates.score = updates.score;
      if (updates.result !== undefined) dbUpdates.result = updates.result;

      const { error } = await supabase.from("interviews").update(dbUpdates).eq("id", id);
      if (error) {
        console.error("Supabase Update Interview Error:", error);
      }
    }
  };

  const deleteInterview = async (id: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));

    if (isSupabaseConfigured() && supabase && !id.startsWith("i")) {
      const { error } = await supabase.from("interviews").delete().eq("id", id);
      if (error) {
        console.error("Supabase Delete Interview Error:", error);
      }
    }
  };

  const addDocument = async (doc: Omit<Document, "id">) => {
    const tempId = `d${Date.now()}`;
    setDocuments((prev) => [...prev, { ...doc, id: tempId }]);

    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("documents")
          .insert([
            {
              user_id: session.user.id,
              name: doc.name,
              type: doc.type,
              company: doc.company,
              uploaded_at: doc.uploadedAt,
              is_active: doc.isActive,
              url: doc.url,
            },
          ])
          .select();

        if (error) {
          console.error("Supabase Add Document Error:", error);
        } else if (data && data[0]) {
          setDocuments((prev) =>
            prev.map((d) => (d.id === tempId ? { ...doc, id: data[0].id } : d))
          );
        }
      }
    }
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    if (isSupabaseConfigured() && supabase && !id.startsWith("d")) {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) {
        console.error("Supabase Delete Document Error:", error);
      }
    }
  };

  const setActiveResume = async (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.type === "Resume" ? { ...d, isActive: d.id === id } : d))
    );

    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Set all resumes to false
        await supabase
          .from("documents")
          .update({ is_active: false })
          .eq("user_id", session.user.id)
          .eq("type", "Resume");

        // Set selected to true
        if (!id.startsWith("d")) {
          await supabase.from("documents").update({ is_active: true }).eq("id", id);
        }
      }
    }
  };

  return (
    <JobTrackerContext.Provider
      value={{
        jobs,
        interviews,
        documents,
        tier,
        searchQuery,
        locationFilter,
        statusFilter,
        setSearchQuery,
        setLocationFilter,
        setStatusFilter,
        addJob,
        updateJob,
        deleteJob,
        addInterview,
        updateInterview,
        deleteInterview,
        addDocument,
        deleteDocument,
        setActiveResume,
        filteredJobs,
      }}
    >
      {children}
    </JobTrackerContext.Provider>
  );
}
