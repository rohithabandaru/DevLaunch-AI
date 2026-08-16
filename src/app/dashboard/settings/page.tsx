'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Shield, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/app-provider';
import { PORTFOLIO_THEMES } from '@/components/portfolio/portfolio-themes';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [language, setLanguage] = useState('English');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicSearchable, setPublicSearchable] = useState(true);
  const [plan, setPlan] = useState<'free' | 'pro'>('pro');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
          <SettingsIcon className="h-3.5 w-3.5" /> Workspace Preferences
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">App Settings</h1>
        <p className="text-xs text-slate-400">Configure interface theme, language, notifications, privacy, and subscription tier.</p>
      </div>

      {/* Preferences Form */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl space-y-6">
        {/* Subscription Plan Status */}
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 via-indigo-600/10 to-cyan-500/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-violet-400" /> Current Plan: {plan.toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-white mt-1">DevLaunch Pro Builder Plan</p>
            <p className="text-xs text-slate-400">Unlimited resumes, {PORTFOLIO_THEMES.length} portfolio themes, ATS scanning, & OpenAI API access.</p>
          </div>
          <Button onClick={() => setShowUpgradeModal(true)} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500">
            Manage Plan
          </Button>
        </div>

        {/* Theme Settings */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              {!mounted || theme === 'dark' ? <Moon className="h-4 w-4 text-violet-400" /> : <Sun className="h-4 w-4 text-amber-400" />} Appearance Theme
            </h3>
            <p className="text-xs text-slate-400">Toggle between Dark Mode and Light Mode.</p>
          </div>

          <Button onClick={toggleTheme} className="rounded-xl border border-white/10 bg-white/10 px-4 text-xs text-white hover:bg-white/20 capitalize">
            Current: {theme}
          </Button>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" /> System Language
            </h3>
            <p className="text-xs text-slate-400">Select language for interface labels.</p>
          </div>

          <select
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English (US)</option>
            <option value="Spanish">Español</option>
            <option value="French">Français</option>
            <option value="German">Deutsch</option>
            <option value="Japanese">日本語</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-fuchsia-400" /> Email Notifications
            </h3>
            <p className="text-xs text-slate-400">Receive weekly portfolio analytics and ATS scan summaries.</p>
          </div>

          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`h-6 w-11 rounded-full transition-colors p-0.5 ${emailNotifications ? 'bg-violet-600' : 'bg-white/10'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" /> Search Engine Indexing
            </h3>
            <p className="text-xs text-slate-400">Allow search engines to index your published `/p/[slug]` portfolio.</p>
          </div>

          <button
            onClick={() => setPublicSearchable(!publicSearchable)}
            className={`h-6 w-11 rounded-full transition-colors p-0.5 ${publicSearchable ? 'bg-emerald-600' : 'bg-white/10'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${publicSearchable ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Subscription Dialog Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100">
            <h2 className="text-2xl font-bold text-white">DevLaunch AI Subscription Tiers</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <h4 className="font-bold text-slate-300">Free Tier</h4>
                <p className="text-2xl font-bold text-white">$0 <span className="text-xs font-normal text-slate-400">/ mo</span></p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• 1 Resume</li>
                  <li>• 1 Published Portfolio</li>
                  <li>• Basic Templates</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-violet-500/40 bg-violet-500/10 p-4 space-y-2">
                <h4 className="font-bold text-violet-300">Pro SaaS Tier</h4>
                <p className="text-2xl font-bold text-white">$19 <span className="text-xs font-normal text-slate-400">/ mo</span></p>
                <ul className="text-xs text-violet-200 space-y-1">
                  <li>• Unlimited Resumes</li>
                  <li>• All 35 Resume Templates</li>
                  <li>• All 15 Portfolio Themes</li>
                  <li>• OpenAI AI Engine</li>
                </ul>
              </div>
            </div>

            <Button onClick={() => setShowUpgradeModal(false)} className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white">
              Close Window
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
