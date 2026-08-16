'use client';

import React from 'react';

const companies = [
  { name: 'Google', color: 'text-blue-400' },
  { name: 'Meta', color: 'text-sky-400' },
  { name: 'Stripe', color: 'text-violet-400' },
  { name: 'Vercel', color: 'text-white' },
  { name: 'Linear', color: 'text-indigo-300' },
  { name: 'Supabase', color: 'text-emerald-400' },
  { name: 'Netflix', color: 'text-red-400' },
  { name: 'Spotify', color: 'text-green-400' },
  { name: 'Shopify', color: 'text-lime-400' },
  { name: 'Airbnb', color: 'text-rose-400' },
];

export function LogoBar() {
  return (
    <section className="py-12 relative bg-[#0B1020] border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-8">
          Trusted by engineers at world-class companies
        </p>

        {/* Logo Scroll Strip */}
        <div className="relative overflow-hidden mask-fade">
          <div className="flex animate-scroll-logos gap-12 sm:gap-16 items-center w-max">
            {/* Render twice for seamless infinite loop */}
            {[...companies, ...companies].map((company, idx) => (
              <span
                key={`${company.name}-${idx}`}
                className={`text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300 opacity-40 hover:opacity-100 hover:scale-110 cursor-default select-none ${company.color}`}
              >
                {company.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
