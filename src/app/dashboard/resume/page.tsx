'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Printer, Plus, Trash2, ArrowUp, ArrowDown, Copy, Share2, Check, RefreshCw, Wand2, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readStorage, writeStorage } from '@/lib/storage';
import { generateSummary, generateBulletPoints, generateProjectDescription, generateSkillsSuggestions, fixGrammarAndTone, generateATSAnalysis } from '@/lib/ai';
import { ResumeData, ResumeRenderer, TEMPLATE_LIST } from '@/components/resume/resume-templates';
import { fetchResume, saveResume } from '@/lib/supabase-documents';
import { useAuth } from '@/components/providers/app-provider';

const DEFAULT_RESUME: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@devlaunch.ai',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/alexmorgan-dev',
    github: 'github.com/alexmorgan-dev',
    portfolio: 'alexmorgan.dev',
  },
  summary: 'Architectural Full Stack Engineer with 5+ years of experience building resilient microservices, reactive user interfaces, and high-performance Web APIs. Proven track record in scaling Node.js & React architectures to 1M+ active users while driving continuous integration velocity.',
  education: [
    {
      id: 'edu-1',
      school: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      location: 'Berkeley, CA',
      dates: '2018 - 2022',
      gpa: '3.85',
    },
    {
      id: 'edu-2',
      school: 'Stanford Executive Tech Institute',
      degree: 'Advanced Distributed Systems Certification',
      location: 'Stanford, CA',
      dates: '2023',
      gpa: '4.0',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Full Stack Engineer',
      company: 'Vercel Ecosystem Labs',
      location: 'San Francisco, CA',
      dates: '2022 - Present',
      bullets: [
        'Architected real-time dynamic dashboard pipelines serving 500k+ daily API requests using Next.js App Router and PostgreSQL.',
        'Engineered responsive component library in Tailwind CSS & TypeScript, reducing frontend render latencies by 42%.',
        'Implemented automated CI/CD deployment pipelines on Vercel with comprehensive Playwright E2E coverage.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Frontend Engineer',
      company: 'Linear Systems',
      location: 'Remote',
      dates: '2020 - 2022',
      bullets: [
        'Developed real-time drag-and-drop workflow canvases with Framer Motion and Zustand state synchronization.',
        'Collaborated with product designers to introduce dark mode glassmorphic UI patterns across 14 enterprise modules.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevLaunch AI Career Suite',
      techStack: 'Next.js 16, TypeScript, Supabase, OpenAI, Tailwind',
      description: 'Production SaaS application powering AI resume building, portfolio publishing, and ATS score optimization.',
    },
    {
      id: 'proj-2',
      title: 'Distributed Event Bus Middleware',
      techStack: 'Node.js, Redis, Docker, PostgreSQL',
      description: 'High-throughput asynchronous message processing engine handling 10,000+ events/sec with zero message loss.',
    },
    {
      id: 'proj-3',
      title: 'AI Code Reviewer Bot',
      techStack: 'Python, FastAPI, OpenAI API, GitHub Webhooks',
      description: 'Automated Pull Request reviewer inspecting TypeScript and Python diffs for anti-patterns and memory leaks.',
    },
    {
      id: 'proj-4',
      title: 'Real-time Collaborative Canvas',
      techStack: 'React, WebSockets, Canvas API, Tailwind',
      description: 'Vector-based collaborative whiteboard app supporting multi-cursor live interaction and local persistence.',
    },
  ],
  skills: [
    { category: 'Frontend', items: 'React, Next.js, TypeScript, Tailwind CSS, Redux Toolkit, HTML5/CSS3' },
    { category: 'Backend & Cloud', items: 'Node.js, Express, PostgreSQL, Prisma, Supabase, Docker, REST APIs, GraphQL' },
    { category: 'Developer Tools', items: 'Git, GitHub Actions, Vercel, Jest, Cypress, Vite, Webpack' },
  ],
  certificates: [
    { id: 'cert-1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
    { id: 'cert-2', name: 'CKAD: Certified Kubernetes Application Developer', issuer: 'CNCF / Linux Foundation', date: '2024' },
  ],
  achievements: [
    { id: 'ach-1', title: '1st Place Winner', organization: 'SF Tech Hackathon', date: '2023', description: 'Built an AI developer productivity tool in 24 hours.' },
    { id: 'ach-2', title: 'Open Source Contributor of the Year', organization: 'React Ecosystem Community', date: '2024', description: 'Maintained 5 popular UI utility packages with over 100k downloads.' },
  ],
  languages: [
    { language: 'English', proficiency: 'Native / Fluent' },
    { language: 'Spanish', proficiency: 'Intermediate' },
  ],
  interests: ['Open Source Software', 'System Design', 'AI Engineering', 'Bouldering'],
  references: [],
};

export default function ResumeBuilderPage() {
  const auth = useAuth();
  const currentUser = auth?.user;
  
  const [resume, setResume] = useState<ResumeData>(DEFAULT_RESUME);
  const [isSavingResume, setIsSavingResume] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchResume(currentUser.id)
      .then(data => {
        if (data) setResume(data);
      })
      .catch(err => console.error('Failed to load resume', err));
  }, [currentUser]);
  const [templateId, setTemplateId] = useState<string>(() => readStorage<string>('current_template', 'modern'));
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'ai'>('editor');
  const [sectionFilter, setSectionFilter] = useState<'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'extras'>('personal');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [resumesList, setResumesList] = useState<Array<{ id: string; name: string }>>([
    { id: 'res-default', name: 'Full Stack Engineer Resume' },
    { id: 'res-frontend', name: 'Frontend Tech Lead Resume' },
  ]);

  const updateResume = (next: ResumeData) => {
    setResume(next);
    // writeStorage('current_resume', next); // Migrated to Supabase manual save
  };

  const handleSaveToCloud = async () => {
    if (!currentUser?.id) {
      alert('Please log in to save your resume to the cloud.');
      return;
    }
    setIsSavingResume(true);
    try {
      await saveResume(currentUser.id, resume);
      alert('Resume saved to Supabase successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save resume.');
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    writeStorage('current_template', id);
  };

  const handleAiSummary = async () => {
    setIsAiLoading(true);
    try {
      const summaryText = await generateSummary(
        resume.personalInfo.fullName,
        resume.experience[0]?.role || 'Software Engineer',
        resume.skills.flatMap(s => s.items.split(','))
      );
      updateResume({ ...resume, summary: summaryText });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiBullets = async (expId: string) => {
    setIsAiLoading(true);
    try {
      const targetExp = resume.experience.find(e => e.id === expId);
      if (!targetExp) return;
      const bullets = await generateBulletPoints(targetExp.role, targetExp.bullets.join(' '));
      const updatedExp = resume.experience.map(e => e.id === expId ? { ...e, bullets } : e);
      updateResume({ ...resume, experience: updatedExp });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGrammarFix = async () => {
    setIsAiLoading(true);
    try {
      const fixedSummary = await fixGrammarAndTone(resume.summary, 'Executive');
      updateResume({ ...resume, summary: fixedSummary });
    } finally {
      setIsAiLoading(false);
    }
  };

  const fullResumeText = `${resume.personalInfo.fullName} ${resume.summary} ${resume.experience.map(e => e.role + ' ' + e.bullets.join(' ')).join(' ')} ${resume.skills.map(s => s.items).join(' ')}`;
  let atsAnalysis;
  try {
    atsAnalysis = generateATSAnalysis(fullResumeText);
  } catch {
    atsAnalysis = {
      overallScore: 0,
      keywordMatch: 0,
      formatting: 'Unconfigured',
      skillsMatch: 'AI Service Required',
      readability: 'Unconfigured',
      suggestions: ['AI service is not configured. Please set a valid OPENAI_API_KEY.'],
      missingKeywords: [],
    };
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDuplicate = () => {
    const newName = `${resume.personalInfo.fullName || 'Resume'} (Copy)`;
    const newId = `res-${Date.now()}`;
    setResumesList([...resumesList, { id: newId, name: newName }]);
    alert('Resume draft duplicated successfully!');
  };

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> AI Resume Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mt-1">AI Resume Builder</h1>
          <p className="text-xs text-slate-400">Craft ATS-optimized resumes with {TEMPLATE_LIST.length} modern templates, interactive section editor, and OpenAI assistance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleSaveToCloud} disabled={isSavingResume} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs hover:bg-emerald-500/20 text-emerald-300">
            <Printer className="mr-1.5 h-4 w-4" /> {isSavingResume ? 'Saving...' : 'Save to Cloud'}
          </Button>
          <Button onClick={handlePrint} className="rounded-xl border border-white/10 bg-white/10 text-xs hover:bg-white/20">
            <Download className="mr-1.5 h-4 w-4 text-emerald-400" /> Export PDF
          </Button>
          <Button onClick={handlePrint} className="rounded-xl border border-white/10 bg-white/10 text-xs hover:bg-white/20">
            <Printer className="mr-1.5 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDuplicate} className="rounded-xl border border-white/10 bg-white/10 text-xs hover:bg-white/20">
            <Copy className="mr-1.5 h-4 w-4" /> Duplicate
          </Button>
          <Button onClick={handleAiSummary} disabled={isAiLoading} className="rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white shadow-lg shadow-violet-600/30">
            <Wand2 className="mr-1.5 h-4 w-4" /> {isAiLoading ? 'AI Working...' : 'AI Enhance'}
          </Button>
        </div>
      </div>

      {/* ATS Score Indicator */}
      <div className="grid gap-4 sm:grid-cols-4 print:hidden">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">ATS Score</p>
            <p className="text-2xl font-bold text-emerald-400">{atsAnalysis.overallScore} / 100</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
          <p className="text-xs text-slate-400">Keyword Coverage</p>
          <p className="text-xl font-semibold text-white mt-1">{atsAnalysis.keywordMatch}%</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
          <p className="text-xs text-slate-400">Formatting</p>
          <p className="text-xl font-semibold text-cyan-400 mt-1">{atsAnalysis.formatting}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
          <p className="text-xs text-slate-400">Selected Template</p>
          <p className="text-xl font-semibold text-violet-300 mt-1 capitalize">{templateId}</p>
        </div>
      </div>

      {/* Workspace */}
      <div className="grid gap-6 xl:grid-cols-12 print:block">
        {/* Form & Controls (5 cols) */}
        <div className="xl:col-span-5 space-y-6 print:hidden">
          <div className="flex rounded-2xl bg-slate-950/70 p-1 border border-white/10">
            {[
              { id: 'editor', label: 'Form Editor' },
              { id: 'templates', label: `Templates (${TEMPLATE_LIST.length})` },
              { id: 'ai', label: 'AI Writing Assistant' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'editor' | 'templates' | 'ai')}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  activeTab === tab.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'editor' && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-6">
              {/* Section Filters */}
              <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-4">
                {[
                  { id: 'personal', label: 'Personal Info' },
                  { id: 'summary', label: 'Summary' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'education', label: 'Education' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'skills', label: 'Skills' },
                  { id: 'extras', label: 'Certificates & More' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSectionFilter(sec.id as 'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'extras')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      sectionFilter === sec.id ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* 1. Personal Contact Info */}
              {sectionFilter === 'personal' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Personal Contact Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Full Name</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={resume.personalInfo.fullName}
                        onChange={(e) => updateResume({ ...resume, personalInfo: { ...resume.personalInfo, fullName: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Email Address</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={resume.personalInfo.email}
                        onChange={(e) => updateResume({ ...resume, personalInfo: { ...resume.personalInfo, email: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Phone</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={resume.personalInfo.phone}
                        onChange={(e) => updateResume({ ...resume, personalInfo: { ...resume.personalInfo, phone: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Location</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={resume.personalInfo.location}
                        onChange={(e) => updateResume({ ...resume, personalInfo: { ...resume.personalInfo, location: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">LinkedIn Profile</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={resume.personalInfo.linkedIn}
                        onChange={(e) => updateResume({ ...resume, personalInfo: { ...resume.personalInfo, linkedIn: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">GitHub Profile</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={resume.personalInfo.github}
                        onChange={(e) => updateResume({ ...resume, personalInfo: { ...resume.personalInfo, github: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Professional Summary */}
              {sectionFilter === 'summary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Professional Summary</h3>
                    <Button onClick={handleAiSummary} disabled={isAiLoading} size="sm" className="h-7 text-[11px] bg-violet-600 text-white">
                      <Wand2 className="mr-1 h-3 w-3" /> Auto Generate
                    </Button>
                  </div>
                  <textarea
                    rows={5}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none leading-relaxed"
                    value={resume.summary}
                    onChange={(e) => updateResume({ ...resume, summary: e.target.value })}
                  />
                </div>
              )}

              {/* 3. Work Experience */}
              {sectionFilter === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Work Experience ({resume.experience.length})</h3>
                    <Button
                      onClick={() => {
                        const newExp = {
                          id: `exp-${Date.now()}`,
                          role: 'Software Engineer',
                          company: 'Tech Corp',
                          location: 'San Francisco, CA',
                          dates: '2023 - Present',
                          bullets: ['Engineered scalable microservices and reactive UI components.'],
                        };
                        updateResume({ ...resume, experience: [newExp, ...resume.experience] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Position
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {resume.experience.map((exp, idx) => (
                      <div key={exp.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-violet-300">Job #{idx + 1}</span>
                          <button
                            onClick={() => updateResume({ ...resume, experience: resume.experience.filter(e => e.id !== exp.id) })}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Job Title"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = resume.experience.map(item => item.id === exp.id ? { ...item, role: e.target.value } : item);
                              updateResume({ ...resume, experience: updated });
                            }}
                          />
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = resume.experience.map(item => item.id === exp.id ? { ...item, company: e.target.value } : item);
                              updateResume({ ...resume, experience: updated });
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[11px] text-slate-400">Bullet Points (1 per line)</span>
                          <button
                            onClick={() => handleAiBullets(exp.id)}
                            className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1"
                          >
                            <Wand2 className="h-3 w-3" /> AI Bullets
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-xs text-white"
                          value={exp.bullets.join('\n')}
                          onChange={(e) => {
                            const bullets = e.target.value.split('\n');
                            const updated = resume.experience.map(item => item.id === exp.id ? { ...item, bullets } : item);
                            updateResume({ ...resume, experience: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Education (Full Interactive Editing) */}
              {sectionFilter === 'education' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Education ({resume.education.length})</h3>
                    <Button
                      onClick={() => {
                        const newEdu = {
                          id: `edu-${Date.now()}`,
                          school: 'University Name',
                          degree: 'B.S. Computer Science',
                          location: 'Location',
                          dates: '2020 - 2024',
                          gpa: '3.9',
                        };
                        updateResume({ ...resume, education: [...resume.education, newEdu] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Degree
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {resume.education.map((edu, idx) => (
                      <div key={edu.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-cyan-300">Degree #{idx + 1}</span>
                          <button
                            onClick={() => updateResume({ ...resume, education: resume.education.filter(e => e.id !== edu.id) })}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Degree & Major"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = resume.education.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item);
                              updateResume({ ...resume, education: updated });
                            }}
                          />
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="School / University"
                            value={edu.school}
                            onChange={(e) => {
                              const updated = resume.education.map(item => item.id === edu.id ? { ...item, school: e.target.value } : item);
                              updateResume({ ...resume, education: updated });
                            }}
                          />
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Dates (e.g. 2018 - 2022)"
                            value={edu.dates}
                            onChange={(e) => {
                              const updated = resume.education.map(item => item.id === edu.id ? { ...item, dates: e.target.value } : item);
                              updateResume({ ...resume, education: updated });
                            }}
                          />
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="GPA (Optional)"
                            value={edu.gpa || ''}
                            onChange={(e) => {
                              const updated = resume.education.map(item => item.id === edu.id ? { ...item, gpa: e.target.value } : item);
                              updateResume({ ...resume, education: updated });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Featured Projects (Full Interactive Editing) */}
              {sectionFilter === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Projects ({resume.projects.length})</h3>
                    <Button
                      onClick={() => {
                        const newProj = {
                          id: `proj-${Date.now()}`,
                          title: 'New Featured Project',
                          techStack: 'React, TypeScript, Node.js',
                          description: 'Description of key architectural achievements and technology stack used.',
                        };
                        updateResume({ ...resume, projects: [...resume.projects, newProj] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Project
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {resume.projects.map((proj, idx) => (
                      <div key={proj.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-violet-300">Project #{idx + 1}</span>
                          <button
                            onClick={() => updateResume({ ...resume, projects: resume.projects.filter(p => p.id !== proj.id) })}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Project Title"
                            value={proj.title}
                            onChange={(e) => {
                              const updated = resume.projects.map(p => p.id === proj.id ? { ...p, title: e.target.value } : p);
                              updateResume({ ...resume, projects: updated });
                            }}
                          />
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Tech Stack (e.g. Next.js, PostgreSQL)"
                            value={proj.techStack}
                            onChange={(e) => {
                              const updated = resume.projects.map(p => p.id === proj.id ? { ...p, techStack: e.target.value } : p);
                              updateResume({ ...resume, projects: updated });
                            }}
                          />
                        </div>
                        <textarea
                          rows={2}
                          className="w-full rounded-xl border border-white/10 bg-slate-900 p-2.5 text-xs text-white"
                          placeholder="Project summary and impact..."
                          value={proj.description}
                          onChange={(e) => {
                            const updated = resume.projects.map(p => p.id === proj.id ? { ...p, description: e.target.value } : p);
                            updateResume({ ...resume, projects: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Skills */}
              {sectionFilter === 'skills' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Skills & Technologies</h3>
                  {resume.skills.map((skillGroup, idx) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                      <input
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-violet-300"
                        value={skillGroup.category}
                        onChange={(e) => {
                          const updated = [...resume.skills];
                          updated[idx].category = e.target.value;
                          updateResume({ ...resume, skills: updated });
                        }}
                      />
                      <input
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                        placeholder="Comma separated skills (e.g. React, TypeScript, Node.js)"
                        value={skillGroup.items}
                        onChange={(e) => {
                          const updated = [...resume.skills];
                          updated[idx].items = e.target.value;
                          updateResume({ ...resume, skills: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 7. Certificates & Extras */}
              {sectionFilter === 'extras' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Certificates & Certifications</h3>
                  {resume.certificates.map((cert, idx) => (
                    <div key={cert.id} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          placeholder="Certificate Name"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = resume.certificates.map(c => c.id === cert.id ? { ...c, name: e.target.value } : c);
                            updateResume({ ...resume, certificates: updated });
                          }}
                        />
                        <input
                          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          placeholder="Issuer (e.g. AWS, CNCF)"
                          value={cert.issuer}
                          onChange={(e) => {
                            const updated = resume.certificates.map(c => c.id === cert.id ? { ...c, issuer: e.target.value } : c);
                            updateResume({ ...resume, certificates: updated });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-sm font-semibold text-white mb-2">Select From {TEMPLATE_LIST.length} Resume Templates</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATE_LIST.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateChange(tpl.id)}
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      templateId === tpl.id
                        ? 'border-violet-500 bg-violet-500/20 text-white shadow-lg shadow-violet-500/20'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{tpl.name}</span>
                      {templateId === tpl.id && <Check className="h-4 w-4 text-violet-400" />}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{tpl.style}</p>
                    <span className="mt-2 inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                      {tpl.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai' && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-semibold text-white">AI Writing & ATS Optimization</h3>
              <div className="space-y-3">
                <button
                  onClick={handleAiSummary}
                  disabled={isAiLoading}
                  className="w-full flex items-center justify-between rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-200 hover:bg-violet-500/20 transition"
                >
                  <span className="flex items-center gap-2"><Wand2 className="h-4 w-4 text-violet-400" /> Rewrite Professional Summary</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleAiGrammarFix}
                  disabled={isAiLoading}
                  className="w-full flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-200 hover:bg-cyan-500/20 transition"
                >
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-400" /> Grammar & Executive Tone Polish</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
                <p className="font-semibold text-white">ATS Recommendations</p>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {atsAnalysis.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Live Resume Preview (7 cols) */}
        <div className="xl:col-span-7 print:w-full">
          <div className="sticky top-6 rounded-3xl border border-white/10 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl shadow-2xl print:border-none print:shadow-none print:bg-transparent print:p-0">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 print:hidden">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-400" /> Live Resume Preview ({templateId})
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] text-emerald-300 font-medium">
                Auto-saved
              </span>
            </div>

            <div id="resume-print-area" className="overflow-x-auto print:overflow-visible print:w-full print:max-w-none">
              <ResumeRenderer data={resume} templateId={templateId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
