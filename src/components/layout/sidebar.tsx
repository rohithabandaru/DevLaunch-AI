'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Briefcase, BarChart3, Wand2, Layout, User, Settings, ShieldCheck, Sparkles, LogOut, Kanban, Sun, Moon, CreditCard } from 'lucide-react';
import { useAuth, useTheme } from '@/components/providers/app-provider';
import React from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'Job Tracker', icon: Kanban },
  { href: '/dashboard/resume', label: 'Resume Builder', icon: FileText },
  { href: '/dashboard/portfolio', label: 'Portfolio Builder', icon: Briefcase },
  { href: '/dashboard/ats', label: 'ATS Checker', icon: BarChart3 },
  { href: '/dashboard/cover-letter', label: 'Cover Letter', icon: Wand2 },
  { href: '/dashboard/templates', label: 'Templates', icon: Layout },
  { href: '/dashboard/billing', label: 'Billing & Plans', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl text-slate-100 selection:bg-violet-500/30">
      {/* App Branding Header */}
      <Link href="/dashboard" className="mb-6 flex items-center gap-2.5 px-3 py-2 text-lg font-bold tracking-tight">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          DevLaunch AI
        </span>
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Admin Link if role === 'admin' */}
        {user?.role === 'admin' && (
          <Link
            href="/dashboard/admin"
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition ${
              pathname === '/dashboard/admin'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-violet-300 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-violet-400" />
            <span>Admin Panel</span>
            <span className="ml-auto rounded bg-violet-500/30 px-1.5 py-0.5 text-[9px] uppercase font-bold text-violet-200">
              Pro
            </span>
          </Link>
        )}
      </nav>

      {/* User Footer Profile & Actions */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 font-bold text-violet-300 text-xs border border-violet-500/30">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : '…'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="truncate text-xs font-semibold text-white">{user?.name || 'Loading…'}</div>
            <div className="truncate text-[10px] text-slate-400">{user ? user.email : 'Restoring session…'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
              title="Toggle Dark / Light Mode"
            >
              {!mounted || theme === 'dark' ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-cyan-400" /> Dark
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" /> Light
                </>
              )}
            </button>

            <span className="text-[10px] text-slate-400">
              Role: {user?.role || 'user'}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-white/10 hover:text-red-300 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
