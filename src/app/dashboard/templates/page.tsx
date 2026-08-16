'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Sparkles, ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATE_LIST } from '@/components/resume/resume-templates';
import { PORTFOLIO_THEMES } from '@/components/portfolio/portfolio-themes';
import { writeStorage } from '@/lib/storage';

function PortfolioThemeGrid({ onApply }: { onApply: (id: string) => void }) {
  const categories = ['All', ...Array.from(new Set(PORTFOLIO_THEMES.map((t) => t.category)))];
  const [category, setCategory] = useState('All');
  const visible = category === 'All' ? PORTFOLIO_THEMES : PORTFOLIO_THEMES.filter((t) => t.category === category);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((theme) => (
          <div key={theme.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition">
            <div>
              <div className="flex justify-between items-start">
                <span className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-[11px] font-medium text-cyan-300 border border-cyan-500/30">
                  {theme.category}
                </span>
                <Layers className="h-4 w-4 text-cyan-400 opacity-60" />
              </div>
              <h3 className="text-lg font-bold text-white mt-3">{theme.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{theme.style}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Button
                onClick={() => onApply(theme.id)}
                className="w-full rounded-xl bg-cyan-600 text-xs text-white hover:bg-cyan-500"
              >
                Apply Theme <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesShowcasePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'resumes' | 'portfolios'>('resumes');

  const handleApplyResume = (id: string) => {
    writeStorage('current_template', id);
    router.push('/dashboard/resume');
  };

  const handleApplyPortfolio = (id: string) => {
    writeStorage('current_portfolio_theme', id);
    router.push('/dashboard/portfolio');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <Layout className="h-3.5 w-3.5" /> Template Catalog
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mt-1">Design Templates & Themes</h1>
          <p className="text-xs text-slate-400">Explore {TEMPLATE_LIST.length} ATS resume templates and {PORTFOLIO_THEMES.length} responsive portfolio themes. Apply with one click.</p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-white/10 p-1 border border-white/10">
          <button
            onClick={() => setTab('resumes')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              tab === 'resumes' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {TEMPLATE_LIST.length} Resume Templates
          </button>
          <button
            onClick={() => setTab('portfolios')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              tab === 'portfolios' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {PORTFOLIO_THEMES.length} Portfolio Themes
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {tab === 'resumes' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TEMPLATE_LIST.map((tpl) => (
            <div key={tpl.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl space-y-4 flex flex-col justify-between hover:border-violet-500/40 transition">
              <div>
                <div className="flex justify-between items-start">
                  <span className="rounded-lg bg-violet-500/20 px-2.5 py-1 text-[11px] font-medium text-violet-300 border border-violet-500/30">
                    {tpl.category}
                  </span>
                  <Sparkles className="h-4 w-4 text-violet-400 opacity-60" />
                </div>
                <h3 className="text-lg font-bold text-white mt-3">{tpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{tpl.style}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-2">
                <Button
                  onClick={() => handleApplyResume(tpl.id)}
                  className="w-full rounded-xl bg-violet-600 text-xs text-white hover:bg-violet-500"
                >
                  Use Template <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <PortfolioThemeGrid onApply={handleApplyPortfolio} />
      )}
    </div>
  );
}
