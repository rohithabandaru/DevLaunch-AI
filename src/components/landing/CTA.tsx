'use client';

import React from 'react';
import { Sparkles, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

export function CTA() {
  return (
    <section id="get-started" className="py-24 relative overflow-hidden bg-[#0B1020]">
      {/* Radiant Glowing Energy Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-r from-[#6366F1]/30 via-[#8B5CF6]/30 to-[#EC4899]/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-card p-6 sm:p-10 md:p-16 rounded-[20px] sm:rounded-[28px] border border-indigo-500/30 shadow-2xl text-center space-y-6 sm:space-y-8 relative overflow-hidden glow-pill">
          {/* Subtle Grid Accent inside card */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Ready for Your Next Career Move?</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Launch Your Dream <br />
              <span className="gradient-text-indigo">Career Today</span>
            </h2>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto font-normal">
              Join over 100,000 developers building standout ATS resumes and portfolio websites with DevLaunch AI.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 w-full max-w-md sm:max-w-none mx-auto">
              <a
                href="/signup"
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 sm:px-9 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </a>

              <a
                href="#templates"
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold text-gray-200 glass-card hover:bg-gray-800/80 hover:text-white border border-white/10 hover:border-indigo-500/30 transition-all duration-200"
              >
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>View Templates</span>
              </a>
            </div>

            {/* Micro assurance line */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Setup in &lt; 5 Minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
