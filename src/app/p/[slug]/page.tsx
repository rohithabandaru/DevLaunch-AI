'use client';

import React, { useState, useEffect, use } from 'react';
import { fetchPublicPortfolio } from '@/lib/supabase-portfolios';
import { supabase } from '@/components/providers/app-provider';
import { PortfolioData, PortfolioThemeRenderer } from '@/components/portfolio/portfolio-themes';
import { readStorage } from '@/lib/storage';

export default function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const [data, setData] = useState<PortfolioData | null>(null);
  const [themeId, setThemeId] = useState<string>('glassmorphism');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetchPublicPortfolio(slug);
        if (res && res.data) {
          if (isMounted) {
            setData(res.data as unknown as PortfolioData);
            setThemeId(res.theme || 'glassmorphism');
          }
          if (supabase) {
            try {
              await supabase.from('portfolio_events').insert({
                portfolio_slug: slug,
                event_type: 'view',
                created_at: new Date().toISOString()
              });
            } catch {
              // Ignore silent analytics recording errors
            }
          }
          return;
        }
      } catch (err) {
        console.warn('Unable to fetch public portfolio from cloud:', err);
      }

      // Fallback to local storage if cloud fetch is unreachable or slug matches local portfolio
      try {
        const localPortfolio = readStorage<PortfolioData | null>('portfolio', null);
        const localSlug = readStorage<string>('portfolio_slug', 'demo');
        const localTheme = readStorage<string>('portfolio_theme', 'glassmorphism');
        if (localPortfolio && (localSlug === slug || slug === 'demo')) {
          if (isMounted) {
            setData(localPortfolio);
            setThemeId(localTheme);
            setIsError(false);
          }
          return;
        }
      } catch {
        // ignore
      }

      if (isMounted) {
        setIsError(true);
      }
    })().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse text-lg font-semibold tracking-widest text-cyan-500">LOADING PORTFOLIO...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          <p>Portfolio not found or not published.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 print:bg-transparent print:p-0 print:m-0">
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition hover:bg-slate-800 hover:scale-105 active:scale-95"
        >
          <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export PDF / Print
        </button>
      </div>
      <PortfolioThemeRenderer data={data} themeId={themeId} />
    </div>
  );
}

