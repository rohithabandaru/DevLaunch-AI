'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Share2, Plus, Trash2, Check, ExternalLink, Laptop, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readStorage, writeStorage } from '@/lib/storage';
import { PortfolioData, PORTFOLIO_THEMES, PortfolioThemeRenderer } from '@/components/portfolio/portfolio-themes';
import { fetchPortfolio, savePortfolio } from '@/lib/supabase-portfolios';
import { useAuth } from '@/components/providers/app-provider';

const DEFAULT_PORTFOLIO: PortfolioData = {
  hero: {
    name: 'Alex Morgan',
    title: 'Senior Full Stack Engineer & UI Architect',
    tagline: 'Specializing in reactive frontend systems, high-throughput microservices, and AI-assisted workflows.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  about: {
    bio: 'Over 5+ years of experience shipping production web applications. Passionate about developer tooling, design systems, and cloud infrastructure.',
    yearsOfExperience: '5+ Years',
    location: 'San Francisco, CA',
  },
  skills: [
    { name: 'TypeScript', level: 'Expert', category: 'Languages' },
    { name: 'React & Next.js', level: 'Expert', category: 'Frontend' },
    { name: 'Node.js & Express', level: 'Advanced', category: 'Backend' },
    { name: 'PostgreSQL & Prisma', level: 'Advanced', category: 'Database' },
    { name: 'Tailwind CSS', level: 'Expert', category: 'Frontend' },
    { name: 'Docker & Kubernetes', level: 'Intermediate', category: 'DevOps' },
  ],
  experience: [
    {
      role: 'Senior Full Stack Engineer',
      company: 'Vercel Ecosystem Labs',
      period: '2022 - Present',
      description: 'Architecting high-performance Next.js applications and cloud API pipelines.',
    },
    {
      role: 'Frontend Engineer',
      company: 'Linear Systems',
      period: '2020 - 2022',
      description: 'Developed real-time drag-and-drop workflow canvases with Framer Motion.',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevLaunch AI Career Suite',
      description: 'AI-powered SaaS platform for developers to build resumes, publish portfolios, and optimize ATS scores.',
      techStack: ['Next.js 16', 'TypeScript', 'Tailwind', 'OpenAI'],
      githubUrl: 'https://github.com/alexmorgan-dev/devlaunch-ai',
      liveUrl: 'https://devlaunch.ai',
      category: 'SaaS / AI',
      featured: true,
    },
    {
      id: 'proj-2',
      title: 'Real-time Canvas Editor',
      description: 'Vector-based collaborative diagramming tool with WebSockets and Zustand state management.',
      techStack: ['React', 'WebSockets', 'Canvas API'],
      githubUrl: 'https://github.com/alexmorgan-dev/canvas-editor',
      liveUrl: 'https://canvas.dev',
      category: 'Developer Tools',
      featured: false,
    },
    {
      id: 'proj-3',
      title: 'Distributed Event Middleware',
      description: 'Asynchronous event bus handling 10,000+ messages per second with zero drop rates.',
      techStack: ['Node.js', 'Redis', 'Docker', 'PostgreSQL'],
      githubUrl: 'https://github.com/alexmorgan-dev/event-middleware',
      liveUrl: 'https://eventbus.io',
      category: 'Backend / Cloud',
      featured: true,
    },
  ],
  education: [
    { degree: 'B.S. Computer Science', school: 'UC Berkeley', year: '2018 - 2022' },
  ],
  certifications: [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
  ],
  achievements: [
    { title: '1st Place Winner', detail: 'SF Tech AI Challenge Hackathon', year: '2023' },
  ],
  services: [
    { title: 'Full Stack Engineering', description: 'End-to-end web app architecture with Next.js, Node.js, and PostgreSQL.' },
    { title: 'Design Systems & UI/UX', description: 'Crafting responsive, accessible component libraries and glassmorphic designs.' },
  ],
  testimonials: [],
  blog: [],
  contact: {
    email: 'alex.morgan@devlaunch.ai',
    phone: '+1 (555) 234-5678',
    availableForHire: true,
  },
  socialLinks: {
    github: 'https://github.com/alexmorgan-dev',
    linkedin: 'https://linkedin.com/in/alexmorgan-dev',
    twitter: 'https://twitter.com/alexmorgan_dev',
    website: 'https://alexmorgan.dev',
  },
};

function ThemePicker({ themeId, onChange }: { themeId: string; onChange: (id: string) => void }) {
  const categories = ['All', ...Array.from(new Set(PORTFOLIO_THEMES.map((t) => t.category)))];
  const [category, setCategory] = useState('All');
  const visible = category === 'All' ? PORTFOLIO_THEMES : PORTFOLIO_THEMES.filter((t) => t.category === category);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-3 max-h-[600px] overflow-y-auto">
      <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
        Select From {PORTFOLIO_THEMES.length} Themes
      </h3>
      <div className="flex flex-wrap gap-1.5 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
              category === cat ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onChange(tpl.id)}
            className={`rounded-2xl border p-3.5 text-left transition ${
              themeId === tpl.id
                ? 'border-cyan-500 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/20'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white">{tpl.name}</span>
              {themeId === tpl.id && <Check className="h-4 w-4 text-cyan-400" />}
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-cyan-400/80">{tpl.category}</p>
            <p className="mt-1 text-[11px] text-slate-400">{tpl.style}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioBuilderPage() {
  const auth = useAuth();
  const currentUser = auth?.user;
  
  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO);
  const [themeId, setThemeId] = useState<string>('glassmorphism');
  const [activeTab, setActiveTab] = useState<'editor' | 'themes' | 'seo'>('editor');
  const [secFilter, setSecFilter] = useState<'hero' | 'about' | 'skills' | 'experience' | 'projects' | 'education' | 'services' | 'certs' | 'contact'>('hero');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState('alexmorgan');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchPortfolio(currentUser.id)
      .then(data => {
        if (data) {
          setPortfolio(data.data as unknown as PortfolioData);
          setThemeId(data.theme);
          setIsPublished(data.is_published);
          setSlug(data.slug);
        }
      })
      .catch(err => console.error('Failed to load portfolio', err))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const updatePortfolio = (next: PortfolioData) => {
    setPortfolio(next);
    // writeStorage('current_portfolio', next); // Migrated
  };

  const handleThemeChange = (id: string) => {
    setThemeId(id);
    // writeStorage('current_portfolio_theme', id);
  };

  const handleSaveToCloud = async (publishStatus = isPublished) => {
    if (!currentUser?.id) {
      alert('Please log in to save your portfolio.');
      return;
    }
    setIsSaving(true);
    try {
      await savePortfolio(currentUser.id, portfolio, themeId, slug, publishStatus);
      alert('Portfolio saved to Supabase successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save portfolio.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublished(true);
    await handleSaveToCloud(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Globe className="h-3.5 w-3.5" /> Portfolio Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mt-1">Portfolio Builder</h1>
          <p className="text-xs text-slate-400">Publish a developer portfolio with {PORTFOLIO_THEMES.length} themes, interactive section editor, and custom domain readiness.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => handleSaveToCloud(isPublished)} disabled={isSaving} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs hover:bg-emerald-500/20 text-emerald-300">
            {isSaving ? 'Saving...' : 'Save to Cloud'}
          </Button>
          <Button onClick={() => window.print()} className="rounded-xl border border-white/10 bg-white/10 text-xs hover:bg-white/20">
            Export PDF / Print
          </Button>
          <Button onClick={() => {
            const element = document.createElement('a');
            const file = new Blob([JSON.stringify(portfolio, null, 2)], {type: 'application/json'});
            element.href = URL.createObjectURL(file);
            element.download = `${slug || 'portfolio'}_backup.json`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }} className="rounded-xl border border-white/10 bg-white/10 text-xs hover:bg-white/20">
            Export JSON
          </Button>
          {isPublished ? (
            <Link href={`/p/${slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500">
              <ExternalLink className="h-4 w-4" /> View Live Site (/p/{slug})
            </Link>
          ) : (
            <Button onClick={handlePublish} className="rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white shadow-lg shadow-violet-600/30">
              <Share2 className="mr-1.5 h-4 w-4" /> Publish Portfolio
            </Button>
          )}
        </div>
      </div>



      {/* Main Split Workspace */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left Control Panel */}
        <div className="xl:col-span-5 space-y-4">
          {/* Main Mode Tabs */}
          <div className="flex rounded-2xl bg-slate-950/70 p-1 border border-white/10">
            {[
              { id: 'editor', label: 'Section Content' },
              { id: 'themes', label: `${PORTFOLIO_THEMES.length} Themes` },
              { id: 'seo', label: 'SEO & Slug' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'editor' | 'themes' | 'seo')}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  activeTab === tab.id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Section Editor */}
          {activeTab === 'editor' && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-5 max-h-[650px] overflow-y-auto">
              {/* Section Sub-Nav Buttons */}
              <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
                {[
                  { id: 'hero', label: 'Hero' },
                  { id: 'about', label: 'About' },
                  { id: 'skills', label: 'Skills' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'education', label: 'Education' },
                  { id: 'services', label: 'Services' },
                  { id: 'certs', label: 'Certs' },
                  { id: 'contact', label: 'Contact' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSecFilter(s.id as 'hero' | 'about' | 'skills' | 'experience' | 'projects' | 'education' | 'services' | 'certs' | 'contact')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      secFilter === s.id ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* 1. Hero */}
              {secFilter === 'hero' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Hero Banner</h3>
                  <div>
                    <label className="text-[11px] text-slate-400">Full Name</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                      value={portfolio.hero.name}
                      onChange={(e) => updatePortfolio({ ...portfolio, hero: { ...portfolio.hero, name: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Professional Title</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                      value={portfolio.hero.title}
                      onChange={(e) => updatePortfolio({ ...portfolio, hero: { ...portfolio.hero, title: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Tagline / Headline</label>
                    <textarea
                      rows={2}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none"
                      value={portfolio.hero.tagline}
                      onChange={(e) => updatePortfolio({ ...portfolio, hero: { ...portfolio.hero, tagline: e.target.value } })}
                    />
                  </div>
                </div>
              )}

              {/* 2. About */}
              {secFilter === 'about' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">About Me</h3>
                  <div>
                    <label className="text-[11px] text-slate-400">Bio Narrative</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none leading-relaxed"
                      value={portfolio.about.bio}
                      onChange={(e) => updatePortfolio({ ...portfolio, about: { ...portfolio.about, bio: e.target.value } })}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Years of Experience</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={portfolio.about.yearsOfExperience}
                        onChange={(e) => updatePortfolio({ ...portfolio, about: { ...portfolio.about, yearsOfExperience: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Location</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={portfolio.about.location}
                        onChange={(e) => updatePortfolio({ ...portfolio, about: { ...portfolio.about, location: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Skills */}
              {secFilter === 'skills' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Skills ({portfolio.skills.length})</h3>
                    <Button
                      onClick={() => {
                        const newSkill = { name: 'New Skill', level: 'Advanced', category: 'Frontend' };
                        updatePortfolio({ ...portfolio, skills: [...portfolio.skills, newSkill] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Skill
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {portfolio.skills.map((skill, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          value={skill.name}
                          onChange={(e) => {
                            const updated = [...portfolio.skills];
                            updated[idx].name = e.target.value;
                            updatePortfolio({ ...portfolio, skills: updated });
                          }}
                        />
                        <button
                          onClick={() => updatePortfolio({ ...portfolio, skills: portfolio.skills.filter((_, i) => i !== idx) })}
                          className="text-xs text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Experience (Interactive Form Inputs) */}
              {secFilter === 'experience' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Work Experience ({portfolio.experience.length})</h3>
                    <Button
                      onClick={() => {
                        const newExp = {
                          role: 'Software Engineer',
                          company: 'Company Name',
                          period: '2023 - Present',
                          description: 'Architecting scalable frontend and backend features.',
                        };
                        updatePortfolio({ ...portfolio, experience: [...portfolio.experience, newExp] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Job
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.experience.map((exp, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-cyan-300">Position #{idx + 1}</span>
                          <button
                            onClick={() => updatePortfolio({ ...portfolio, experience: portfolio.experience.filter((_, i) => i !== idx) })}
                            className="text-xs text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Role / Position"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...portfolio.experience];
                              updated[idx].role = e.target.value;
                              updatePortfolio({ ...portfolio, experience: updated });
                            }}
                          />
                          <input
                            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...portfolio.experience];
                              updated[idx].company = e.target.value;
                              updatePortfolio({ ...portfolio, experience: updated });
                            }}
                          />
                        </div>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
                          placeholder="Period (e.g. 2022 - Present)"
                          value={exp.period}
                          onChange={(e) => {
                            const updated = [...portfolio.experience];
                            updated[idx].period = e.target.value;
                            updatePortfolio({ ...portfolio, experience: updated });
                          }}
                        />
                        <textarea
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 p-2.5 text-xs text-white"
                          placeholder="Description of accomplishments..."
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...portfolio.experience];
                            updated[idx].description = e.target.value;
                            updatePortfolio({ ...portfolio, experience: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Projects */}
              {secFilter === 'projects' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Projects ({portfolio.projects.length})</h3>
                    <Button
                      onClick={() => {
                        const newProj = {
                          id: `proj-${Date.now()}`,
                          title: 'New Developer Project',
                          description: 'Description of key architectural achievements and technology stack used.',
                          techStack: ['React', 'TypeScript', 'Node.js'],
                          githubUrl: 'https://github.com',
                          liveUrl: 'https://example.com',
                        };
                        updatePortfolio({ ...portfolio, projects: [...portfolio.projects, newProj] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Project
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {portfolio.projects.map((proj, idx) => (
                      <div key={proj.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-cyan-300">Project #{idx + 1}</span>
                          <button
                            onClick={() => updatePortfolio({ ...portfolio, projects: portfolio.projects.filter(p => p.id !== proj.id) })}
                            className="text-xs text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          placeholder="Project Title"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = portfolio.projects.map(p => p.id === proj.id ? { ...p, title: e.target.value } : p);
                            updatePortfolio({ ...portfolio, projects: updated });
                          }}
                        />
                        <textarea
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 p-2.5 text-xs text-white"
                          placeholder="Project Description"
                          value={proj.description}
                          onChange={(e) => {
                            const updated = portfolio.projects.map(p => p.id === proj.id ? { ...p, description: e.target.value } : p);
                            updatePortfolio({ ...portfolio, projects: updated });
                          }}
                        />
                        <input
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
                          placeholder="Tech Stack (comma separated)"
                          value={proj.techStack.join(', ')}
                          onChange={(e) => {
                            const techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            const updated = portfolio.projects.map(p => p.id === proj.id ? { ...p, techStack } : p);
                            updatePortfolio({ ...portfolio, projects: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Education (Interactive Form Inputs) */}
              {secFilter === 'education' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Education ({portfolio.education.length})</h3>
                    <Button
                      onClick={() => {
                        const newEdu = { degree: 'B.S. Computer Science', school: 'University Name', year: '2018 - 2022' };
                        updatePortfolio({ ...portfolio, education: [...portfolio.education, newEdu] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Education
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.education.map((edu, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-emerald-300">Degree #{idx + 1}</span>
                          <button
                            onClick={() => updatePortfolio({ ...portfolio, education: portfolio.education.filter((_, i) => i !== idx) })}
                            className="text-xs text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          placeholder="Degree & Major"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...portfolio.education];
                            updated[idx].degree = e.target.value;
                            updatePortfolio({ ...portfolio, education: updated });
                          }}
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="School / University"
                            value={edu.school}
                            onChange={(e) => {
                              const updated = [...portfolio.education];
                              updated[idx].school = e.target.value;
                              updatePortfolio({ ...portfolio, education: updated });
                            }}
                          />
                          <input
                            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Year (e.g. 2018 - 2022)"
                            value={edu.year}
                            onChange={(e) => {
                              const updated = [...portfolio.education];
                              updated[idx].year = e.target.value;
                              updatePortfolio({ ...portfolio, education: updated });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Services (Interactive Form Inputs) */}
              {secFilter === 'services' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Services ({portfolio.services.length})</h3>
                    <Button
                      onClick={() => {
                        const newService = { title: 'New Service', description: 'Service description...' };
                        updatePortfolio({ ...portfolio, services: [...portfolio.services, newService] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Service
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.services.map((svc, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-cyan-300">Service #{idx + 1}</span>
                          <button
                            onClick={() => updatePortfolio({ ...portfolio, services: portfolio.services.filter((_, i) => i !== idx) })}
                            className="text-xs text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          placeholder="Service Title"
                          value={svc.title}
                          onChange={(e) => {
                            const updated = [...portfolio.services];
                            updated[idx].title = e.target.value;
                            updatePortfolio({ ...portfolio, services: updated });
                          }}
                        />
                        <textarea
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-xs text-white"
                          placeholder="Service Description"
                          value={svc.description}
                          onChange={(e) => {
                            const updated = [...portfolio.services];
                            updated[idx].description = e.target.value;
                            updatePortfolio({ ...portfolio, services: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Certifications */}
              {secFilter === 'certs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Certifications ({portfolio.certifications.length})</h3>
                    <Button
                      onClick={() => {
                        const newCert = { name: 'AWS Solutions Architect', issuer: 'AWS', year: '2023' };
                        updatePortfolio({ ...portfolio, certifications: [...portfolio.certifications, newCert] });
                      }}
                      size="sm"
                      className="h-7 text-[11px] bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Cert
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.certifications.map((cert, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-amber-300">Cert #{idx + 1}</span>
                          <button
                            onClick={() => updatePortfolio({ ...portfolio, certifications: portfolio.certifications.filter((_, i) => i !== idx) })}
                            className="text-xs text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                          placeholder="Certificate Name"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...portfolio.certifications];
                            updated[idx].name = e.target.value;
                            updatePortfolio({ ...portfolio, certifications: updated });
                          }}
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Issuer (e.g. AWS)"
                            value={cert.issuer}
                            onChange={(e) => {
                              const updated = [...portfolio.certifications];
                              updated[idx].issuer = e.target.value;
                              updatePortfolio({ ...portfolio, certifications: updated });
                            }}
                          />
                          <input
                            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            placeholder="Year"
                            value={cert.year}
                            onChange={(e) => {
                              const updated = [...portfolio.certifications];
                              updated[idx].year = e.target.value;
                              updatePortfolio({ ...portfolio, certifications: updated });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. Contact */}
              {secFilter === 'contact' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Contact & Social Links</h3>
                  <div>
                    <label className="text-[11px] text-slate-400">Email Address</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                      value={portfolio.contact.email}
                      onChange={(e) => updatePortfolio({ ...portfolio, contact: { ...portfolio.contact, email: e.target.value } })}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] text-slate-400">GitHub Link</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={portfolio.socialLinks.github || ''}
                        onChange={(e) => updatePortfolio({ ...portfolio, socialLinks: { ...portfolio.socialLinks, github: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">LinkedIn Link</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                        value={portfolio.socialLinks.linkedin || ''}
                        onChange={(e) => updatePortfolio({ ...portfolio, socialLinks: { ...portfolio.socialLinks, linkedin: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Theme Selector */}
          {activeTab === 'themes' && (
            <ThemePicker themeId={themeId} onChange={handleThemeChange} />
          )}

          {/* Tab 3: SEO & Slug */}
          {activeTab === 'seo' && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">SEO & Public URL</h3>
              <div>
                <label className="text-[11px] text-slate-400">Custom Public Slug (`/p/[slug]`)</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Frame (7 cols) */}
        <div className="xl:col-span-7">
          <div className="sticky top-6 rounded-3xl border border-white/10 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded-lg ${viewport === 'desktop' ? 'bg-white/20 text-white' : 'text-slate-400'}`}>
                  <Laptop className="h-4 w-4" />
                </button>
                <button onClick={() => setViewport('tablet')} className={`p-1.5 rounded-lg ${viewport === 'tablet' ? 'bg-white/20 text-white' : 'text-slate-400'}`}>
                  <Tablet className="h-4 w-4" />
                </button>
                <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded-lg ${viewport === 'mobile' ? 'bg-white/20 text-white' : 'text-slate-400'}`}>
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              <span className="text-xs text-slate-400">Live Preview Theme: <strong className="text-cyan-300 capitalize">{themeId}</strong></span>
            </div>

            <div className={`mx-auto overflow-hidden transition-all duration-300 rounded-2xl border border-white/10 ${
              viewport === 'mobile' ? 'max-w-sm' : viewport === 'tablet' ? 'max-w-xl' : 'w-full'
            }`}>
              <PortfolioThemeRenderer data={portfolio} themeId={themeId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
