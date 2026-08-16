'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Briefcase, FileText, Sparkles, Wand2, ShieldCheck, Eye, Download, Activity, ExternalLink, Kanban } from 'lucide-react';
import { useAuth } from '@/components/providers/app-provider';
import { Button } from '@/components/ui/button';
import { TEMPLATE_LIST } from '@/components/resume/resume-templates';
import { PORTFOLIO_THEMES } from '@/components/portfolio/portfolio-themes';

const RESUME_COUNT = TEMPLATE_LIST.length;
const PORTFOLIO_COUNT = PORTFOLIO_THEMES.length;
const TOTAL_TEMPLATES = RESUME_COUNT + PORTFOLIO_COUNT;

const quickActions = [
  { href: '/dashboard/jobs', title: 'Job Tracker Board', description: 'Manage pipeline in Kanban & Table views with AI match scoring', icon: Kanban, color: 'from-amber-600/20 to-amber-900/10 border-amber-500/30' },
  { href: '/dashboard/resume', title: 'Create Resume', description: `Launch a polished resume with ${RESUME_COUNT} templates & AI suggestions`, icon: FileText, color: 'from-violet-600/20 to-violet-900/10 border-violet-500/30' },
  { href: '/dashboard/portfolio', title: 'Create Portfolio', description: `Publish a standout developer portfolio with ${PORTFOLIO_COUNT} themes`, icon: Briefcase, color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30' },
  { href: '/dashboard/ats', title: 'Run ATS Check', description: 'Audit keyword coverage, formatting, and readability score', icon: BarChart3, color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-tr from-violet-600/30 to-cyan-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
              <Sparkles className="h-3.5 w-3.5" /> Executive Command Center
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Welcome back, {user?.name || 'Alex Morgan'}
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
                Your launchpad for AI resumes, developer portfolios, and recruiter-ready assets. Build momentum and land your next role.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition">
              <Kanban className="h-4 w-4" /> Open Job Tracker
            </Link>
            <Link href="/dashboard/resume" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition">
              Build Resume <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Job Tracker Pipeline', value: '4 Active Jobs', desc: '2 Interviewing, 1 Offer', accent: 'from-amber-500/20 to-amber-600/10 border-amber-500/20', link: '/dashboard/jobs' },
          { label: 'Active Resumes', value: '3 Drafts', desc: 'Modern & Executive', accent: 'from-violet-500/20 to-violet-600/10 border-violet-500/20', link: '/dashboard/resume' },
          { label: 'Portfolio Views', value: '0 Views', desc: `${PORTFOLIO_COUNT} themes available`, accent: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20', link: '/dashboard/portfolio' },
          { label: 'Avg ATS Score', value: '92 / 100', desc: 'Strong keyword match', accent: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20', link: '/dashboard/ats' },
        ].map((item, i) => (
          <Link key={i} href={item.link} className={`rounded-3xl border bg-gradient-to-br ${item.accent} p-5 backdrop-blur-xl transition hover:scale-[1.02]`}>
            <p className="text-xs font-medium text-slate-300">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
            <p className="mt-1 text-[11px] text-slate-400">{item.desc}</p>
          </Link>
        ))}
      </section>

      {/* Quick Actions & Recent Activity Split */}
      <section className="grid gap-6 xl:grid-cols-12">
        {/* Quick Actions (7 cols) */}
        <div className="xl:col-span-7 rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
            <Link href="/dashboard/templates" className="text-xs font-medium text-violet-400 hover:underline">
              Browse {TOTAL_TEMPLATES} Templates →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`group rounded-2xl border bg-gradient-to-br ${action.color} p-4 backdrop-blur-md transition hover:border-white/30`}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-md">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-violet-300 transition">{action.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Analytics (5 cols) */}
        <div className="xl:col-span-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Activity Log & Analytics</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">
              <Activity className="h-3 w-3" /> Real-time
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            {[
              { text: 'Updated Full Stack Engineer Resume draft', time: '10m ago' },
              { text: 'Published portfolio theme to /p/alexmorgan', time: '1h ago' },
              { text: 'Ran ATS scan for Stripe Senior Engineer role', time: '3h ago' },
              { text: 'Generated tailored cover letter for Vercel', time: '1d ago' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-slate-200">{item.text}</span>
                <span className="text-slate-400 text-[11px]">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Simple Visual Analytics Meter */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 pt-3">
            <div className="flex justify-between text-xs font-semibold text-slate-200">
              <span>Weekly Portfolio Views</span>
              <span className="text-emerald-400"></span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full w-[0%] bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
