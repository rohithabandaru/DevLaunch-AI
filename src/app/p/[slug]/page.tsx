'use client';

import React, { useState, useEffect } from 'react';
import { fetchPublicPortfolio } from '@/lib/supabase-portfolios';
import { supabase } from '@/components/providers/app-provider';
import { PortfolioData, PortfolioThemeRenderer } from '@/components/portfolio/portfolio-themes';

export default function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [themeId, setThemeId] = useState<string>('glassmorphism');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchPublicPortfolio(params.slug)
      .then((res) => {
        if (res && res.data) {
          setData(res.data as unknown as PortfolioData);
          setThemeId(res.theme || 'glassmorphism');
          
          // Analytics Tracking
          if (supabase) {
            (async () => {
              try {
                await supabase.from('portfolio_events').insert({
                  portfolio_slug: params.slug,
                  event_type: 'view',
                  created_at: new Date().toISOString()
                });
              } catch (e) {
                console.error(e);
              }
            })();
          }
        } else {
          setIsError(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params.slug]);

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
    <div className="min-h-screen bg-slate-950">
      <PortfolioThemeRenderer data={data} themeId={themeId} />
    </div>
  );
}

