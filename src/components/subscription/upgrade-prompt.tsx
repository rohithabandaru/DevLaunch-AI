'use client';

import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  title?: string;
  message: string;
  ctaLabel?: string;
}

export function UpgradePrompt({
  title = 'Free plan limit reached',
  message,
  ctaLabel = 'Upgrade to Pro',
}: UpgradePromptProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-bold text-amber-200">{title}</p>
          <p className="mt-0.5 text-xs text-amber-300/80">{message}</p>
        </div>
      </div>
      <Link
        href="/dashboard/billing"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
      >
        {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}