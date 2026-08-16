'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Rocket, ArrowRight } from 'lucide-react';

const navLinks: Array<{ href: string; label: string; isPrimary?: boolean }> = [
  { href: '#home', label: 'Home' },
  { href: '/dashboard/jobs', label: 'Job Openings' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#resume-builder', label: 'Resume Builder' },
  { href: '#portfolio-builder', label: 'Portfolio Builder' },
  { href: '#templates', label: 'Templates' },
  { href: '#faq', label: 'FAQ' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav py-3 shadow-2xl shadow-indigo-950/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#home" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#EC4899] p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                <Rocket className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                DevLaunch <span className="gradient-text-indigo font-extrabold">AI</span>
              </span>
            </div>
          </a>

          {/* Desktop / Tablet Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-6 flex-wrap justify-end">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium whitespace-nowrap text-gray-300 transition-colors hover:text-white"
              >
                <span>{link.label}</span>
              </a>
            ))}
            <a
              href="/login"
              className="inline-flex items-center gap-1 px-4 py-2.5 min-h-[44px] rounded-xl font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <span>Login</span>
            </a>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>Get Started</span>
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/60 focus:outline-none flex items-center justify-center touch-manipulation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden glass-nav border-b border-gray-800 px-4 pt-4 pb-6 mt-3 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="text-base font-medium text-gray-300 hover:text-white px-3 py-3 min-h-[44px] rounded-lg hover:bg-gray-800/40 flex items-center touch-manipulation"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-gray-800/60 space-y-2">
            <a
              href="/login"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors touch-manipulation"
            >
              <span>Login</span>
            </a>
            <a
              href="/signup"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 py-3 px-4 min-h-[48px] rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 touch-manipulation"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
