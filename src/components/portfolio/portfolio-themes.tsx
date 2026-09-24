'use client';

import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Quote,
  ExternalLink,
  Mail,
  MapPin,
  GitBranch as Github,
  Share2 as Linkedin,
} from 'lucide-react';

export interface PortfolioData {
  hero: {
    name: string;
    title: string;
    tagline: string;
    avatarUrl?: string;
    resumeUrl?: string;
  };
  about: {
    bio: string;
    yearsOfExperience: string;
    location: string;
  };
  skills: Array<{ name: string; level?: string; category?: string }>;
  experience: Array<{
    role: string;
    company: string;
    period: string;
    description: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    techStack: string[];
    githubUrl?: string;
    liveUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    category?: string;
    featured?: boolean;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  certifications: Array<{ name: string; issuer: string; year: string }>;
  achievements: Array<{ title: string; detail: string; year: string }>;
  services: Array<{ title: string; description: string; icon?: string }>;
  testimonials: Array<{ author: string; role: string; content: string; avatar?: string }>;
  blog: Array<{ title: string; snippet: string; date: string; readTime?: string }>;
  contact: {
    email: string;
    phone?: string;
    availableForHire: boolean;
  };
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export const PORTFOLIO_THEMES = [
  { id: 'developer-dark', name: 'Developer Dark', style: 'Terminal chrome with Monokai highlights', category: 'Dark' },
  { id: 'glassmorphism', name: 'Glassmorphism', style: 'Frosted glass cards on a violet mesh', category: 'Modern' },
  { id: 'minimal', name: 'Minimal', style: 'Swiss typography, stark black and white', category: 'Minimal' },
  { id: 'modern', name: 'Modern', style: 'Indigo SaaS cards with soft rounded chrome', category: 'Modern' },
  { id: 'creative', name: 'Creative', style: 'Split hero, bold gradients, playful shapes', category: 'Creative' },
  { id: 'corporate', name: 'Corporate', style: 'Navy sidebar, executive grid, dense info', category: 'Corporate' },
  { id: 'startup', name: 'Startup', style: 'High-conversion landing with metric tiles', category: 'Startup' },
  { id: 'neon', name: 'Neon', style: 'Cyberpunk cyan and magenta on obsidian', category: 'Dark' },
  { id: 'gradient', name: 'Gradient', style: 'Sunset mesh backdrop with luminous type', category: 'Creative' },
  { id: 'portfolio-pro', name: 'Portfolio Pro', style: 'Fixed sidebar layout for tech leads', category: 'Pro' },
  { id: 'elegant', name: 'Elegant', style: 'Charcoal editorial with warm amber foil', category: 'Elegant' },
  { id: '3d', name: '3D', style: 'Elevated isometric cards with deep shadows', category: '3D' },
  { id: 'apple-style', name: 'Apple Style', style: 'Light San Francisco surface, quiet shadows', category: 'Minimal' },
  { id: 'vercel-style', name: 'Vercel Style', style: 'Dark geodetic grid, monochrome lockup', category: 'Minimal' },
  { id: 'linear-style', name: 'Linear Style', style: 'Deep purple slate inspired by Linear', category: 'Modern' },
  { id: 'nordic', name: 'Nordic', style: 'Scandinavian light, cool slate, generous space', category: 'Minimal' },
  { id: 'editorial', name: 'Editorial', style: 'Magazine serif lockup on ivory paper', category: 'Creative' },
  { id: 'midnight-gold', name: 'Midnight Gold', style: 'Luxury black canvas with gold foil accents', category: 'Elegant' },
  { id: 'paper', name: 'Paper', style: 'Warm cream stationery with hairline rules', category: 'Minimal' },
  { id: 'brutalist', name: 'Brutalist', style: 'Raw black, hard edges, electric yellow stamps', category: 'Creative' },
  { id: 'aurora', name: 'Aurora', style: 'Northern-lights mesh over polar night', category: 'Creative' },
  { id: 'tokyo-night', name: 'Tokyo Night', style: 'VS Code Tokyo Night editor chrome', category: 'Dark' },
  { id: 'forest', name: 'Forest', style: 'Moss and bark sidebar, grounded type', category: 'Corporate' },
  { id: 'ocean', name: 'Ocean', style: 'Deep teal currents with seafoam chips', category: 'Modern' },
  { id: 'rose', name: 'Rose Atelier', style: 'Blush editorial with soft serif headings', category: 'Elegant' },
  { id: 'architect', name: 'Architect', style: 'Blueprint grid, technical drawing energy', category: 'Pro' },
  { id: 'phosphor', name: 'Phosphor', style: 'CRT green phosphor on true black', category: 'Dark' },
  { id: 'swiss-light', name: 'Swiss Light', style: 'International typographic grid on white', category: 'Minimal' },
  { id: 'canvas', name: 'Canvas Gallery', style: 'Museum-white, project-first exhibition', category: 'Creative' },
  { id: 'fintech', name: 'Fintech', style: 'Trust navy, teal metrics, conversion landing', category: 'Startup' },
  // 5 New Premium Themes
  { id: 'emerald-luxury', name: 'Emerald Luxury', style: 'Deep emerald velvet with gold leaf accents', category: 'Elegant' },
  { id: 'cyber-glitch', name: 'Cyber Glitch', style: 'High-octane neon violet & electric lime', category: 'Dark' },
  { id: 'mocha', name: 'Mocha Minimal', style: 'Warm espresso and cozy latte typography', category: 'Minimal' },
  { id: 'glass-mesh', name: 'Glass Mesh', style: 'Vibrant multi-color mesh gradient behind frosted glass', category: 'Modern' },
  { id: 'retro-synth', name: 'Retro Synthwave', style: '1980s synthwave sunset grid with hot pink highlights', category: 'Creative' },
] as const;

export type PortfolioThemeId = (typeof PORTFOLIO_THEMES)[number]['id'] | string;

type PortfolioLayout = 'stack' | 'swiss' | 'terminal' | 'sidebar' | 'magazine' | 'split' | 'gallery' | 'landing';

interface ThemeTokens {
  layout: PortfolioLayout;
  page: string;
  text: string;
  muted: string;
  heading: string;
  accent: string;
  card: string;
  border: string;
  chip: string;
  hero?: string;
  font?: string;
  label?: string;
}

const DEFAULT_THEME: ThemeTokens = {
  layout: 'stack',
  page: 'min-h-screen bg-slate-950 text-slate-100 font-sans',
  text: 'text-slate-100',
  muted: 'text-slate-400',
  heading: 'text-white',
  accent: 'text-violet-300',
  card: 'rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl',
  border: 'border-white/10',
  chip: 'rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300',
  hero: 'rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl',
  font: 'font-sans',
  label: 'text-xs uppercase tracking-widest text-violet-300',
};

const THEMES: Record<string, ThemeTokens> = {
  'developer-dark': {
    layout: 'terminal',
    page: 'min-h-screen bg-slate-950 text-cyan-300 font-mono',
    text: 'text-cyan-100',
    muted: 'text-slate-400',
    heading: 'text-white',
    accent: 'text-fuchsia-400',
    card: 'rounded-xl border border-cyan-500/30 bg-slate-900/70',
    border: 'border-cyan-500/30',
    chip: 'rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300',
    font: 'font-mono',
    label: 'text-xs uppercase tracking-widest text-fuchsia-400',
  },
  glassmorphism: {
    ...DEFAULT_THEME,
    layout: 'stack',
  },
  minimal: {
    layout: 'swiss',
    page: 'min-h-screen bg-black text-slate-100 font-sans',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-white',
    accent: 'text-white',
    card: 'border border-white/20 bg-transparent',
    border: 'border-white/20',
    chip: 'border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300',
    font: 'font-sans',
    label: 'text-xs uppercase tracking-widest text-slate-400',
  },
  modern: {
    layout: 'stack',
    page: 'min-h-screen bg-indigo-950 text-slate-100 font-sans',
    text: 'text-slate-100',
    muted: 'text-indigo-200/70',
    heading: 'text-white',
    accent: 'text-indigo-300',
    card: 'rounded-3xl border border-indigo-400/20 bg-indigo-900/40 backdrop-blur-xl',
    border: 'border-indigo-400/20',
    chip: 'rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] text-indigo-200',
    hero: 'rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-800/60 to-violet-900/40 p-8 sm:p-12',
    label: 'text-xs uppercase tracking-widest text-indigo-300',
  },
  creative: {
    layout: 'split',
    page: 'min-h-screen bg-fuchsia-950 text-slate-50 font-sans',
    text: 'text-slate-50',
    muted: 'text-fuchsia-200/70',
    heading: 'text-white',
    accent: 'text-amber-300',
    card: 'rounded-3xl border border-fuchsia-400/20 bg-fuchsia-900/40',
    border: 'border-fuchsia-400/20',
    chip: 'rounded-full bg-amber-400/20 px-3 py-1 text-[11px] text-amber-200',
    hero: 'rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-fuchsia-600/40 via-violet-700/30 to-amber-500/20 p-8 sm:p-12',
    label: 'text-xs uppercase tracking-[0.2em] text-amber-300',
  },
  corporate: {
    layout: 'sidebar',
    page: 'min-h-screen bg-slate-100 text-slate-900 font-sans',
    text: 'text-slate-800',
    muted: 'text-slate-500',
    heading: 'text-slate-900',
    accent: 'text-slate-800',
    card: 'rounded-xl border border-slate-200 bg-white shadow-sm',
    border: 'border-slate-200',
    chip: 'rounded bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white',
    hero: 'bg-slate-900 text-white p-8',
    label: 'text-xs uppercase tracking-widest text-slate-500',
  },
  startup: {
    layout: 'landing',
    page: 'min-h-screen bg-slate-950 text-slate-100 font-sans',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-white',
    accent: 'text-emerald-300',
    card: 'rounded-2xl border border-white/10 bg-white/5',
    border: 'border-white/10',
    chip: 'rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200',
    hero: 'rounded-3xl bg-gradient-to-b from-emerald-600/20 to-transparent p-8 sm:p-14',
    label: 'text-xs uppercase tracking-widest text-emerald-300',
  },
  neon: {
    layout: 'terminal',
    page: 'min-h-screen bg-black text-cyan-300 font-mono',
    text: 'text-cyan-100',
    muted: 'text-fuchsia-300/70',
    heading: 'text-white',
    accent: 'text-fuchsia-400',
    card: 'rounded-xl border border-fuchsia-500/40 bg-black shadow-[0_0_24px_rgba(217,70,239,0.15)]',
    border: 'border-cyan-400/40',
    chip: 'rounded border border-cyan-400/50 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.3)]',
    label: 'text-xs uppercase tracking-widest text-fuchsia-400',
    font: 'font-mono',
  },
  gradient: {
    layout: 'split',
    page: 'min-h-screen bg-gradient-to-br from-rose-900 via-orange-900 to-amber-800 text-white font-sans',
    text: 'text-white',
    muted: 'text-amber-100/70',
    heading: 'text-white',
    accent: 'text-amber-200',
    card: 'rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl',
    border: 'border-white/20',
    chip: 'rounded-full bg-white/15 px-3 py-1 text-[11px] text-amber-50',
    hero: 'rounded-[2rem] border border-white/20 bg-white/10 p-8 sm:p-12 backdrop-blur-2xl',
    label: 'text-xs uppercase tracking-widest text-amber-200',
  },
  'portfolio-pro': {
    layout: 'sidebar',
    page: 'min-h-screen bg-zinc-950 text-zinc-100 font-sans',
    text: 'text-zinc-100',
    muted: 'text-zinc-400',
    heading: 'text-white',
    accent: 'text-sky-300',
    card: 'rounded-2xl border border-zinc-800 bg-zinc-900/80',
    border: 'border-zinc-800',
    chip: 'rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300',
    hero: 'bg-zinc-900 p-8',
    label: 'text-xs uppercase tracking-widest text-sky-400',
  },
  elegant: {
    layout: 'magazine',
    page: 'min-h-screen bg-neutral-950 text-amber-50 font-serif',
    text: 'text-amber-50',
    muted: 'text-amber-200/60',
    heading: 'text-amber-100',
    accent: 'text-amber-400',
    card: 'border border-amber-500/20 bg-neutral-900/70',
    border: 'border-amber-500/20',
    chip: 'border border-amber-500/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-300',
    font: 'font-serif',
    label: 'text-xs uppercase tracking-[0.25em] text-amber-400',
  },
  '3d': {
    layout: 'stack',
    page: 'min-h-screen bg-slate-950 text-slate-100 font-sans',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-white',
    accent: 'text-sky-300',
    card: 'rounded-3xl border border-white/10 bg-slate-900 shadow-[12px_12px_0_0_rgba(56,189,248,0.18)]',
    border: 'border-white/10',
    chip: 'rounded-lg bg-sky-500/15 px-2.5 py-1 text-[11px] text-sky-200',
    hero: 'rounded-3xl border border-white/10 bg-slate-900 p-8 sm:p-12 shadow-[16px_16px_0_0_rgba(99,102,241,0.25)]',
    label: 'text-xs uppercase tracking-widest text-sky-300',
  },
  'apple-style': {
    layout: 'stack',
    page: 'min-h-screen bg-[#f5f5f7] text-zinc-900 font-sans',
    text: 'text-zinc-800',
    muted: 'text-zinc-500',
    heading: 'text-zinc-900',
    accent: 'text-blue-600',
    card: 'rounded-3xl border border-black/5 bg-white shadow-sm',
    border: 'border-black/5',
    chip: 'rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-600',
    hero: 'rounded-3xl bg-white p-8 sm:p-12 shadow-sm',
    label: 'text-xs uppercase tracking-widest text-zinc-400',
  },
  'vercel-style': {
    layout: 'swiss',
    page: 'min-h-screen bg-black text-zinc-100 font-sans',
    text: 'text-zinc-100',
    muted: 'text-zinc-500',
    heading: 'text-white',
    accent: 'text-white',
    card: 'border border-zinc-800 bg-zinc-950',
    border: 'border-zinc-800',
    chip: 'border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400',
    label: 'text-xs uppercase tracking-widest text-zinc-500',
  },
  'linear-style': {
    layout: 'stack',
    page: 'min-h-screen bg-[#0f0f17] text-slate-100 font-sans',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-white',
    accent: 'text-violet-300',
    card: 'rounded-2xl border border-white/10 bg-[#16161f]',
    border: 'border-white/10',
    chip: 'rounded-md bg-violet-500/15 px-2 py-0.5 text-[11px] text-violet-200',
    hero: 'rounded-2xl border border-white/10 bg-[#16161f] p-8 sm:p-12',
    label: 'text-xs uppercase tracking-widest text-violet-300',
  },
  nordic: {
    layout: 'stack',
    page: 'min-h-screen bg-stone-100 text-stone-800 font-sans',
    text: 'text-stone-800',
    muted: 'text-stone-500',
    heading: 'text-stone-900',
    accent: 'text-sky-700',
    card: 'rounded-2xl border border-stone-200 bg-white',
    border: 'border-stone-200',
    chip: 'rounded-full bg-sky-50 px-3 py-1 text-[11px] text-sky-800',
    hero: 'rounded-2xl border border-stone-200 bg-white p-8 sm:p-12',
    label: 'text-xs uppercase tracking-widest text-sky-700',
  },
  editorial: {
    layout: 'magazine',
    page: 'min-h-screen bg-[#f4efe6] text-stone-900 font-serif',
    text: 'text-stone-800',
    muted: 'text-stone-500',
    heading: 'text-stone-900',
    accent: 'text-rose-800',
    card: 'border border-stone-300 bg-[#faf6ef]',
    border: 'border-stone-300',
    chip: 'border border-stone-400 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-stone-600',
    font: 'font-serif',
    label: 'text-xs uppercase tracking-[0.22em] text-rose-800',
  },
  'midnight-gold': {
    layout: 'magazine',
    page: 'min-h-screen bg-black text-amber-50 font-serif',
    text: 'text-amber-50',
    muted: 'text-amber-200/50',
    heading: 'text-amber-100',
    accent: 'text-amber-400',
    card: 'border border-amber-500/25 bg-[#111008]',
    border: 'border-amber-500/25',
    chip: 'border border-amber-400/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-300',
    font: 'font-serif',
    label: 'text-xs uppercase tracking-[0.28em] text-amber-400',
  },
  paper: {
    layout: 'swiss',
    page: 'min-h-screen bg-[#f3ead8] text-stone-900 font-serif',
    text: 'text-stone-800',
    muted: 'text-stone-600',
    heading: 'text-stone-900',
    accent: 'text-stone-900',
    card: 'border border-stone-400/50 bg-[#f8f1e3]',
    border: 'border-stone-400/50',
    chip: 'border border-stone-500 px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-700',
    font: 'font-serif',
    label: 'text-xs uppercase tracking-widest text-stone-600',
  },
  brutalist: {
    layout: 'swiss',
    page: 'min-h-screen bg-zinc-950 text-yellow-300 font-sans',
    text: 'text-yellow-50',
    muted: 'text-yellow-200/60',
    heading: 'text-yellow-300',
    accent: 'text-yellow-300',
    card: 'border-2 border-yellow-300 bg-black',
    border: 'border-yellow-300',
    chip: 'bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase text-black',
    label: 'text-xs font-black uppercase tracking-[0.2em] text-yellow-300',
  },
  aurora: {
    layout: 'split',
    page: 'min-h-screen bg-[#06121f] text-cyan-50 font-sans',
    text: 'text-cyan-50',
    muted: 'text-cyan-200/60',
    heading: 'text-white',
    accent: 'text-emerald-300',
    card: 'rounded-3xl border border-emerald-400/20 bg-cyan-950/50 backdrop-blur-xl',
    border: 'border-emerald-400/20',
    chip: 'rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] text-emerald-200',
    hero: 'rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-emerald-500/20 via-cyan-700/20 to-violet-700/20 p-8 sm:p-12',
    label: 'text-xs uppercase tracking-widest text-emerald-300',
  },
  'tokyo-night': {
    layout: 'terminal',
    page: 'min-h-screen bg-[#1a1b26] text-[#a9b1d6] font-mono',
    text: 'text-[#c0caf5]',
    muted: 'text-[#565f89]',
    heading: 'text-[#c0caf5]',
    accent: 'text-[#bb9af7]',
    card: 'rounded-lg border border-[#3b4261] bg-[#24283b]',
    border: 'border-[#3b4261]',
    chip: 'rounded bg-[#7aa2f7]/15 px-2 py-0.5 text-[10px] text-[#7aa2f7]',
    font: 'font-mono',
    label: 'text-xs uppercase tracking-widest text-[#bb9af7]',
  },
  forest: {
    layout: 'sidebar',
    page: 'min-h-screen bg-emerald-50 text-emerald-950 font-sans',
    text: 'text-emerald-950',
    muted: 'text-emerald-800/70',
    heading: 'text-emerald-950',
    accent: 'text-emerald-800',
    card: 'rounded-2xl border border-emerald-200 bg-white',
    border: 'border-emerald-200',
    chip: 'rounded-md bg-emerald-800 px-2 py-0.5 text-[10px] text-emerald-50',
    hero: 'bg-emerald-950 text-emerald-50 p-8',
    label: 'text-xs uppercase tracking-widest text-emerald-700',
  },
  ocean: {
    layout: 'stack',
    page: 'min-h-screen bg-teal-950 text-teal-50 font-sans',
    text: 'text-teal-50',
    muted: 'text-teal-200/70',
    heading: 'text-white',
    accent: 'text-cyan-300',
    card: 'rounded-3xl border border-teal-400/20 bg-teal-900/50',
    border: 'border-teal-400/20',
    chip: 'rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] text-cyan-100',
    hero: 'rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-teal-800 to-cyan-950 p-8 sm:p-12',
    label: 'text-xs uppercase tracking-widest text-cyan-300',
  },
  rose: {
    layout: 'magazine',
    page: 'min-h-screen bg-rose-50 text-rose-950 font-serif',
    text: 'text-rose-950',
    muted: 'text-rose-800/60',
    heading: 'text-rose-950',
    accent: 'text-rose-700',
    card: 'border border-rose-200 bg-white',
    border: 'border-rose-200',
    chip: 'rounded-full bg-rose-100 px-3 py-1 text-[11px] text-rose-800',
    font: 'font-serif',
    label: 'text-xs uppercase tracking-[0.22em] text-rose-600',
  },
  architect: {
    layout: 'gallery',
    page: 'min-h-screen bg-[#0b1c2c] text-sky-100 font-mono',
    text: 'text-sky-100',
    muted: 'text-sky-300/60',
    heading: 'text-sky-50',
    accent: 'text-sky-300',
    card: 'border border-sky-500/30 bg-sky-950/40',
    border: 'border-sky-500/30',
    chip: 'border border-sky-400/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-sky-200',
    font: 'font-mono',
    label: 'text-xs uppercase tracking-[0.2em] text-sky-300',
  },
  phosphor: {
    layout: 'terminal',
    page: 'min-h-screen bg-black text-green-400 font-mono',
    text: 'text-green-300',
    muted: 'text-green-600',
    heading: 'text-green-200',
    accent: 'text-green-400',
    card: 'border border-green-500/30 bg-green-950/20',
    border: 'border-green-500/30',
    chip: 'border border-green-500/40 px-2 py-0.5 text-[10px] text-green-300',
    font: 'font-mono',
    label: 'text-xs uppercase tracking-widest text-green-500',
  },
  'swiss-light': {
    layout: 'swiss',
    page: 'min-h-screen bg-white text-zinc-900 font-sans',
    text: 'text-zinc-900',
    muted: 'text-zinc-500',
    heading: 'text-black',
    accent: 'text-black',
    card: 'border border-zinc-200 bg-white',
    border: 'border-zinc-200',
    chip: 'border border-zinc-300 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-600',
    label: 'text-xs uppercase tracking-widest text-zinc-400',
  },
  canvas: {
    layout: 'gallery',
    page: 'min-h-screen bg-neutral-50 text-neutral-900 font-sans',
    text: 'text-neutral-800',
    muted: 'text-neutral-500',
    heading: 'text-neutral-900',
    accent: 'text-neutral-900',
    card: 'border border-neutral-200 bg-white shadow-sm',
    border: 'border-neutral-200',
    chip: 'bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neutral-600',
    label: 'text-xs uppercase tracking-[0.2em] text-neutral-400',
  },
  fintech: {
    layout: 'landing',
    page: 'min-h-screen bg-[#071422] text-slate-100 font-sans',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-white',
    accent: 'text-teal-300',
    card: 'rounded-2xl border border-teal-500/20 bg-[#0c1d2e]',
    border: 'border-teal-500/20',
    chip: 'rounded-md bg-teal-500/15 px-2.5 py-1 text-[11px] text-teal-200',
    hero: 'rounded-3xl bg-gradient-to-br from-teal-600/20 to-[#071422] p-8 sm:p-14',
    label: 'text-xs uppercase tracking-widest text-teal-300',
  },
  'emerald-luxury': {
    layout: 'magazine',
    page: 'min-h-screen bg-[#041a14] text-emerald-100 font-serif',
    text: 'text-emerald-100',
    muted: 'text-emerald-400/60',
    heading: 'text-amber-200',
    accent: 'text-amber-300',
    card: 'rounded-2xl border border-amber-500/20 bg-[#06241c] backdrop-blur-xl',
    border: 'border-amber-500/20',
    chip: 'rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200',
    font: 'font-serif',
    label: 'text-xs uppercase tracking-[0.22em] text-amber-400',
  },
  'cyber-glitch': {
    layout: 'terminal',
    page: 'min-h-screen bg-[#0d021a] text-purple-200 font-mono',
    text: 'text-purple-100',
    muted: 'text-purple-400/60',
    heading: 'text-lime-300',
    accent: 'text-fuchsia-400',
    card: 'rounded-xl border border-fuchsia-500/40 bg-[#16042b]',
    border: 'border-fuchsia-500/40',
    chip: 'rounded border border-lime-400/40 bg-lime-400/10 px-2 py-0.5 text-[10px] text-lime-300',
    font: 'font-mono',
    label: 'text-xs uppercase tracking-widest text-fuchsia-400',
  },
  mocha: {
    layout: 'swiss',
    page: 'min-h-screen bg-[#1c1917] text-[#e7e5e4] font-sans',
    text: 'text-[#e7e5e4]',
    muted: 'text-[#a8a29e]',
    heading: 'text-[#f5f5f4]',
    accent: 'text-[#d6d3d1]',
    card: 'rounded-2xl border border-[#44403c] bg-[#262626]',
    border: 'border-[#44403c]',
    chip: 'rounded-md bg-[#383531] px-2.5 py-1 text-[11px] text-[#d6d3d1]',
    label: 'text-xs uppercase tracking-widest text-[#a8a29e]',
  },
  'glass-mesh': {
    layout: 'stack',
    page: 'min-h-screen bg-slate-950 text-slate-100 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-cyan-900/20 to-slate-950',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-white',
    accent: 'text-cyan-300',
    card: 'rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl',
    border: 'border-white/20',
    chip: 'rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-200',
    label: 'text-xs uppercase tracking-widest text-cyan-300',
  },
  'retro-synth': {
    layout: 'landing',
    page: 'min-h-screen bg-[#120024] text-pink-100 font-sans',
    text: 'text-pink-100',
    muted: 'text-pink-400/70',
    heading: 'text-cyan-300',
    accent: 'text-pink-400',
    card: 'rounded-2xl border border-pink-500/30 bg-[#1f003b]',
    border: 'border-pink-500/30',
    chip: 'rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300',
    hero: 'rounded-3xl border border-pink-500/40 bg-gradient-to-b from-[#330066] to-[#120024] p-8 sm:p-14',
    label: 'text-xs uppercase tracking-widest text-pink-400',
  },
};

function getTheme(themeId: string): ThemeTokens {
  return THEMES[themeId] ?? DEFAULT_THEME;
}

function ProjectLinks({ proj, className }: { proj: PortfolioData['projects'][number]; className: string }) {
  if (!proj.githubUrl && !proj.liveUrl) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {proj.githubUrl && (
        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
          <Github className="h-3 w-3" /> GitHub
        </a>
      )}
      {proj.liveUrl && (
        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
          <ExternalLink className="h-3 w-3" /> Live
        </a>
      )}
    </div>
  );
}

function SkillChips({ skills, t }: { skills: PortfolioData['skills']; t: ThemeTokens }) {
  if (!skills.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s, i) => (
        <span key={`${s.name}-${i}`} className={t.chip}>
          {s.name}
        </span>
      ))}
    </div>
  );
}

function SocialRow({ data, className }: { data: PortfolioData; className: string }) {
  const { contact, socialLinks } = data;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {contact.email && (
        <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 hover:underline">
          <Mail className="h-3.5 w-3.5" /> {contact.email}
        </a>
      )}
      {socialLinks.github && (
        <a href={socialLinks.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
          <Github className="h-3.5 w-3.5" /> GitHub
        </a>
      )}
      {socialLinks.linkedin && (
        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
        </a>
      )}
    </div>
  );
}

function ExperienceList({ experience, t }: { experience: PortfolioData['experience']; t: ThemeTokens }) {
  if (!experience.length) return null;
  return (
    <div className="space-y-4">
      {experience.map((exp, i) => (
        <div key={i} className={`border-l-2 ${t.border} pl-4 space-y-1 break-inside-avoid print:break-inside-avoid`}>
          <div className="flex flex-wrap justify-between gap-2 text-sm font-bold">
            <span className={t.heading}>{exp.role}</span>
            <span className={`text-xs ${t.accent}`}>{exp.period}</span>
          </div>
          <div className={`text-xs font-medium ${t.accent}`}>{exp.company}</div>
          <p className={`text-xs leading-relaxed ${t.muted}`}>{exp.description}</p>
        </div>
      ))}
    </div>
  );
}

function EducationList({ education, t }: { education: PortfolioData['education']; t: ThemeTokens }) {
  if (!education.length) return null;
  return (
    <div className="space-y-3">
      {education.map((edu, i) => (
        <div key={i} className={`${t.card} p-3 space-y-0.5 break-inside-avoid print:break-inside-avoid`}>
          <div className={`text-xs font-semibold ${t.heading}`}>{edu.degree}</div>
          <p className={`text-xs ${t.muted}`}>
            {edu.school} ({edu.year})
          </p>
        </div>
      ))}
    </div>
  );
}

function ServicesList({ services, t }: { services: PortfolioData['services']; t: ThemeTokens }) {
  if (!services.length) return null;
  return (
    <div className="space-y-3">
      {services.map((s, i) => (
        <div key={i} className={`${t.card} p-3 space-y-1 break-inside-avoid print:break-inside-avoid`}>
          <div className={`text-xs font-semibold ${t.heading}`}>{s.title}</div>
          <p className={`text-xs ${t.muted}`}>{s.description}</p>
        </div>
      ))}
    </div>
  );
}

function CertsList({ certifications, t }: { certifications: PortfolioData['certifications']; t: ThemeTokens }) {
  if (!certifications.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {certifications.map((cert, i) => (
        <div key={i} className={`${t.card} p-3 text-xs break-inside-avoid print:break-inside-avoid`}>
          <div className={`font-bold ${t.heading}`}>{cert.name}</div>
          <div className={`mt-0.5 ${t.muted}`}>
            {cert.issuer} ({cert.year})
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialsList({ testimonials, t }: { testimonials: PortfolioData['testimonials']; t: ThemeTokens }) {
  if (!testimonials.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {testimonials.map((item, i) => (
        <blockquote key={i} className={`${t.card} p-4 space-y-2 break-inside-avoid print:break-inside-avoid`}>
          <Quote className={`h-4 w-4 ${t.accent}`} />
          <p className={`text-xs leading-relaxed ${t.muted}`}>{item.content}</p>
          <footer className={`text-xs font-semibold ${t.heading}`}>
            {item.author}
            {item.role ? <span className={`font-normal ${t.muted}`}> — {item.role}</span> : null}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}

function HireBadge({ available, className }: { available: boolean; className: string }) {
  if (!available) return null;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Available for hire
    </span>
  );
}

function StackLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, experience, projects, education, certifications, services, testimonials, contact } = data;
  return (
    <div className={`${t.page} p-6 sm:p-12`}>
      <div className="mx-auto max-w-5xl space-y-10">
        <section className={`relative overflow-hidden ${t.hero ?? t.card} p-8 sm:p-12`}>
          <div className="relative z-10 space-y-5">
            <HireBadge available={contact.availableForHire} className={`${t.chip}`} />
            <h1 className={`text-4xl font-extrabold tracking-tight sm:text-6xl ${t.heading}`}>{hero.name}</h1>
            <p className={`text-xl font-medium ${t.accent}`}>{hero.title}</p>
            <p className={`max-w-2xl text-base leading-relaxed ${t.muted}`}>{hero.tagline}</p>
            <SocialRow data={data} className={`text-xs ${t.muted}`} />
          </div>
        </section>

        <section className={`${t.card} space-y-4 p-8`}>
          <h2 className={`text-xl font-bold ${t.heading}`}>About</h2>
          <p className={`text-sm leading-relaxed ${t.muted}`}>{about.bio}</p>
          <div className={`grid grid-cols-2 gap-4 border-t pt-4 ${t.border}`}>
            <div>
              <div className={`text-xs ${t.muted}`}>Experience</div>
              <div className={`text-lg font-bold ${t.accent}`}>{about.yearsOfExperience}</div>
            </div>
            <div>
              <div className={`text-xs ${t.muted}`}>Location</div>
              <div className={`text-lg font-bold ${t.heading}`}>{about.location}</div>
            </div>
          </div>
        </section>

        {skills.length > 0 && (
          <section className="space-y-4">
            <h2 className={`text-xl font-bold ${t.heading}`}>Skills</h2>
            <SkillChips skills={skills} t={t} />
          </section>
        )}

        {experience.length > 0 && (
          <section className={`${t.card} space-y-6 p-8`}>
            <div className="flex items-center gap-2">
              <Briefcase className={`h-5 w-5 ${t.accent}`} />
              <h2 className={`text-xl font-bold ${t.heading}`}>Work Experience</h2>
            </div>
            <ExperienceList experience={experience} t={t} />
          </section>
        )}

        <section className="space-y-6">
          <h2 className={`text-2xl font-bold ${t.heading}`}>Featured Projects</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((proj) => (
              <article key={proj.id} className={`${t.card} space-y-3 p-6`}>
                <h3 className={`text-lg font-bold ${t.heading}`}>{proj.title}</h3>
                <p className={`text-xs leading-relaxed ${t.muted}`}>{proj.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className={t.chip}>
                      {tech}
                    </span>
                  ))}
                </div>
                <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          {services.length > 0 && (
            <section className={`${t.card} space-y-4 p-6`}>
              <div className="flex items-center gap-2">
                <Wrench className={`h-5 w-5 ${t.accent}`} />
                <h2 className={`text-lg font-bold ${t.heading}`}>Services</h2>
              </div>
              <ServicesList services={services} t={t} />
            </section>
          )}
          {education.length > 0 && (
            <section className={`${t.card} space-y-4 p-6`}>
              <div className="flex items-center gap-2">
                <GraduationCap className={`h-5 w-5 ${t.accent}`} />
                <h2 className={`text-lg font-bold ${t.heading}`}>Education</h2>
              </div>
              <EducationList education={education} t={t} />
            </section>
          )}
        </div>

        {certifications.length > 0 && (
          <section className={`${t.card} space-y-4 p-6`}>
            <div className="flex items-center gap-2">
              <Award className={`h-5 w-5 ${t.accent}`} />
              <h2 className={`text-lg font-bold ${t.heading}`}>Certifications</h2>
            </div>
            <CertsList certifications={certifications} t={t} />
          </section>
        )}

        {testimonials.length > 0 && <TestimonialsList testimonials={testimonials} t={t} />}
      </div>
    </div>
  );
}

function SwissLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, experience, projects, education, services, certifications } = data;
  return (
    <div className={`${t.page} mx-auto max-w-5xl space-y-16 p-8 sm:p-16`}>
      <header className={`space-y-4 border-b pb-8 ${t.border}`}>
        <div className={t.label}>{hero.title}</div>
        <h1 className={`text-4xl font-extrabold tracking-tight sm:text-6xl ${t.heading}`}>{hero.name}</h1>
        <p className={`max-w-2xl text-lg ${t.muted}`}>{hero.tagline}</p>
        <SocialRow data={data} className={`text-xs ${t.muted}`} />
      </header>

      <section className={`grid gap-8 border-b pb-12 sm:grid-cols-3 ${t.border}`}>
        <div className={t.label}>About</div>
        <div className={`space-y-4 text-sm sm:col-span-2 ${t.muted}`}>
          <p>{about.bio}</p>
          <div className="text-xs">
            {about.location} • {about.yearsOfExperience} Experience
          </div>
        </div>
      </section>

      {skills.length > 0 && (
        <section className={`grid gap-8 border-b pb-12 sm:grid-cols-3 ${t.border}`}>
          <div className={t.label}>Skills</div>
          <div className="sm:col-span-2">
            <SkillChips skills={skills} t={t} />
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section className={`space-y-6 border-b pb-12 ${t.border}`}>
          <h2 className={t.label}>Work Experience</h2>
          <ExperienceList experience={experience} t={t} />
        </section>
      )}

      <section className={`space-y-6 border-b pb-12 ${t.border}`}>
        <h2 className={t.label}>Featured Projects</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((proj) => (
            <article key={proj.id} className={`${t.card} space-y-3 p-6`}>
              <h3 className={`text-lg font-bold ${t.heading}`}>{proj.title}</h3>
              <p className={`text-xs ${t.muted}`}>{proj.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {proj.techStack.map((tech) => (
                  <span key={tech} className={t.chip}>
                    {tech}
                  </span>
                ))}
              </div>
              <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-8 sm:grid-cols-2">
        {services.length > 0 && (
          <section className="space-y-4">
            <h2 className={t.label}>Services</h2>
            <ServicesList services={services} t={t} />
          </section>
        )}
        {education.length > 0 && (
          <section className="space-y-4">
            <h2 className={t.label}>Education</h2>
            <EducationList education={education} t={t} />
          </section>
        )}
      </div>

      {certifications.length > 0 && (
        <section className="space-y-4">
          <h2 className={t.label}>Certifications</h2>
          <CertsList certifications={certifications} t={t} />
        </section>
      )}
    </div>
  );
}

function TerminalLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, experience, projects, education, services } = data;
  return (
    <div className={`${t.page} mx-auto max-w-5xl space-y-12 p-8 sm:p-16`}>
      <header className={`space-y-4 border-b pb-8 ${t.border}`}>
        <div className={t.label}>&gt; SYSTEM.USER_PROFILE_INITIALIZED</div>
        <h1 className={`text-4xl font-black sm:text-6xl ${t.heading}`}>{hero.name}</h1>
        <p className={`text-base ${t.muted}`}>
          {hero.title} — {hero.tagline}
        </p>
        <p className={`text-xs ${t.muted}`}>
          &#47;&#47; {about.location} | {about.yearsOfExperience}
        </p>
        <SocialRow data={data} className={`text-xs ${t.accent}`} />
      </header>

      <section className="space-y-4">
        <h2 className={t.label}>&#47;&#47; ABOUT</h2>
        <p className={`text-sm leading-relaxed ${t.muted}`}>{about.bio}</p>
      </section>

      {skills.length > 0 && (
        <section className="space-y-4">
          <h2 className={t.label}>&#47;&#47; EXPERTISE</h2>
          <SkillChips skills={skills} t={t} />
        </section>
      )}

      {experience.length > 0 && (
        <section className="space-y-4">
          <h2 className={t.label}>&#47;&#47; WORK EXPERIENCE</h2>
          <ExperienceList experience={experience} t={t} />
        </section>
      )}

      <section className="space-y-4">
        <h2 className={t.label}>&#47;&#47; REPOSITORIES</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((proj) => (
            <article key={proj.id} className={`${t.card} space-y-2 p-4`}>
              <h3 className={`text-sm font-bold ${t.heading}`}>{proj.title}</h3>
              <p className={`text-xs ${t.muted}`}>{proj.description}</p>
              <div className="flex flex-wrap gap-1">
                {proj.techStack.map((tech) => (
                  <span key={tech} className={t.chip}>
                    {tech}
                  </span>
                ))}
              </div>
              <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {services.length > 0 && (
          <section className="space-y-4">
            <h2 className={t.label}>&#47;&#47; SERVICES</h2>
            <ServicesList services={services} t={t} />
          </section>
        )}
        {education.length > 0 && (
          <section className="space-y-4">
            <h2 className={t.label}>&#47;&#47; EDUCATION</h2>
            <EducationList education={education} t={t} />
          </section>
        )}
      </div>
    </div>
  );
}

function SidebarLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, experience, projects, education, certifications, contact } = data;
  return (
    <div className={`${t.page} lg:flex`}>
      <aside className={`${t.hero ?? t.card} space-y-6 p-8 lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0`}>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">{hero.name}</h1>
          <p className="text-sm opacity-80">{hero.title}</p>
        </div>
        <p className="text-xs leading-relaxed opacity-70">{hero.tagline}</p>
        <div className="space-y-1 text-xs opacity-80">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> {about.location}
          </div>
          <div>{about.yearsOfExperience} experience</div>
        </div>
        <SkillChips skills={skills} t={t} />
        <SocialRow data={data} className="text-xs opacity-80" />
        {contact.availableForHire && <div className="text-xs font-semibold">Open to opportunities</div>}
      </aside>

      <main className="flex-1 space-y-10 p-6 sm:p-10">
        <section className="space-y-3">
          <h2 className={t.label}>About</h2>
          <p className={`max-w-3xl text-sm leading-relaxed ${t.muted}`}>{about.bio}</p>
        </section>

        {experience.length > 0 && (
          <section className="space-y-4">
            <h2 className={t.label}>Experience</h2>
            <ExperienceList experience={experience} t={t} />
          </section>
        )}

        <section className="space-y-4">
          <h2 className={t.label}>Selected Work</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((proj) => (
              <article key={proj.id} className={`${t.card} space-y-2 p-5`}>
                <h3 className={`text-sm font-bold ${t.heading}`}>{proj.title}</h3>
                <p className={`text-xs ${t.muted}`}>{proj.description}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className={t.chip}>
                      {tech}
                    </span>
                  ))}
                </div>
                <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          {education.length > 0 && (
            <section className="space-y-3">
              <h2 className={t.label}>Education</h2>
              <EducationList education={education} t={t} />
            </section>
          )}
          {certifications.length > 0 && (
            <section className="space-y-3">
              <h2 className={t.label}>Certifications</h2>
              <CertsList certifications={certifications} t={t} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function MagazineLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, experience, projects, education, services, testimonials } = data;
  return (
    <div className={`${t.page} mx-auto max-w-5xl space-y-16 p-8 sm:p-16`}>
      <header className={`space-y-6 border-b pb-12 ${t.border}`}>
        <div className={t.label}>{hero.title}</div>
        <h1 className={`text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl ${t.heading}`}>{hero.name}</h1>
        <p className={`max-w-xl text-lg italic ${t.muted}`}>{hero.tagline}</p>
        <SocialRow data={data} className={`text-xs ${t.muted}`} />
      </header>

      <section className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <h2 className={t.label}>Profile</h2>
          <p className={`text-base leading-relaxed ${t.text}`}>{about.bio}</p>
          <p className={`text-xs ${t.muted}`}>
            {about.location} · {about.yearsOfExperience}
          </p>
        </div>
        <div className="space-y-4 lg:col-span-5">
          <h2 className={t.label}>Capabilities</h2>
          <SkillChips skills={skills} t={t} />
        </div>
      </section>

      {experience.length > 0 && (
        <section className="space-y-6">
          <h2 className={t.label}>Career</h2>
          <ExperienceList experience={experience} t={t} />
        </section>
      )}

      <section className="space-y-6">
        <h2 className={t.label}>Selected Works</h2>
        <div className="space-y-6">
          {projects.map((proj, i) => (
            <article key={proj.id} className={`grid gap-4 border-t pt-6 sm:grid-cols-12 ${t.border}`}>
              <div className={`text-xs ${t.muted} sm:col-span-2`}>0{i + 1}</div>
              <div className="space-y-2 sm:col-span-10">
                <h3 className={`text-2xl font-light ${t.heading}`}>{proj.title}</h3>
                <p className={`text-sm ${t.muted}`}>{proj.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className={t.chip}>
                      {tech}
                    </span>
                  ))}
                </div>
                <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-10 sm:grid-cols-2">
        {services.length > 0 && (
          <section className="space-y-4">
            <h2 className={t.label}>Services</h2>
            <ServicesList services={services} t={t} />
          </section>
        )}
        {education.length > 0 && (
          <section className="space-y-4">
            <h2 className={t.label}>Education</h2>
            <EducationList education={education} t={t} />
          </section>
        )}
      </div>

      {testimonials.length > 0 && <TestimonialsList testimonials={testimonials} t={t} />}
    </div>
  );
}

function SplitLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, experience, projects, education, services, contact } = data;
  return (
    <div className={`${t.page} p-6 sm:p-10`}>
      <div className="mx-auto max-w-6xl space-y-12">
        <section className={`grid items-center gap-8 lg:grid-cols-2 ${t.hero ?? t.card} p-8 sm:p-12`}>
          <div className="space-y-5">
            <HireBadge available={contact.availableForHire} className={t.chip} />
            <h1 className={`text-4xl font-black tracking-tight sm:text-6xl ${t.heading}`}>{hero.name}</h1>
            <p className={`text-lg font-medium ${t.accent}`}>{hero.title}</p>
            <SocialRow data={data} className={`text-xs ${t.muted}`} />
          </div>
          <div className="space-y-4">
            <p className={`text-sm leading-relaxed ${t.muted}`}>{hero.tagline}</p>
            <p className={`text-sm leading-relaxed ${t.text}`}>{about.bio}</p>
            <div className={`text-xs ${t.muted}`}>
              {about.location} · {about.yearsOfExperience}
            </div>
          </div>
        </section>

        <SkillChips skills={skills} t={t} />

        {experience.length > 0 && (
          <section className="space-y-5">
            <h2 className={`text-2xl font-bold ${t.heading}`}>Experience</h2>
            <ExperienceList experience={experience} t={t} />
          </section>
        )}

        <section className="space-y-5">
          <h2 className={`text-2xl font-bold ${t.heading}`}>Work</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {projects.map((proj) => (
              <article key={proj.id} className={`${t.card} space-y-3 p-5`}>
                {proj.category && <div className={t.label}>{proj.category}</div>}
                <h3 className={`text-base font-bold ${t.heading}`}>{proj.title}</h3>
                <p className={`text-xs ${t.muted}`}>{proj.description}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className={t.chip}>
                      {tech}
                    </span>
                  ))}
                </div>
                <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          {services.length > 0 && (
            <section className={`${t.card} space-y-3 p-6`}>
              <h2 className={t.label}>Services</h2>
              <ServicesList services={services} t={t} />
            </section>
          )}
          {education.length > 0 && (
            <section className={`${t.card} space-y-3 p-6`}>
              <h2 className={t.label}>Education</h2>
              <EducationList education={education} t={t} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, projects, experience, education } = data;
  return (
    <div className={`${t.page} mx-auto max-w-6xl space-y-14 p-8 sm:p-14`}>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className={t.label}>Exhibition</div>
          <h1 className={`text-4xl font-semibold tracking-tight sm:text-5xl ${t.heading}`}>{hero.name}</h1>
          <p className={`max-w-xl text-sm ${t.muted}`}>
            {hero.title} — {hero.tagline}
          </p>
        </div>
        <SocialRow data={data} className={`text-xs ${t.muted}`} />
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {projects.map((proj, i) => (
          <article
            key={proj.id}
            className={`${t.card} space-y-4 p-6 ${i === 0 ? 'md:col-span-2 md:grid md:grid-cols-2 md:gap-8 md:space-y-0' : ''}`}
          >
            <div className={`flex min-h-[140px] items-end border ${t.border} p-4 ${t.muted}`}>
              <span className="text-xs uppercase tracking-[0.2em]">{proj.category || 'Project'}</span>
            </div>
            <div className="space-y-3">
              <h3 className={`text-xl font-semibold ${t.heading}`}>{proj.title}</h3>
              <p className={`text-sm ${t.muted}`}>{proj.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {proj.techStack.map((tech) => (
                  <span key={tech} className={t.chip}>
                    {tech}
                  </span>
                ))}
              </div>
              <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
            </div>
          </article>
        ))}
      </section>

      <section className={`grid gap-10 border-t pt-10 sm:grid-cols-3 ${t.border}`}>
        <div className="space-y-3">
          <h2 className={t.label}>About</h2>
          <p className={`text-sm ${t.muted}`}>{about.bio}</p>
        </div>
        <div className="space-y-3">
          <h2 className={t.label}>Skills</h2>
          <SkillChips skills={skills} t={t} />
        </div>
        <div className="space-y-3">
          <h2 className={t.label}>Background</h2>
          <ExperienceList experience={experience.slice(0, 2)} t={t} />
          <EducationList education={education} t={t} />
        </div>
      </section>
    </div>
  );
}

function LandingLayout({ data, t }: { data: PortfolioData; t: ThemeTokens }) {
  const { hero, about, skills, experience, projects, services, contact } = data;
  return (
    <div className={`${t.page} p-6 sm:p-10`}>
      <div className="mx-auto max-w-5xl space-y-14">
        <section className={`${t.hero ?? t.card} space-y-6 text-center`}>
          <HireBadge available={contact.availableForHire} className={`${t.chip} mx-auto`} />
          <h1 className={`text-4xl font-black tracking-tight sm:text-6xl ${t.heading}`}>{hero.name}</h1>
          <p className={`text-xl ${t.accent}`}>{hero.title}</p>
          <p className={`mx-auto max-w-2xl text-sm leading-relaxed ${t.muted}`}>{hero.tagline}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className={`rounded-xl px-5 py-2.5 text-xs font-semibold ${t.chip}`}>
                Book a call
              </a>
            )}
            {data.socialLinks.github && (
              <a href={data.socialLinks.github} target="_blank" rel="noreferrer" className={`rounded-xl px-5 py-2.5 text-xs ${t.muted}`}>
                View GitHub
              </a>
            )}
          </div>
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-4 pt-4">
            <div className={`${t.card} p-4`}>
              <div className={`text-2xl font-black ${t.heading}`}>{about.yearsOfExperience}</div>
              <div className={`text-[11px] ${t.muted}`}>Shipped experience</div>
            </div>
            <div className={`${t.card} p-4`}>
              <div className={`text-2xl font-black ${t.heading}`}>{projects.length}+</div>
              <div className={`text-[11px] ${t.muted}`}>Featured products</div>
            </div>
          </div>
        </section>

        <section className="space-y-4 text-center">
          <h2 className={`text-2xl font-bold ${t.heading}`}>What I build</h2>
          <p className={`mx-auto max-w-2xl text-sm ${t.muted}`}>{about.bio}</p>
          <div className="flex justify-center">
            <SkillChips skills={skills} t={t} />
          </div>
        </section>

        {services.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2">
            {services.map((s, i) => (
              <article key={i} className={`${t.card} space-y-2 p-6`}>
                <h3 className={`text-base font-bold ${t.heading}`}>{s.title}</h3>
                <p className={`text-xs ${t.muted}`}>{s.description}</p>
              </article>
            ))}
          </section>
        )}

        <section className="space-y-5">
          <h2 className={`text-2xl font-bold ${t.heading}`}>Case studies</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((proj) => (
              <article key={proj.id} className={`${t.card} space-y-3 p-6`}>
                <h3 className={`text-lg font-bold ${t.heading}`}>{proj.title}</h3>
                <p className={`text-xs ${t.muted}`}>{proj.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className={t.chip}>
                      {tech}
                    </span>
                  ))}
                </div>
                <ProjectLinks proj={proj} className={`text-[11px] ${t.accent}`} />
              </article>
            ))}
          </div>
        </section>

        {experience.length > 0 && (
          <section className="space-y-4">
            <h2 className={`text-2xl font-bold ${t.heading}`}>Experience</h2>
            <ExperienceList experience={experience} t={t} />
          </section>
        )}
      </div>
    </div>
  );
}

export function PortfolioThemeRenderer({ data, themeId }: { data: PortfolioData; themeId: string }) {
  const t = getTheme(themeId);

  const renderLayout = () => {
    switch (t.layout) {
      case 'swiss':
        return <SwissLayout data={data} t={t} />;
      case 'terminal':
        return <TerminalLayout data={data} t={t} />;
      case 'sidebar':
        return <SidebarLayout data={data} t={t} />;
      case 'magazine':
        return <MagazineLayout data={data} t={t} />;
      case 'split':
        return <SplitLayout data={data} t={t} />;
      case 'gallery':
        return <GalleryLayout data={data} t={t} />;
      case 'landing':
        return <LandingLayout data={data} t={t} />;
      default:
        return <StackLayout data={data} t={t} />;
    }
  };

  return (
    <div className="portfolio-theme-root print:w-full print:min-h-screen">
      {renderLayout()}
    </div>
  );
}
