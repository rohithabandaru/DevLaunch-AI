'use client';

import React from 'react';
import { Mail, RefreshCw, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import type { EmailConnection, EmailProvider } from '@/types/job-types';

interface EmailSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: EmailConnection[];
  onConnect: (provider: EmailProvider, email: string) => void;
  onDisconnect: (id: string) => void;
  onToggleAutoSync: (id: string) => void;
  onSyncNow: () => void;
  onParsePastedEmail?: (text: string) => Promise<void>;
  isSyncing: boolean;
  defaultEmail?: string;
}

export function EmailSyncModal({
  isOpen,
  onClose,
  connections,
  onConnect,
  onDisconnect,
  onToggleAutoSync,
  onSyncNow,
  onParsePastedEmail,
  isSyncing,
  defaultEmail = '',
}: EmailSyncModalProps) {
  const [customEmail, setCustomEmail] = React.useState(defaultEmail);
  const [prevDefaultEmail, setPrevDefaultEmail] = React.useState(defaultEmail);
  const [pastedEmailText, setPastedEmailText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'connect' | 'paste'>('connect');

  if (defaultEmail !== prevDefaultEmail) {
    setPrevDefaultEmail(defaultEmail);
    setCustomEmail(defaultEmail);
  }

  if (!isOpen) return null;

  const gmailConnection = connections.find((c) => c.provider === 'gmail');
  const outlookConnection = connections.find((c) => c.provider === 'outlook');

  const handlePasteSubmit = async () => {
    if (!pastedEmailText.trim() || !onParsePastedEmail) return;
    await onParsePastedEmail(pastedEmailText);
    setPastedEmailText('');
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-8 shadow-2xl my-8">
        {/* Sticky Header Top Navigation */}
        <div className="sticky -top-6 sm:-top-8 z-30 flex items-center justify-between bg-slate-900/95 backdrop-blur-md pb-4 pt-2 border-b border-white/10 -mx-6 sm:-mx-8 px-6 sm:px-8 mb-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
            Back to Board
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-white transition shadow-sm"
          >
            <span>Close</span> ✕
          </button>
        </div>

        {/* Modal Header */}
        <div className="space-y-2 pb-5 border-b border-white/10 pr-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            <Mail className="h-3.5 w-3.5" /> AI Email Sync Engine
          </div>
          <h2 className="text-2xl font-extrabold text-white">Connect Job Application Email</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Link your Gmail/Outlook account or paste application emails directly to detect status changes and interview invites.
          </p>
        </div>

        {/* Modal Mode Switcher Tabs */}
        <div className="my-4 flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              activeTab === 'connect' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Auto-Sync Account ({customEmail})
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              activeTab === 'paste' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Paste Confirmation Email
          </button>
        </div>

        {activeTab === 'connect' ? (
          <>
            {/* Security & Privacy Assurance */}
            <div className="my-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Enterprise Privacy & Token Security
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • We <strong>never</strong> ask for or store your email password.<br />
                • Only job-related emails (recruiters, status updates, interview invites) are processed.<br />
                • Tokens are encrypted server-side and you can disconnect anytime.
              </p>
            </div>

            {/* Custom Email Target Field */}
            <div className="mb-4 space-y-1.5 rounded-2xl border border-white/10 bg-slate-950 p-4">
              <label className="block text-xs font-bold text-slate-200">
                Target Email Address to Connect & Sync
              </label>
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Pre-filled with your logged-in email. You can type any custom email address used for job applications.
              </p>
            </div>

            {/* Providers Grid */}
            <div className="space-y-4">
              {/* Gmail */}
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">
                      M
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Google Gmail</div>
                      <div className="text-[11px] text-slate-400">
                        {gmailConnection ? (
                          <span className="text-emerald-400">✓ Connected as {gmailConnection.email}</span>
                        ) : (
                          'Sync Greenhouse, Lever & recruiter emails'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {gmailConnection ? (
                      <>
                        {customEmail.trim() && customEmail.trim().toLowerCase() !== gmailConnection.email.toLowerCase() && (
                          <button
                            onClick={() => {
                              onDisconnect(gmailConnection.id);
                              setTimeout(() => onConnect('gmail', customEmail), 100);
                            }}
                            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                          >
                            Switch to {customEmail.trim().length > 20 ? customEmail.trim().slice(0, 18) + '…' : customEmail.trim()}
                          </button>
                        )}
                        <button
                          onClick={() => onDisconnect(gmailConnection.id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onConnect('gmail', customEmail)}
                        className="rounded-xl bg-white hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition"
                      >
                        Connect Gmail
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Outlook */}
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                      O
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Microsoft Outlook / Office 365</div>
                      <div className="text-[11px] text-slate-400">
                        {outlookConnection ? (
                          <span className="text-emerald-400">✓ Connected as {outlookConnection.email}</span>
                        ) : (
                          'Sync Outlook enterprise job threads'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {outlookConnection ? (
                      <>
                        {customEmail.trim() && customEmail.trim().toLowerCase() !== outlookConnection.email.toLowerCase() && (
                          <button
                            onClick={() => {
                              onDisconnect(outlookConnection.id);
                              setTimeout(() => onConnect('outlook', customEmail), 100);
                            }}
                            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                          >
                            Switch to {customEmail.trim().length > 20 ? customEmail.trim().slice(0, 18) + '…' : customEmail.trim()}
                          </button>
                        )}
                        <button
                          onClick={() => onDisconnect(outlookConnection.id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onConnect('outlook', customEmail)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
                      >
                        Connect Outlook
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Controls & Auto-Sync Toggle */}
            {connections.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
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
          </>
        ) : (
          /* Paste Email Tab */
          <div className="space-y-4 my-4">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-1.5">
              <div className="text-xs font-bold text-cyan-300">
                Instant AI Email Parser for {customEmail}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Paste any email body text received from Greenhouse, Lever, LinkedIn, or recruiters. Our AI will automatically extract the Company Name, Job Title, Stage, and Recruiter details!
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Paste Application or Recruiter Email Text
              </label>
              <textarea
                rows={5}
                placeholder="Example: 'Thank you for applying for the Senior Software Engineer role at Google. We are pleased to invite you for a technical screen...'"
                value={pastedEmailText}
                onChange={(e) => setPastedEmailText(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 p-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <button
              onClick={handlePasteSubmit}
              disabled={!pastedEmailText.trim() || isSyncing}
              className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isSyncing ? 'Extracting & Adding Job...' : 'AI Extract & Add to My Job Tracker'}
            </button>
          </div>
        )}

        {/* Bottom Footer Actions */}
        <div className="mt-5 pt-5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 transition"
          >
            ← Back to Job Tracker
          </button>
        </div>
      </div>
    </div>
  );
}
