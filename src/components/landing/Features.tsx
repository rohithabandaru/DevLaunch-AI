import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Globe,
  ShieldCheck,
  FileCheck,
  Layout,
  ArrowUpRight,
  Kanban,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Resume Builder',
    description:
      'Tailor your resume for any tech job description with real-time AI suggestions, keyword optimization, and metric enhancement.',
    badge: 'Popular',
    gradient: 'from-indigo-500 to-purple-500',
    href: '/dashboard/resume',
  },
  {
    icon: Kanban,
    title: 'AI Job Pipeline Tracker',
    description:
      'Manage applications in Kanban & Table views with real-time AI role compatibility scoring, interview prep, and direct cover letter generation.',
    badge: 'New Feature',
    gradient: 'from-amber-500 to-violet-500',
    href: '/dashboard/jobs',
  },
  {
    icon: Globe,
    title: 'Portfolio Generator',
    description:
      'Generate a stunning, mobile-responsive developer portfolio website hosted instantly with 1-click custom domain publishing.',
    badge: 'Instant Launch',
    gradient: 'from-purple-500 to-pink-500',
    href: '/dashboard/portfolio',
  },
  {
    icon: ShieldCheck,
    title: 'ATS Score Checker',
    description:
      'Scan your resume structure against industry ATS standards to identify missing keywords and eliminate formatting issues.',
    badge: 'ATS Scanner',
    gradient: 'from-emerald-500 to-teal-500',
    href: '/dashboard/ats',
  },
  {
    icon: FileCheck,
    title: 'Cover Letter Generator',
    description:
      'Craft personalized, role-specific cover letters in under 30 seconds aligned directly with hiring manager preferences.',
    badge: 'AI Powered',
    gradient: 'from-blue-500 to-indigo-500',
    href: '/dashboard/cover-letter',
  },
  {
    icon: Layout,
    title: 'Developer Templates',
    description:
      'Explore recruiter-approved resume layouts and glassmorphism portfolio themes engineered for software engineers.',
    badge: '30+ Designs',
    gradient: 'from-pink-500 to-rose-500',
    href: '/dashboard/templates',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative bg-[#0B1020]">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Power Features</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Everything You Need to <br className="hidden sm:inline" />
            <span className="gradient-text-indigo">Supercharge Your Career</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Built specifically for developers, engineers, and tech professionals aiming for top-tier tech roles.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={idx}
                href={feature.href}
                className="group relative glass-card p-8 rounded-[20px] glass-card-hover flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-colors">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Card Content */}
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle Interactive Footer Link */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 gap-1">
                  <span>Open {feature.title}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
