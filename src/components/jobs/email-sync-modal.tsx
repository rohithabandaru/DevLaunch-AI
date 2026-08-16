'use client';

import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, Power, Zap, Lock } from 'lucide-react';
import type { EmailConnection, EmailProvider } from '@/types/job-types';

interface EmailSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: EmailConnection[];
  onConnect: (provider: EmailProvider) => void;
  onDisconnect: (id: string) => void;
  onToggleAutoSync: (id: string) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export function EmailSyncModal({
  isOpen,
  onClose,
  connections,
  onConnect,
  onDisconnect,
  onToggleAutoSync,
  onSyncNow,
  isSyncing,
}: EmailSyncModalProps) {
  if (!isOpen) return null;

  const gmailConnection = connections.find((c) => c.provider === 'gmail');
  const outlookConnection = connections.find((c) => c.provider === 'outlook');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            <Mail className="h-3.5 w-3.5" /> AI Email Sync Engine
          </div>
          <h2 className="text-2xl font-extrabold text-white">Connect Job Application Email</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Securely link your Gmail or Outlook to automatically detect application responses, interview requests, and status changes in real-time.
          </p>
        </div>

        {/* Security & Privacy Assurance */}
        <div className="my-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Enterprise Privacy & Token Security
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            • We <strong>never</strong> ask for or store your email password.<br />
            • Only job-related emails (recruiters, status updates, interview invites) are processed.<br />
            • Tokens are encrypted server-side and you can disconnect anytime.
          </p>
        </div>

        {/* Providers Grid */}
        <div className="space-y-4">
          {/* Gmail */}
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">
                M
              </div>
              <div>
                <div className="font-bold text-xs text-white">Google Gmail</div>
                <div className="text-[11px] text-slate-400">
                  {gmailConnection ? `Connected as ${gmailConnection.email}` : 'Sync Greenhouse, Lever & recruiter emails'}
                </div>
              </div>
            </div>

            {gmailConnection ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDisconnect(gmailConnection.id)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => onConnect('gmail')}
                className="rounded-xl bg-white hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition"
              >
                Connect Gmail
              </button>
            )}
          </div>

          {/* Outlook */}
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                O
              </div>
              <div>
                <div className="font-bold text-xs text-white">Microsoft Outlook / Office 365</div>
                <div className="text-[11px] text-slate-400">
                  {outlookConnection ? `Connected as ${outlookConnection.email}` : 'Sync Outlook enterprise job threads'}
                </div>
              </div>
            </div>

            {outlookConnection ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDisconnect(outlookConnection.id)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => onConnect('outlook')}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
              >
                Connect Outlook
              </button>
            )}
          </div>
        </div>

        {/* Sync Controls & Auto-Sync Toggle */}
        {connections.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-slate-200">Automatic Background Syncing</span>
              </div>
              <button
                onClick={() => onToggleAutoSync(connections[0].id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  connections[0].autoSync ? 'bg-violet-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    connections[0].autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Last synced: {connections[0].lastSyncedAt ? new Date(connections[0].lastSyncedAt).toLocaleTimeString() : 'Just now'}
              </span>
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing Mailbox...' : 'Sync Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
