'use client';

import React from 'react';
import { FileText, Globe, Award, Layout, Sparkles } from 'lucide-react';

const stats = [
  {
    value: '100K+',
    label: 'Resumes Created',
    detail: 'Optimized for FAANG & top startups',
    icon: FileText,
    gradient: 'from-indigo-400 to-indigo-600',
  },
  {
    value: '25K+',
    label: 'Portfolios Published',
    detail: 'Hosted on lightning-fast edge networks',
    icon: Globe,
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    value: '98%',
    label: 'ATS Success Rate',
    detail: 'Guaranteed resume scanner readability',
    icon: Award,
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    value: '50+',
    label: 'Curated Templates',
    detail: 'Modern developer & designer themes',
    icon: Layout,
    gradient: 'from-pink-400 to-rose-600',
  },
];

export function Stats() {
  return (
    <section className="py-20 relative bg-[#111827]/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={idx}
                className="glass-card p-8 rounded-[20px] glass-card-hover relative overflow-hidden group text-center flex flex-col items-center justify-center space-y-3"
              >
                {/* Subtle Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <StatIcon className="w-6 h-6 text-indigo-400" />
                </div>

                {/* Big Number Stat */}
                <div
                  className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent tracking-tight`}
                >
                  {stat.value}
                </div>

                {/* Title */}
                <div className="text-base font-bold text-white tracking-tight">
                  {stat.label}
                </div>

                {/* Description Detail */}
                <p className="text-xs text-gray-400 font-normal">
                  {stat.detail}
                </p>

                {/* Decorative Bottom Line */}
                <div className="w-12 h-0.5 bg-indigo-500/30 rounded-full group-hover:w-20 group-hover:bg-indigo-500 transition-all duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
