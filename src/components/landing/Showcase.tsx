'use client';

import React, { useState } from 'react';
import {
  FileText,
  Globe,
  Sparkles,
  ExternalLink,
  Code,
  Terminal,
} from 'lucide-react';

export function Showcase() {
  const [activeView, setActiveView] = useState<'resume' | 'portfolio'>('resume');

  return (
    <section id="templates" className="py-24 relative bg-[#0B1020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Hardware Mockup</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            See the Magic <span className="gradient-text-indigo">In Action</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            High-fidelity previews of what recruiters and hiring software see when you build with DevLaunch AI.
          </p>

          {/* Tab Selection Switch */}
          <div className="flex w-full sm:w-auto sm:inline-flex flex-col sm:flex-row p-1.5 bg-[#1F2937]/90 rounded-2xl border border-white/10 shadow-xl mt-4 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => setActiveView('resume')}
              className={`flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] w-full sm:w-auto ${
                activeView === 'resume'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Resume Preview</span>
              <span className="hidden sm:inline">ATS Resume Preview</span>
            </button>
            <button
              onClick={() => setActiveView('portfolio')}
              className={`flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] w-full sm:w-auto ${
                activeView === 'portfolio'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Portfolio Preview</span>
              <span className="hidden sm:inline">Developer Portfolio Preview</span>
            </button>
          </div>
        </div>

        {/* MacBook Laptop Mockup */}
        <div id="portfolio-builder" className="relative max-w-5xl mx-auto">
          {/* Outer MacBook Lid Border */}
          <div className="rounded-3xl border-4 border-gray-700/60 bg-[#111827] shadow-2xl p-2 sm:p-4 relative">
            {/* Camera dot & speaker grill representation */}
            <div className="flex justify-center pb-2">
              <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-500" />
              </div>
            </div>

            {/* Screen Screen Display */}
            <div className="bg-[#0B1020] rounded-xl border border-white/10 overflow-hidden min-h-[480px]">
              {activeView === 'resume' ? (
                /* Resume Showcase Inside Frame */
                <div className="p-6 sm:p-8 space-y-6 text-left">
                  {/* Top Bar Status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                    <div>
                      <span className="text-xs text-gray-400">Template Mode</span>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Staff Software Engineer (Modern Tech Layout)</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          98% ATS Pass
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/80 px-3 py-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI Suggestions Active
                      </span>
                    </div>
                  </div>

                  {/* Resume Paper Document */}
                  <div className="bg-[#1F2937]/80 rounded-xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl max-w-4xl mx-auto font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-700/80 pb-6 gap-4">
                      <div>
                        <h4 className="text-2xl font-black text-white">SARAH JENKINS</h4>
                        <p className="text-sm font-semibold text-indigo-400">Senior AI Systems Architect</p>
                        <p className="text-xs text-gray-400 mt-1">San Francisco, CA • sarah.devlaunch.ai • github.com/sjenk</p>
                      </div>
                      <div className="text-xs text-right text-gray-400">
                        <div>Verified Developer</div>
                        <div className="text-emerald-400 font-medium">Available Immediately</div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">EXECUTIVE SUMMARY</h5>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        Results-driven AI engineer with 7+ years of experience scaling LLM infrastructure, microservices, and distributed training systems. Proven track record reducing inference latency by 45% while handling 10M+ daily API requests.
                      </p>
                    </div>

                    {/* Work Experience */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">WORK EXPERIENCE</h5>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-white">Principal AI Engineer • Anthropic / TechCorp</span>
                            <span className="text-xs text-gray-400">2023 - Present</span>
                          </div>
                          <ul className="text-xs text-gray-300 list-disc list-inside space-y-1 mt-1">
                            <li>Spearheaded distributed RAG engine serving 500K daily queries with sub-200ms latency.</li>
                            <li>Mentored team of 12 full-stack engineers and automated CI/CD evaluation pipelines.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Technical Skills */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">TECHNICAL SKILLS</h5>
                      <div className="flex flex-wrap gap-2">
                        {['PyTorch', 'Python', 'Next.js 15', 'TypeScript', 'Kubernetes', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'].map((tech) => (
                          <span key={tech} className="px-2.5 py-1 bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 rounded-md text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Portfolio Showcase Inside Frame */
                <div className="p-6 sm:p-8 space-y-6 text-left">
                  {/* Portfolio Navbar inside frame */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shrink-0">
                        <div className="w-full h-full bg-[#0B1020] rounded-full flex items-center justify-center text-xs font-bold text-white">
                          SJ
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">sarahjenkins.dev</div>
                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span className="truncate">Live Portfolio Theme: Dark Glass</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto min-h-[36px] px-3.5 py-1.5 bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/30 flex items-center justify-center gap-1.5 shrink-0">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>Visit Custom Domain</span>
                    </button>
                  </div>

                  {/* Portfolio Hero Banner inside frame */}
                  <div className="bg-gradient-to-r from-[#1F2937] via-[#111827] to-[#0B1020] p-6 rounded-2xl border border-white/10 space-y-3">
                    <span className="text-xs font-mono text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800/40">
                      const engineer = &quot;Sarah Jenkins&quot;;
                    </span>
                    <h3 className="text-2xl font-extrabold text-white">Building Next-Gen AI & Web Platforms</h3>
                    <p className="text-xs text-gray-300 max-w-xl">
                      Featured by ProductHunt & GitHub Trending. Specializing in LLM agent workflows, high-throughput backend architecture, and sleek UI designs.
                    </p>
                  </div>

                  {/* Featured Projects Grid inside frame */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#1F2937]/70 p-4 rounded-xl border border-white/10 space-y-2">
                      <div className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" /> Featured Open Source
                      </div>
                      <h4 className="text-sm font-bold text-white">AgentFlow Orchestrator</h4>
                      <p className="text-xs text-gray-400">
                        Autonomous LLM execution graph framework with multi-tool calling.
                      </p>
                      <div className="flex gap-2 text-[10px] text-gray-300 pt-1">
                        <span className="bg-indigo-950/80 px-2 py-0.5 rounded text-indigo-300">TypeScript</span>
                        <span className="bg-purple-950/80 px-2 py-0.5 rounded text-purple-300">Python</span>
                      </div>
                    </div>

                    <div className="bg-[#1F2937]/70 p-4 rounded-xl border border-white/10 space-y-2">
                      <div className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5" /> Full-Stack App
                      </div>
                      <h4 className="text-sm font-bold text-white">VectorSearch Dashboard</h4>
                      <p className="text-xs text-gray-400">
                        Real-time vector index visualizer with semantic clustering engine.
                      </p>
                      <div className="flex gap-2 text-[10px] text-gray-300 pt-1">
                        <span className="bg-indigo-950/80 px-2 py-0.5 rounded text-indigo-300">Next.js 15</span>
                        <span className="bg-emerald-950/80 px-2 py-0.5 rounded text-emerald-300">Pinecone</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MacBook Base Hinge */}
          <div className="w-full h-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-2xl shadow-xl flex justify-center items-start">
            <div className="w-32 h-1 bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
