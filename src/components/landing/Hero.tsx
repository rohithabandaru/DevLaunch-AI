'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe,
  TrendingUp,
  Cpu,
  Star,
  Award,
  Zap,
  Briefcase,
  Code2,
} from 'lucide-react';

interface HeroProps {
  onOpenDemo: () => void;
}

export function Hero({ onOpenDemo }: HeroProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'portfolio'>('resume');

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-grid-pattern">
      {/* Ambient Glowing Orbs Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-gradient-to-tr from-[#6366F1]/30 via-[#8B5CF6]/20 to-[#EC4899]/10 blur-[130px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-8 px-1">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full glass-card border border-indigo-500/30 text-[11px] sm:text-sm font-medium text-indigo-300 shadow-xl shadow-indigo-500/10 hover:border-indigo-400/50 transition-all cursor-pointer max-w-full">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-semibold text-white shrink-0">DevLaunch AI 2.0:</span>
            <span className="truncate">Next-Gen ATS Engine & Portfolio Builder</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Build Your Resume & Portfolio <br className="hidden sm:inline" />
            <span className="gradient-text-indigo">with AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Create ATS-friendly resumes, beautiful developer portfolios, and launch your career faster with AI-powered tools.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 w-full max-w-md sm:max-w-none mx-auto">
            <a
              href="/dashboard/jobs"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-white" />
              <span>Explore Job Openings</span>
            </a>

            <a
              href="/signup"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Start Building</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </a>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold text-gray-200 glass-card hover:bg-gray-800/80 hover:text-white border border-white/10 hover:border-indigo-500/30 transition-all duration-200"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 fill-indigo-400 ml-0.5" />
              </div>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ATS-Optimized Formatting
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1-Click Custom Portfolio Domain
            </span>
          </div>
        </div>

        {/* 3D Dashboard Mockup Container */}
        <div id="resume-builder" className="mt-14 relative max-w-5xl mx-auto">
          {/* Decorative Floating Badges around MacBook Container */}
          <div className="hidden lg:flex absolute -top-8 -left-12 z-30 glass-card p-3.5 rounded-2xl border border-emerald-500/30 shadow-2xl animate-float items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400">ATS Match Score</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                98% Excellent <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex absolute top-1/3 -right-14 z-30 glass-card p-3.5 rounded-2xl border border-purple-500/30 shadow-2xl animate-float-delayed items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400">AI Bullet Optimizer</div>
              <div className="text-sm font-bold text-white">Metrics + Impact Boosted</div>
            </div>
          </div>

          <div className="hidden lg:flex absolute -bottom-6 left-12 z-30 glass-card px-4 py-3 rounded-2xl border border-indigo-500/30 shadow-2xl items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-gray-200 flex items-center gap-1">
              alexdev.devlaunch.app <span className="inline-flex items-center text-emerald-400 ml-1">Live <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /></span>
            </div>
          </div>

          {/* MacBook Window Wrapper */}
          <div className="rounded-2xl border border-white/10 glass-card overflow-hidden shadow-2xl shadow-indigo-950/50">
            {/* Window Header Bar */}
            <div className="bg-[#111827]/90 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
              </div>

              {/* View Switcher Tabs inside Mockup */}
              <div className="flex bg-[#0B1020] p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-white/10 max-w-[min(100%,280px)] sm:max-w-none">
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all min-h-[32px] sm:min-h-0 flex-1 sm:flex-none ${
                    activeTab === 'resume'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">Resume</span>
                  <span className="hidden md:inline"> View</span>
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all min-h-[32px] sm:min-h-0 flex-1 sm:flex-none ${
                    activeTab === 'portfolio'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">Portfolio</span>
                  <span className="hidden md:inline"> View</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 hidden sm:block">devlaunch.ai/builder</div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 bg-[#0B1020]/90 min-h-[420px]">
              {activeTab === 'resume' ? (
                /* Interactive Resume Builder Preview */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column - Form & AI Insights */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="bg-[#1F2937]/80 rounded-xl p-4 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> AI Real-time Assistant
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          98% ATS Score
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        &quot;Enhanced bullet point for Senior Frontend Engineer role: Increased Next.js render speed by 42% using server components.&quot;
                      </p>
                      <button className="w-full min-h-[40px] py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
                        <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">Apply AI Optimization</span>
                      </button>
                    </div>

                    <div className="bg-[#1F2937]/50 rounded-xl p-4 border border-white/5 space-y-2">
                      <div className="text-xs font-medium text-gray-400">Target Role</div>
                      <div className="text-sm font-semibold text-white flex items-center justify-between">
                        <span>Staff Software Engineer</span>
                        <span className="text-xs text-indigo-400">Meta / Stripe Keyword Standard</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Paper Resume Rendering */}
                  <div className="md:col-span-7 bg-[#1F2937]/90 rounded-xl p-6 border border-white/10 shadow-inner text-left font-sans">
                    <div className="border-b border-gray-700/60 pb-4 mb-4">
                      <h3 className="text-xl font-bold text-white tracking-tight">ALEX R. CHEN</h3>
                      <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                        Senior Full-Stack Developer • San Francisco, CA • alex@devlaunch.ai
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">
                          PROFESSIONAL EXPERIENCE
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="font-bold text-white">Lead Frontend Engineer @ TechScale AI</span>
                              <span className="text-gray-400 text-[10px]">2024 - Present</span>
                            </div>
                            <ul className="text-[11px] text-gray-300 list-disc list-inside space-y-1 mt-1">
                              <li>Architected Next.js micro-frontend architecture serving 2.4M monthly active users.</li>
                              <li>Integrated OpenAI GPT-4 API to automate resume analysis, driving 35% user retention gain.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">
                          SKILLS & TECHNOLOGIES
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['React', 'Next.js 15', 'TypeScript', 'Node.js', 'TailwindCSS', 'GraphQL', 'Docker', 'AWS'].map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Live Developer Portfolio Preview */
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#1F2937] p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg">
                        <div className="w-full h-full bg-[#0B1020] rounded-[14px] flex items-center justify-center">
                          <Code2 className="w-8 h-8 text-indigo-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Alex Chen Portfolio</h3>
                        <p className="text-xs text-gray-300">Building intelligent web apps & LLM developer platforms</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Open for Opportunities
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    {[
                      {
                        title: 'DevLaunch AI Platform',
                        desc: 'AI resume & developer portfolio generator built with Next.js & OpenAI.',
                        tag: 'Next.js 15 • TypeScript',
                        stars: '1.2k',
                      },
                      {
                        title: 'NeuralCode Editor',
                        desc: 'Browser-based AI pair programmer with live AST refactoring engine.',
                        tag: 'React • WebAssembly',
                        stars: '840',
                      },
                      {
                        title: 'CloudDeploy CLI',
                        desc: 'Zero-config deployment CLI for edge serverless functions.',
                        tag: 'Rust • Docker',
                        stars: '2.4k',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-[#1F2937]/70 p-4 rounded-xl border border-white/5 hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {item.stars}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.desc}</p>
                        <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                          {item.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
