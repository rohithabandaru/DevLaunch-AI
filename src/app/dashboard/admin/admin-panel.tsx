'use client';

import React, { useState } from 'react';
import { Users, FileText, Globe, BarChart3, Search, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/providers/app-provider';

const INITIAL_USERS = [
  { id: 'usr-1', name: 'Alex Morgan', email: 'alex.morgan@devlaunch.ai', role: 'admin', tier: 'Pro', status: 'Active', joined: '2026-08-01' },
  { id: 'usr-2', name: 'Sarah Chen', email: 'sarah.chen@techscale.io', role: 'user', tier: 'Pro', status: 'Active', joined: '2026-08-02' },
  { id: 'usr-3', name: 'Marcus Vance', email: 'marcus@startup.co', role: 'user', tier: 'Free', status: 'Active', joined: '2026-07-28' },
  { id: 'usr-4', name: 'Elena Rostova', email: 'elena.rostova@dev.net', role: 'user', tier: 'Pro', status: 'Active', joined: '2026-07-25' },
];

const ADMIN_TABS = [
  { id: 'users', label: 'User Directory' },
  { id: 'templates', label: 'Template System' },
  { id: 'feedback', label: 'Feedback Feed' },
] as const;

export function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'templates' | 'feedback'>('users');

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" /> Admin Control Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mt-1">DevLaunch Admin Panel</h1>
          <p className="text-xs text-slate-400">System analytics, user management, template activation, and feedback feed.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
          Admin Session: <strong className="text-violet-300">{user?.email || 'admin'}</strong>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Platform Users', value: '1,420', icon: Users, accent: 'from-violet-500/20 to-violet-600/10' },
          { label: 'Resumes Generated', value: '4,890', icon: FileText, accent: 'from-cyan-500/20 to-cyan-600/10' },
          { label: 'Portfolios Published', value: '860', icon: Globe, accent: 'from-emerald-500/20 to-emerald-600/10' },
          { label: 'ATS Audits Run', value: '6,210', icon: BarChart3, accent: 'from-fuchsia-500/20 to-fuchsia-600/10' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${item.accent} p-5 backdrop-blur-xl flex items-center justify-between`}>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-3xl font-extrabold text-white mt-1">{item.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Management Navigation Tabs */}
      <div className="flex rounded-2xl bg-slate-950/70 p-1 border border-white/10 max-w-md">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
              activeTab === tab.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Platform Growth & Activity Trends SVG Visualizer */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" /> Platform Growth & System Activity Trends
            </h3>
            <p className="text-xs text-slate-400">Real-time daily telemetry: User Registrations, Resumes Created & ATS Scans</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-violet-300 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Registrations
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> ATS Audits
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Portfolios
            </span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative h-44 w-full pt-4">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Filled Areas */}
            <path d="M0,100 Q 80,70 160,85 T 320,40 T 500,20 L 500,115 L 0,115 Z" fill="url(#violetGrad)" />
            <path d="M0,110 Q 90,80 180,90 T 340,60 T 500,45 L 500,115 L 0,115 Z" fill="url(#cyanGrad)" />

            {/* Line Paths */}
            <path d="M0,100 Q 80,70 160,85 T 320,40 T 500,20" fill="none" stroke="#8b5cf6" strokeWidth="3" />
            <path d="M0,110 Q 90,80 180,90 T 340,60 T 500,45" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
            <path d="M0,115 Q 100,100 200,105 T 360,80 T 500,65" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="3 3" />
          </svg>

          <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-sm font-semibold text-white">Registered Platform Accounts</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white outline-none"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 capitalize">{u.role}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${u.tier === 'Pro' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/10 text-slate-300'}`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.joined}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                        {u.status === 'Active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="text-[11px] text-violet-400 hover:underline"
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Templates System Tab */}
      {activeTab === 'templates' && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">System Resume & Portfolio Templates</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'Developer Dark', category: 'Portfolio', status: 'Active (Default)', usage: '480 users' },
              { name: 'Modern Minimalist', category: 'Resume', status: 'Active', usage: '920 users' },
              { name: 'Executive ATS Standard', category: 'Resume', status: 'Active', usage: '1,310 users' },
            ].map((tmpl, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{tmpl.name}</h4>
                    <span className="text-[10px] text-violet-400 font-semibold">{tmpl.category}</span>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">
                    {tmpl.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  Usage: <strong className="text-slate-200">{tmpl.usage}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Feed */}
      {activeTab === 'feedback' && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-semibold text-white">Recent User Feedback</h3>
          <div className="space-y-3">
            {[
              { author: 'Sarah C.', rating: 5, comment: 'The AI resume bullet points generator saved me hours of editing!', date: 'Today' },
              { author: 'Marcus V.', rating: 5, comment: 'Published my portfolio with the Developer Dark theme in 10 minutes.', date: 'Yesterday' },
              { author: 'Elena R.', rating: 5, comment: 'The job tracker email sync feature keeps all my interviews organized without manual entry.', date: '2 days ago' },
            ].map((fb, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{fb.author}</span>
                  <span className="text-amber-400">{'★'.repeat(fb.rating)}</span>
                </div>
                <p className="text-slate-300">{fb.comment}</p>
                <div className="text-[10px] text-slate-500 pt-1">{fb.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}