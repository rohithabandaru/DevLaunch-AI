'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Sparkles, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'David K.',
    role: 'Full-Stack Engineer',
    company: 'Dev Community Member',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    review:
      'DevLaunch AI completely revamped my resume and portfolio layout in under 15 minutes. The bullet optimizer and ATS formatting checks made my application significantly cleaner.',
    badge: 'Verified Builder',
  },
  {
    name: 'Elena R.',
    role: 'Frontend Engineer',
    company: 'Dev Community Member',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    review:
      'The portfolio generator is seamless. Custom theme options, instant styling, and live project cards give a professional presentation without hours of custom coding.',
    badge: 'Verified Builder',
  },
  {
    name: 'Marcus V.',
    role: 'Software Engineer',
    company: 'Dev Community Member',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    review:
      'The AI bullet point optimizer is awesome. It took my basic project descriptions and helped turn them into concise, high-impact technical statements.',
    badge: 'Verified Builder',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative bg-[#0B1020]">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Software Engineers & <br className="hidden sm:inline" />
            <span className="gradient-text-indigo">Modern Developers</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            See how developers build standout resumes and publish live portfolios faster with DevLaunch AI.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="glass-card p-8 rounded-[20px] glass-card-hover flex flex-col justify-between relative group"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5 group-hover:text-indigo-500/20 transition-colors" />

              <div>
                {/* 5-Star Rating Header */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-gray-400 ml-2">5.0 Star</span>
                </div>

                {/* Review Text */}
                <p className="text-sm text-gray-300 leading-relaxed italic mb-8">
                  &quot;{item.review}&quot;
                </p>
              </div>

              {/* User Profile Footer */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar image */}
                  <Image
                    unoptimized
                    src={item.avatar}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40 group-hover:border-indigo-400 transition-colors shadow-md"
                  />
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {item.role} @ <span className="text-indigo-300 font-semibold">{item.company}</span>
                    </p>
                  </div>
                </div>

                {/* Badge */}
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
