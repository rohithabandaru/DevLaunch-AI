'use client';

import React from 'react';
import { Palette, Edit3, Wand2, DownloadCloud, Check } from 'lucide-react';

const steps = [
  {
    stepNumber: '01',
    title: 'Choose a Template',
    description:
      'Select from 30+ ATS-optimized resume layouts and 30 distinct portfolio themes designed for developers.',
    icon: Palette,
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    stepNumber: '02',
    title: 'Fill Details',
    description:
      'Import directly from LinkedIn, GitHub, or type your work experience, projects, and tech stack.',
    icon: Edit3,
    accent: 'from-purple-500 to-pink-500',
  },
  {
    stepNumber: '03',
    title: 'AI Improves Everything',
    description:
      'Our LLM engine rewrites bullet points, inserts measurable impact metrics, and fixes keyword gaps.',
    icon: Wand2,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    stepNumber: '04',
    title: 'Download & Publish',
    description:
      'Export pixel-perfect PDFs for ATS submission or publish your portfolio to a custom subdomain with 1 click.',
    icon: DownloadCloud,
    accent: 'from-blue-500 to-indigo-500',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-[#111827]/60 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How DevLaunch AI <span className="gradient-text-indigo">Works</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            From zero to an ATS-ready resume and live developer portfolio in under 5 minutes.
          </p>
        </div>

        {/* Timeline Cards Grid */}
        <div className="relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/40 to-indigo-500/10 -translate-y-12 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="group glass-card p-6 rounded-[20px] glass-card-hover relative flex flex-col justify-between"
                >
                  <div>
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.accent} p-0.5 shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                          <StepIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <span className="text-3xl font-black text-white/20 group-hover:text-indigo-400/40 transition-colors">
                        {step.stepNumber}
                      </span>
                    </div>

                    {/* Step Info */}
                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Completion Indicator */}
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-gray-400 group-hover:text-emerald-400 transition-colors">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    <span>Automated by AI</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
