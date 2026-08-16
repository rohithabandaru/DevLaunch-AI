'use client';

import { useState } from 'react';
import { MessageCircle, Mail, X, Phone } from 'lucide-react';

const WHATSAPP_NUMBER = '919178400000'; // Replace with your actual number
const WHATSAPP_MESSAGE = encodeURIComponent('Hi! I have a question about DevLaunch AI.');
const EMAIL_ADDRESS = 'support@devlaunch.ai';
const EMAIL_SUBJECT = encodeURIComponent('DevLaunch AI — Support Request');

export function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* ── Expanded options ── */}
      <div
        className={`flex flex-col gap-2.5 transition-all duration-300 origin-bottom ${
          open
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
        }`}
      >
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          <span className="hidden group-hover:inline-flex items-center rounded-xl bg-slate-900/90 border border-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
            Chat on WhatsApp
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/30 transition-all hover:scale-110 hover:shadow-green-500/50 active:scale-95">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </a>

        {/* Email */}
        <a
          href={`mailto:${EMAIL_ADDRESS}?subject=${EMAIL_SUBJECT}`}
          className="group flex items-center gap-3"
        >
          <span className="hidden group-hover:inline-flex items-center rounded-xl bg-slate-900/90 border border-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
            Send us an Email
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-110 hover:shadow-violet-500/50 active:scale-95">
            <Mail className="h-5 w-5" />
          </div>
        </a>

        {/* Phone / Call */}
        <a
          href="tel:+919178400000"
          className="group flex items-center gap-3"
        >
          <span className="hidden group-hover:inline-flex items-center rounded-xl bg-slate-900/90 border border-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
            Call Us
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-110 hover:shadow-cyan-500/50 active:scale-95">
            <Phone className="h-5 w-5" />
          </div>
        </a>
      </div>

      {/* ── Main FAB toggle ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close contact menu' : 'Open contact menu'}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-90 ${
          open
            ? 'bg-slate-800 border border-white/15 rotate-0 shadow-slate-900/50'
            : 'bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105'
        }`}
      >
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 opacity-40 animate-ping" />
        )}
        <span className="relative transition-transform duration-300" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </span>
      </button>
    </div>
  );
}
