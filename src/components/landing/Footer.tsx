'use client';

import React from 'react';
import { Rocket, Code2, Globe, MessageSquare, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-[#0B1020] border-t border-white/10 text-gray-400 py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#EC4899] p-0.5">
                <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                DevLaunch <span className="gradient-text-indigo">AI</span>
              </span>
            </a>

            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Empowering software engineers and developers to build ATS-optimized resumes and high-converting portfolio websites with state-of-the-art AI.
            </p>

            {/* Social Icons (Clean Inline SVGs for GitHub, X/Twitter, LinkedIn, Discord) */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all touch-manipulation"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all touch-manipulation"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all touch-manipulation"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all touch-manipulation"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition-colors">AI Resume Builder</a>
              </li>
              <li>
                <a href="/dashboard/jobs" className="hover:text-white transition-colors">AI Job Tracker</a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">Portfolio Generator</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">ATS Checker Engine</a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">Cover Letter AI</a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">Developer Career Guide</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">ATS Optimization Tips</a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-white transition-colors">Portfolio Examples</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">Help & FAQ</a>
              </li>
            </ul>
          </div>

          {/* Legal & Company Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition-colors">About DevLaunch</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">Security & Trust</a>
              </li>
              <li>
                <a href="mailto:rohithaaaaa.62@gmail.com" className="hover:text-white transition-colors">Contact Support</a>
              </li>
              <li>
                <a href="tel:+917842570368" className="hover:text-white transition-colors">📞 +91 7842570368</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} DevLaunch AI, Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-400">All systems operational</span>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <span>Crafted for developers with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
