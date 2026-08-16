'use client';

import React from 'react';

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    location: string;
    dates: string;
    gpa?: string;
  }>;
  experience: Array<{
    id: string;
    role: string;
    company: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    techStack: string;
    link?: string;
    description: string;
  }>;
  skills: Array<{
    category: string;
    items: string;
  }>;
  certificates: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    organization: string;
    date: string;
    description: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  interests: string[];
  references: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    contact: string;
  }>;
}

export type TemplateLayout =
  | 'single'
  | 'two-column'
  | 'sidebar-left'
  | 'timeline'
  | 'ats'
  | 'terminal'
  | 'banner'
  | 'compact'
  | 'magazine';

export interface TemplateTheme {
  layout: TemplateLayout;
  page: string;
  text: string;
  muted: string;
  heading: string;
  accent: string;
  accentSoft: string;
  border: string;
  headerBg?: string;
  headerText?: string;
  sidebarBg?: string;
  sidebarText?: string;
  chip: string;
  font?: string;
  sectionRule?: string;
}

export const TEMPLATE_LIST = [
  // Original 20
  { id: 'modern', name: 'Modern', style: 'Clean indigo accents with balanced spacing', category: 'Modern' },
  { id: 'minimal', name: 'Minimal', style: 'Ultra-legible whitespace and quiet hierarchy', category: 'Minimal' },
  { id: 'executive', name: 'Executive', style: 'Formal dual-column layout for senior roles', category: 'Executive' },
  { id: 'creative', name: 'Creative', style: 'Vibrant gradient header and badge pills', category: 'Creative' },
  { id: 'corporate', name: 'Corporate', style: 'Structured navy banner with dense info', category: 'Corporate' },
  { id: 'developer', name: 'Developer', style: 'Terminal dark vibe with tech stack tags', category: 'Developer' },
  { id: 'designer', name: 'Designer', style: 'Asymmetric accent bar and visual hierarchy', category: 'Designer' },
  { id: 'dark', name: 'Dark Mode', style: 'Midnight theme with cyan glow highlights', category: 'Dark' },
  { id: 'elegant', name: 'Elegant', style: 'Serif headings with gold subtle borders', category: 'Elegant' },
  { id: 'classic', name: 'Classic', style: 'Traditional single-column Times format', category: 'Classic' },
  { id: 'academic', name: 'Academic', style: 'Research-first structure with formal rules', category: 'Academic' },
  { id: 'student', name: 'Student', style: 'Education and projects prioritized first', category: 'Student' },
  { id: 'startup', name: 'Startup', style: 'Metrics-driven layout with bold badges', category: 'Startup' },
  { id: 'ats-friendly', name: 'ATS Friendly', style: 'High-parseability single column B&W', category: 'ATS Friendly' },
  { id: 'google-style', name: 'Google Style', style: 'Clean blue headings and crisp bullets', category: 'Google Style' },
  { id: 'microsoft-style', name: 'Microsoft Style', style: 'Segoe-like blue accent sidebar bar', category: 'Microsoft Style' },
  { id: 'canva-style', name: 'Canva Style', style: 'Modern two-column pastel headers', category: 'Canva Style' },
  { id: 'professional-blue', name: 'Professional Blue', style: 'Deep sapphire header with polish', category: 'Professional Blue' },
  { id: 'minimal-black', name: 'Minimal Black', style: 'Monochrome high-contrast typography', category: 'Minimal Black' },
  { id: 'premium-glass', name: 'Premium Glass', style: 'Glassmorphism cards and soft borders', category: 'Premium Glass' },

  // New templates
  { id: 'nordic', name: 'Nordic', style: 'Scandinavian calm with cool slate tones', category: 'Minimal' },
  { id: 'timeline', name: 'Timeline', style: 'Vertical career path with milestone markers', category: 'Modern' },
  { id: 'swiss', name: 'Swiss Grid', style: 'International typography with strict grid', category: 'Minimal' },
  { id: 'fintech', name: 'Fintech', style: 'Trust-building navy and teal finance look', category: 'Corporate' },
  { id: 'product', name: 'Product', style: 'PM-focused impact metrics and clarity', category: 'Modern' },
  { id: 'neon', name: 'Neon Cyber', style: 'Electric magenta/cyan on deep black', category: 'Dark' },
  { id: 'ivory', name: 'Ivory Paper', style: 'Warm cream paper with classic serif flair', category: 'Elegant' },
  { id: 'magazine', name: 'Magazine', style: 'Editorial spread with bold name lockup', category: 'Creative' },
  { id: 'compact', name: 'Compact Pro', style: 'Dense multi-section layout for long careers', category: 'Corporate' },
  { id: 'teal-sidebar', name: 'Teal Sidebar', style: 'Left skill rail with teal brand color', category: 'Modern' },
  { id: 'rose-gold', name: 'Rose Gold', style: 'Soft rose accents with premium feel', category: 'Elegant' },
  { id: 'slate-bold', name: 'Slate Bold', style: 'Heavy weight headings and strong bars', category: 'Modern' },
  { id: 'forest', name: 'Forest', style: 'Earth green professional with calm tone', category: 'Corporate' },
  { id: 'sunset', name: 'Sunset', style: 'Warm orange-to-amber creative banner', category: 'Creative' },
  { id: 'mono-mono', name: 'Mono Mono', style: 'Monospace engineering-first document', category: 'Developer' },
  // 5 New Templates
  { id: 'emerald-exec', name: 'Emerald Executive', style: 'Luxurious emerald header for executive roles', category: 'Executive' },
  { id: 'cyber-tech', name: 'Cyber Tech', style: 'High-tech dark background with glowing cyan borders', category: 'Developer' },
  { id: 'apple-clean', name: 'Apple Clean', style: 'San Francisco font styling with minimal gray badges', category: 'Minimal' },
  { id: 'violet-split', name: 'Violet Split Rail', style: 'Two-column layout with deep violet skill sidebar', category: 'Modern' },
  { id: 'copper-minimal', name: 'Copper Minimal', style: 'Warm copper accents on ultra-clean grid', category: 'Minimal' },
] as const;

export type TemplateId = (typeof TEMPLATE_LIST)[number]['id'] | string;

const THEMES: Record<string, TemplateTheme> = {
  modern: {
    layout: 'single',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-indigo-700',
    accent: 'text-indigo-600',
    accentSoft: 'bg-indigo-50 text-indigo-700',
    border: 'border-slate-200',
    chip: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    sectionRule: 'border-b border-indigo-100 pb-1',
  },
  minimal: {
    layout: 'single',
    page: 'bg-white',
    text: 'text-zinc-900',
    muted: 'text-zinc-500',
    heading: 'text-zinc-900',
    accent: 'text-zinc-700',
    accentSoft: 'bg-zinc-100 text-zinc-700',
    border: 'border-zinc-200',
    chip: 'bg-zinc-100 text-zinc-700',
    sectionRule: 'border-b border-zinc-200 pb-1',
  },
  executive: {
    layout: 'two-column',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-slate-900',
    accent: 'text-slate-800',
    accentSoft: 'bg-slate-100 text-slate-800',
    border: 'border-slate-300',
    headerBg: 'bg-slate-900',
    headerText: 'text-white',
    chip: 'bg-slate-100 text-slate-800',
    sectionRule: 'border-b-2 border-slate-900 pb-1',
  },
  creative: {
    layout: 'banner',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-violet-700',
    accent: 'text-violet-600',
    accentSoft: 'bg-violet-50 text-violet-700',
    border: 'border-violet-100',
    headerBg: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500',
    headerText: 'text-white',
    chip: 'bg-violet-100 text-violet-700',
    sectionRule: 'border-b border-violet-200 pb-1',
  },
  corporate: {
    layout: 'two-column',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-600',
    heading: 'text-blue-900',
    accent: 'text-blue-800',
    accentSoft: 'bg-blue-50 text-blue-900',
    border: 'border-blue-100',
    headerBg: 'bg-blue-950',
    headerText: 'text-white',
    chip: 'bg-blue-50 text-blue-900',
    sectionRule: 'border-b border-blue-200 pb-1',
  },
  developer: {
    layout: 'terminal',
    page: 'bg-slate-950 border border-emerald-500/20',
    text: 'text-slate-200',
    muted: 'text-slate-400',
    heading: 'text-emerald-400',
    accent: 'text-emerald-300',
    accentSoft: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    border: 'border-emerald-500/30',
    chip: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300',
    font: 'font-mono',
  },
  designer: {
    layout: 'sidebar-left',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-fuchsia-700',
    accent: 'text-fuchsia-600',
    accentSoft: 'bg-fuchsia-50 text-fuchsia-700',
    border: 'border-fuchsia-100',
    sidebarBg: 'bg-slate-900',
    sidebarText: 'text-white',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    sectionRule: 'border-b border-fuchsia-200 pb-1',
  },
  dark: {
    layout: 'terminal',
    page: 'bg-slate-950 border border-cyan-500/20',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-cyan-400',
    accent: 'text-cyan-300',
    accentSoft: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
    border: 'border-cyan-500/20',
    chip: 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300',
    font: 'font-mono',
  },
  elegant: {
    layout: 'single',
    page: 'bg-[#faf8f5]',
    text: 'text-stone-900',
    muted: 'text-stone-500',
    heading: 'text-amber-800',
    accent: 'text-amber-700',
    accentSoft: 'bg-amber-50 text-amber-900',
    border: 'border-amber-200/80',
    chip: 'bg-amber-50 text-amber-900 border border-amber-100',
    font: 'font-serif',
    sectionRule: 'border-b border-amber-300/60 pb-1',
  },
  classic: {
    layout: 'ats',
    page: 'bg-white',
    text: 'text-black',
    muted: 'text-slate-700',
    heading: 'text-black',
    accent: 'text-black',
    accentSoft: 'bg-slate-100 text-black',
    border: 'border-black',
    chip: 'bg-transparent text-black',
    font: 'font-serif',
  },
  academic: {
    layout: 'single',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-600',
    heading: 'text-slate-900',
    accent: 'text-slate-800',
    accentSoft: 'bg-slate-100 text-slate-800',
    border: 'border-slate-400',
    chip: 'bg-slate-100 text-slate-800',
    font: 'font-serif',
    sectionRule: 'border-b border-slate-400 pb-1',
  },
  student: {
    layout: 'two-column',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-sky-700',
    accent: 'text-sky-600',
    accentSoft: 'bg-sky-50 text-sky-700',
    border: 'border-sky-100',
    chip: 'bg-sky-50 text-sky-700',
    sectionRule: 'border-b border-sky-200 pb-1',
  },
  startup: {
    layout: 'banner',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-orange-700',
    accent: 'text-orange-600',
    accentSoft: 'bg-orange-50 text-orange-700',
    border: 'border-orange-100',
    headerBg: 'bg-gradient-to-r from-orange-500 to-rose-500',
    headerText: 'text-white',
    chip: 'bg-orange-100 text-orange-800',
    sectionRule: 'border-b border-orange-200 pb-1',
  },
  'ats-friendly': {
    layout: 'ats',
    page: 'bg-white',
    text: 'text-black',
    muted: 'text-slate-700',
    heading: 'text-black',
    accent: 'text-black',
    accentSoft: 'bg-transparent text-black',
    border: 'border-black',
    chip: 'bg-transparent text-black',
    font: 'font-serif',
  },
  'google-style': {
    layout: 'single',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-600',
    heading: 'text-blue-600',
    accent: 'text-blue-600',
    accentSoft: 'bg-blue-50 text-blue-700',
    border: 'border-blue-200',
    chip: 'bg-blue-50 text-blue-700',
    sectionRule: 'border-b border-blue-500 pb-1',
  },
  'microsoft-style': {
    layout: 'sidebar-left',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-[#0078D4]',
    accent: 'text-[#0078D4]',
    accentSoft: 'bg-sky-50 text-[#0078D4]',
    border: 'border-sky-100',
    sidebarBg: 'bg-[#0078D4]',
    sidebarText: 'text-white',
    chip: 'bg-sky-50 text-[#0078D4]',
    sectionRule: 'border-b border-sky-200 pb-1',
  },
  'canva-style': {
    layout: 'two-column',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-pink-600',
    accent: 'text-pink-500',
    accentSoft: 'bg-pink-50 text-pink-700',
    border: 'border-pink-100',
    headerBg: 'bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200',
    headerText: 'text-slate-900',
    chip: 'bg-pink-50 text-pink-700',
    sectionRule: 'border-b border-pink-200 pb-1',
  },
  'professional-blue': {
    layout: 'banner',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-blue-800',
    accent: 'text-blue-700',
    accentSoft: 'bg-blue-50 text-blue-800',
    border: 'border-blue-100',
    headerBg: 'bg-slate-900',
    headerText: 'text-white',
    chip: 'bg-blue-50 text-blue-800',
    sectionRule: 'border-b border-blue-200 pb-1',
  },
  'minimal-black': {
    layout: 'single',
    page: 'bg-white',
    text: 'text-black',
    muted: 'text-neutral-600',
    heading: 'text-black',
    accent: 'text-black',
    accentSoft: 'bg-neutral-100 text-black',
    border: 'border-neutral-300',
    chip: 'bg-neutral-100 text-black',
    sectionRule: 'border-b-2 border-black pb-1',
  },
  'premium-glass': {
    layout: 'two-column',
    page: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    heading: 'text-cyan-400',
    accent: 'text-cyan-300',
    accentSoft: 'bg-white/5 text-cyan-300 border border-white/10',
    border: 'border-white/10',
    chip: 'bg-white/10 text-cyan-200 border border-white/10',
    sectionRule: 'border-b border-white/10 pb-1',
  },
  nordic: {
    layout: 'single',
    page: 'bg-[#f4f6f8]',
    text: 'text-slate-800',
    muted: 'text-slate-500',
    heading: 'text-slate-700',
    accent: 'text-teal-700',
    accentSoft: 'bg-teal-50 text-teal-800',
    border: 'border-slate-200',
    chip: 'bg-white text-slate-700 border border-slate-200',
    sectionRule: 'border-b border-slate-300 pb-1',
  },
  timeline: {
    layout: 'timeline',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-violet-700',
    accent: 'text-violet-600',
    accentSoft: 'bg-violet-50 text-violet-700',
    border: 'border-violet-200',
    chip: 'bg-violet-50 text-violet-700',
    sectionRule: 'border-b border-violet-200 pb-1',
  },
  swiss: {
    layout: 'compact',
    page: 'bg-white',
    text: 'text-black',
    muted: 'text-neutral-600',
    heading: 'text-black',
    accent: 'text-red-600',
    accentSoft: 'bg-red-50 text-red-700',
    border: 'border-black',
    chip: 'bg-black text-white',
    sectionRule: 'border-b-2 border-black pb-1',
  },
  fintech: {
    layout: 'two-column',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-teal-800',
    accent: 'text-teal-700',
    accentSoft: 'bg-teal-50 text-teal-800',
    border: 'border-teal-100',
    headerBg: 'bg-[#0b1f33]',
    headerText: 'text-white',
    chip: 'bg-teal-50 text-teal-800',
    sectionRule: 'border-b border-teal-200 pb-1',
  },
  product: {
    layout: 'single',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-indigo-600',
    accent: 'text-indigo-500',
    accentSoft: 'bg-indigo-50 text-indigo-700',
    border: 'border-indigo-100',
    chip: 'bg-indigo-50 text-indigo-700',
    sectionRule: 'border-b border-indigo-200 pb-1',
  },
  neon: {
    layout: 'terminal',
    page: 'bg-black border border-fuchsia-500/30',
    text: 'text-fuchsia-50',
    muted: 'text-fuchsia-200/60',
    heading: 'text-fuchsia-400',
    accent: 'text-cyan-300',
    accentSoft: 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/40',
    border: 'border-fuchsia-500/30',
    chip: 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-300',
    font: 'font-mono',
  },
  ivory: {
    layout: 'single',
    page: 'bg-[#f7f1e8]',
    text: 'text-stone-900',
    muted: 'text-stone-600',
    heading: 'text-stone-800',
    accent: 'text-stone-700',
    accentSoft: 'bg-[#efe6d8] text-stone-800',
    border: 'border-stone-300',
    chip: 'bg-[#efe6d8] text-stone-800',
    font: 'font-serif',
    sectionRule: 'border-b border-stone-400 pb-1',
  },
  magazine: {
    layout: 'magazine',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-rose-700',
    accent: 'text-rose-600',
    accentSoft: 'bg-rose-50 text-rose-700',
    border: 'border-rose-100',
    chip: 'bg-rose-50 text-rose-700',
    sectionRule: 'border-b border-rose-200 pb-1',
  },
  compact: {
    layout: 'compact',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-slate-800',
    accent: 'text-slate-700',
    accentSoft: 'bg-slate-100 text-slate-800',
    border: 'border-slate-200',
    chip: 'bg-slate-100 text-slate-800',
    sectionRule: 'border-b border-slate-300 pb-0.5',
  },
  'teal-sidebar': {
    layout: 'sidebar-left',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-teal-700',
    accent: 'text-teal-600',
    accentSoft: 'bg-teal-50 text-teal-800',
    border: 'border-teal-100',
    sidebarBg: 'bg-teal-800',
    sidebarText: 'text-white',
    chip: 'bg-teal-50 text-teal-800',
    sectionRule: 'border-b border-teal-200 pb-1',
  },
  'rose-gold': {
    layout: 'banner',
    page: 'bg-[#fffaf8]',
    text: 'text-stone-900',
    muted: 'text-stone-500',
    heading: 'text-rose-700',
    accent: 'text-rose-600',
    accentSoft: 'bg-rose-50 text-rose-800',
    border: 'border-rose-100',
    headerBg: 'bg-gradient-to-r from-rose-300 via-amber-200 to-rose-200',
    headerText: 'text-stone-900',
    chip: 'bg-rose-50 text-rose-800',
    sectionRule: 'border-b border-rose-200 pb-1',
  },
  'slate-bold': {
    layout: 'single',
    page: 'bg-white',
    text: 'text-slate-950',
    muted: 'text-slate-500',
    heading: 'text-slate-950',
    accent: 'text-slate-800',
    accentSoft: 'bg-slate-900 text-white',
    border: 'border-slate-900',
    chip: 'bg-slate-900 text-white',
    sectionRule: 'border-b-4 border-slate-900 pb-1',
  },
  forest: {
    layout: 'two-column',
    page: 'bg-white',
    text: 'text-stone-900',
    muted: 'text-stone-500',
    heading: 'text-emerald-800',
    accent: 'text-emerald-700',
    accentSoft: 'bg-emerald-50 text-emerald-900',
    border: 'border-emerald-100',
    headerBg: 'bg-emerald-950',
    headerText: 'text-white',
    chip: 'bg-emerald-50 text-emerald-900',
    sectionRule: 'border-b border-emerald-200 pb-1',
  },
  sunset: {
    layout: 'banner',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-amber-700',
    accent: 'text-orange-600',
    accentSoft: 'bg-amber-50 text-amber-800',
    border: 'border-amber-100',
    headerBg: 'bg-gradient-to-r from-orange-500 via-amber-400 to-rose-400',
    headerText: 'text-white',
    chip: 'bg-amber-50 text-amber-800',
    sectionRule: 'border-b border-amber-200 pb-1',
  },
  'mono-mono': {
    layout: 'terminal',
    page: 'bg-neutral-950 border border-neutral-700',
    text: 'text-neutral-100',
    muted: 'text-neutral-400',
    heading: 'text-lime-400',
    accent: 'text-lime-300',
    accentSoft: 'bg-lime-500/10 text-lime-300 border border-lime-500/30',
    border: 'border-neutral-700',
    chip: 'bg-lime-500/10 border border-lime-500/30 text-lime-300',
    font: 'font-mono',
  },
  'emerald-exec': {
    layout: 'banner',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-emerald-900',
    accent: 'text-emerald-800',
    accentSoft: 'bg-emerald-50 text-emerald-900',
    border: 'border-emerald-200',
    headerBg: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900',
    headerText: 'text-amber-100',
    chip: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
    sectionRule: 'border-b-2 border-emerald-800 pb-1',
  },
  'cyber-tech': {
    layout: 'terminal',
    page: 'bg-[#090d16] border border-cyan-500/30',
    text: 'text-cyan-100',
    muted: 'text-slate-400',
    heading: 'text-cyan-300',
    accent: 'text-fuchsia-400',
    accentSoft: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
    border: 'border-cyan-500/30',
    chip: 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200',
    font: 'font-mono',
    sectionRule: 'border-b border-cyan-500/30 pb-1',
  },
  'apple-clean': {
    layout: 'single',
    page: 'bg-white',
    text: 'text-zinc-900',
    muted: 'text-zinc-500',
    heading: 'text-black',
    accent: 'text-sky-600',
    accentSoft: 'bg-zinc-100 text-zinc-900',
    border: 'border-zinc-200',
    chip: 'bg-zinc-100 text-zinc-700 rounded-full px-2.5 py-0.5 text-[10px]',
    sectionRule: 'border-b border-zinc-200 pb-1',
  },
  'violet-split': {
    layout: 'sidebar-left',
    page: 'bg-white',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-violet-900',
    accent: 'text-violet-700',
    accentSoft: 'bg-violet-50 text-violet-900',
    border: 'border-violet-100',
    sidebarBg: 'bg-slate-950',
    sidebarText: 'text-slate-200',
    chip: 'bg-violet-50 text-violet-900 border border-violet-200',
    sectionRule: 'border-b border-violet-200 pb-1',
  },
  'copper-minimal': {
    layout: 'ats',
    page: 'bg-white',
    text: 'text-stone-900',
    muted: 'text-stone-500',
    heading: 'text-amber-900',
    accent: 'text-amber-800',
    accentSoft: 'bg-amber-50 text-amber-950',
    border: 'border-stone-200',
    chip: 'bg-stone-100 text-stone-800 border border-stone-200',
    sectionRule: 'border-b border-amber-800/40 pb-1',
  },
};

const DEFAULT_THEME = THEMES.modern;

function getTheme(templateId: string): TemplateTheme {
  return THEMES[templateId] ?? DEFAULT_THEME;
}

function SectionTitle({ title, theme }: { title: string; theme: TemplateTheme }) {
  return (
    <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme.heading} ${theme.sectionRule ?? ''}`}>
      {title}
    </h2>
  );
}

function ContactLine({
  personalInfo,
  className = '',
  withIcons = true,
}: {
  personalInfo: ResumeData['personalInfo'];
  className?: string;
  withIcons?: boolean;
}) {
  const items = [
    personalInfo.email && (withIcons ? `📧 ${personalInfo.email}` : personalInfo.email),
    personalInfo.phone && (withIcons ? `📱 ${personalInfo.phone}` : personalInfo.phone),
    personalInfo.location && (withIcons ? `📍 ${personalInfo.location}` : personalInfo.location),
    personalInfo.linkedIn && (withIcons ? `🔗 ${personalInfo.linkedIn}` : personalInfo.linkedIn),
    personalInfo.github && (withIcons ? `💻 ${personalInfo.github}` : personalInfo.github),
    personalInfo.portfolio && (withIcons ? `🌐 ${personalInfo.portfolio}` : personalInfo.portfolio),
  ].filter(Boolean) as string[];

  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-90 ${className}`}>
      {items.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
    </div>
  );
}

function SkillsBlock({ skills, theme }: { skills: ResumeData['skills']; theme: TemplateTheme }) {
  if (!skills.length) return null;
  return (
    <section>
      <SectionTitle title="Skills" theme={theme} />
      <div className="space-y-2 text-xs">
        {skills.map((s, i) => (
          <div key={i}>
            <div className={`font-bold ${theme.muted}`}>{s.category}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {s.items.split(',').map((item, idx) => (
                <span key={idx} className={`px-2 py-0.5 rounded text-[11px] ${theme.chip}`}>
                  {item.trim()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EducationBlock({ education, theme }: { education: ResumeData['education']; theme: TemplateTheme }) {
  if (!education.length) return null;
  return (
    <section>
      <SectionTitle title="Education" theme={theme} />
      <div className="space-y-2 text-xs">
        {education.map((edu) => (
          <div key={edu.id}>
            <div className="font-bold">{edu.degree}</div>
            <div className={theme.muted}>
              {edu.school}
              {edu.dates ? ` · ${edu.dates}` : ''}
              {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExperienceBlock({ experience, theme }: { experience: ResumeData['experience']; theme: TemplateTheme }) {
  if (!experience.length) return null;
  return (
    <section>
      <SectionTitle title="Experience" theme={theme} />
      <div className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id}>
            <div className="flex justify-between items-baseline gap-2 text-xs font-bold">
              <span className="text-sm">{exp.role}</span>
              <span className={`shrink-0 ${theme.muted}`}>{exp.dates}</span>
            </div>
            <div className={`text-xs font-medium ${theme.accent}`}>
              {exp.company}
              {exp.location ? ` · ${exp.location}` : ''}
            </div>
            <ul className="mt-1.5 list-disc list-inside text-xs space-y-1 opacity-90">
              {exp.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsBlock({ projects, theme }: { projects: ResumeData['projects']; theme: TemplateTheme }) {
  if (!projects.length) return null;
  return (
    <section>
      <SectionTitle title="Featured Projects" theme={theme} />
      <div className="space-y-3">
        {projects.map((proj) => (
          <div key={proj.id} className={`rounded-lg p-3 border ${theme.border} ${theme.accentSoft.includes('bg-') ? '' : ''} bg-black/[0.02]`}>
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-bold">
              <span>{proj.title}</span>
              {proj.techStack && (
                <span className={`text-[10px] font-normal px-2 py-0.5 rounded ${theme.chip}`}>{proj.techStack}</span>
              )}
            </div>
            <p className={`text-xs mt-1 ${theme.muted}`}>{proj.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CertificatesBlock({ certificates, theme }: { certificates: ResumeData['certificates']; theme: TemplateTheme }) {
  if (!certificates.length) return null;
  return (
    <section>
      <SectionTitle title="Certificates" theme={theme} />
      <div className="space-y-1 text-xs">
        {certificates.map((c) => (
          <div key={c.id}>
            <span className="font-semibold">{c.name}</span>
            <span className={theme.muted}>
              {' '}
              — {c.issuer}
              {c.date ? ` (${c.date})` : ''}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LanguagesBlock({ languages, theme }: { languages: ResumeData['languages']; theme: TemplateTheme }) {
  if (!languages.length) return null;
  return (
    <section>
      <SectionTitle title="Languages" theme={theme} />
      <div className="text-xs space-y-1">
        {languages.map((l, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span>{l.language}</span>
            <span className={theme.muted}>{l.proficiency}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AchievementsBlock({ achievements, theme }: { achievements: ResumeData['achievements']; theme: TemplateTheme }) {
  if (!achievements.length) return null;
  return (
    <section>
      <SectionTitle title="Achievements" theme={theme} />
      <div className="space-y-2 text-xs">
        {achievements.map((a) => (
          <div key={a.id}>
            <div className="font-bold">
              {a.title}
              {a.date ? <span className={`font-normal ${theme.muted}`}> · {a.date}</span> : null}
            </div>
            {(a.organization || a.description) && (
              <div className={theme.muted}>
                {a.organization}
                {a.organization && a.description ? ' — ' : ''}
                {a.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryBlock({ summary, theme }: { summary: string; theme: TemplateTheme }) {
  if (!summary) return null;
  return (
    <section className="mb-6">
      <SectionTitle title="Professional Summary" theme={theme} />
      <p className="text-xs leading-relaxed opacity-90">{summary}</p>
    </section>
  );
}

function SidebarExtras({
  data,
  theme,
  light = false,
}: {
  data: ResumeData;
  theme: TemplateTheme;
  light?: boolean;
}) {
  const text = light ? theme.sidebarText ?? 'text-white' : theme.text;
  const muted = light ? 'opacity-80' : theme.muted;
  return (
    <div className={`space-y-5 ${text}`}>
      {data.skills.length > 0 && (
        <section>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${light ? 'opacity-90' : theme.heading}`}>Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.flatMap((s) =>
              s.items.split(',').map((item, idx) => (
                <span
                  key={`${s.category}-${idx}`}
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    light ? 'bg-white/15 border border-white/20' : theme.chip
                  }`}
                >
                  {item.trim()}
                </span>
              ))
            )}
          </div>
        </section>
      )}
      {data.education.length > 0 && (
        <section>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${light ? 'opacity-90' : theme.heading}`}>Education</h2>
          <div className="space-y-2 text-xs">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="font-bold">{edu.degree}</div>
                <div className={muted}>
                  {edu.school}
                  {edu.dates ? ` · ${edu.dates}` : ''}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {data.languages.length > 0 && (
        <section>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${light ? 'opacity-90' : theme.heading}`}>Languages</h2>
          <div className="text-xs space-y-1">
            {data.languages.map((l, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span>{l.language}</span>
                <span className={muted}>{l.proficiency}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {data.certificates.length > 0 && (
        <section>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${light ? 'opacity-90' : theme.heading}`}>Certificates</h2>
          <div className="space-y-1 text-xs">
            {data.certificates.map((c) => (
              <div key={c.id}>
                <div className="font-semibold">{c.name}</div>
                <div className={muted}>
                  {c.issuer}
                  {c.date ? ` · ${c.date}` : ''}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- Layout renderers ---------- */

function AtsLayout({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const { personalInfo, summary, education, experience, projects, skills, certificates, achievements, languages } = data;
  return (
    <div className={`${theme.page} p-8 ${theme.text} ${theme.font ?? 'font-serif'} text-sm leading-relaxed max-w-4xl mx-auto shadow-sm print:p-0 print:shadow-none`}>
      <header className={`text-center border-b pb-4 mb-4 ${theme.border}`}>
        <h1 className="text-2xl font-bold uppercase tracking-wide">{personalInfo.fullName || 'FULL NAME'}</h1>
        <ContactLine personalInfo={personalInfo} withIcons={false} className={`justify-center mt-1 ${theme.muted}`} />
      </header>

      {summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Professional Summary</h2>
          <p className="text-xs">{summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Work Experience</h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-xs gap-2">
                  <span>
                    {exp.role} — {exp.company}
                  </span>
                  <span className="shrink-0">{exp.dates}</span>
                </div>
                {exp.location && <div className={`text-[11px] italic ${theme.muted}`}>{exp.location}</div>}
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-xs mb-1 gap-2">
              <div>
                <span className="font-bold">{edu.school}</span> — {edu.degree}
                {edu.gpa ? ` (GPA ${edu.gpa})` : ''}
              </div>
              <span className="shrink-0">{edu.dates}</span>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Technical Skills</h2>
          <div className="text-xs space-y-1">
            {skills.map((s, i) => (
              <div key={i}>
                <span className="font-bold">{s.category}:</span> {s.items}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="text-xs mb-2">
              <span className="font-bold">{p.title}</span>
              {p.techStack ? ` — ${p.techStack}` : ''}
              <div>{p.description}</div>
            </div>
          ))}
        </section>
      )}

      {certificates.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Certificates</h2>
          {certificates.map((c) => (
            <div key={c.id} className="text-xs">
              {c.name} — {c.issuer} ({c.date})
            </div>
          ))}
        </section>
      )}

      {achievements.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Achievements</h2>
          {achievements.map((a) => (
            <div key={a.id} className="text-xs mb-1">
              <span className="font-bold">{a.title}</span>
              {a.organization ? ` — ${a.organization}` : ''}
              {a.date ? ` (${a.date})` : ''}
              {a.description ? `. ${a.description}` : ''}
            </div>
          ))}
        </section>
      )}

      {languages.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">Languages</h2>
          <div className="text-xs">
            {languages.map((l) => `${l.language} (${l.proficiency})`).join(' · ')}
          </div>
        </section>
      )}
    </div>
  );
}

function TerminalLayout({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const { personalInfo, summary, education, experience, projects, skills, certificates } = data;
  const prompt = theme.heading.includes('fuchsia')
    ? '# profile --verbose'
    : theme.heading.includes('lime')
    ? '$ whoami && cat resume.md'
    : theme.heading.includes('cyan')
    ? '// dark_profile.load()'
    : '$ cat developer_profile.json';

  return (
    <div
      className={`${theme.page} p-8 ${theme.text} ${theme.font ?? 'font-mono'} text-sm leading-relaxed max-w-4xl mx-auto shadow-2xl rounded-2xl print:bg-white print:text-black`}
    >
      <header className={`border-b ${theme.border} pb-4 mb-6`}>
        <div className={`${theme.heading} text-xs`}>{prompt}</div>
        <h1 className={`text-3xl font-bold ${theme.accent} mt-1`}>{personalInfo.fullName || 'Your Name'}</h1>
        <p className={`text-xs ${theme.muted} mt-1`}>
          {[personalInfo.location, personalInfo.email, personalInfo.github || personalInfo.linkedIn]
            .filter(Boolean)
            .join(' | ')}
        </p>
      </header>

      {summary && (
        <section className={`mb-6 p-4 rounded-xl border ${theme.border} bg-white/5`}>
          <div className={`${theme.heading} font-bold text-xs mb-1`}>&#47;&#47; Professional Summary</div>
          <p className={`text-xs ${theme.muted}`}>{summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-6">
          <div className={`${theme.heading} font-bold text-xs mb-3`}>&#47;&#47; Experience</div>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className={`border-l-2 ${theme.border} pl-3`}>
                <div className="flex justify-between text-xs font-bold gap-2">
                  <span>
                    {exp.role} @ {exp.company}
                  </span>
                  <span className={`${theme.accent} shrink-0`}>{exp.dates}</span>
                </div>
                <ul className={`mt-2 space-y-1 text-xs ${theme.muted}`}>
                  {exp.bullets.map((b, i) => (
                    <li key={i}>&gt; {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-6">
          <div className={`${theme.heading} font-bold text-xs mb-3`}>&#47;&#47; Projects</div>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className={`border ${theme.border} rounded-lg p-3 bg-white/5`}>
                <div className="flex flex-wrap justify-between gap-2 text-xs font-bold">
                  <span>{p.title}</span>
                  {p.techStack && <span className={`px-2 py-0.5 rounded ${theme.chip}`}>{p.techStack}</span>}
                </div>
                <p className={`text-xs mt-1 ${theme.muted}`}>{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-6">
          <div className={`${theme.heading} font-bold text-xs mb-2`}>&#47;&#47; Tech Stack &amp; Skills</div>
          <div className="flex flex-wrap gap-2">
            {skills.flatMap((s) =>
              s.items.split(',').map((skill, i) => (
                <span key={`${s.category}-${i}`} className={`text-xs px-2.5 py-1 rounded-md ${theme.chip}`}>
                  {skill.trim()}
                </span>
              ))
            )}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-6">
          <div className={`${theme.heading} font-bold text-xs mb-2`}>&#47;&#47; Education</div>
          {education.map((edu) => (
            <div key={edu.id} className={`text-xs ${theme.muted} mb-1`}>
              <span className="font-bold text-inherit opacity-100">{edu.degree}</span> — {edu.school} ({edu.dates})
            </div>
          ))}
        </section>
      )}

      {certificates.length > 0 && (
        <section>
          <div className={`${theme.heading} font-bold text-xs mb-2`}>&#47;&#47; Certificates</div>
          {certificates.map((c) => (
            <div key={c.id} className={`text-xs ${theme.muted}`}>
              {c.name} — {c.issuer} ({c.date})
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function TimelineLayout({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const { personalInfo, summary, experience, projects, education, skills, certificates, languages, achievements } = data;
  return (
    <div className={`${theme.page} p-8 ${theme.text} font-sans text-sm leading-relaxed max-w-4xl mx-auto shadow-xl rounded-xl border ${theme.border}`}>
      <header className={`pb-6 mb-6 border-b ${theme.border}`}>
        <h1 className="text-3xl font-extrabold tracking-tight">{personalInfo.fullName || 'Your Name'}</h1>
        <ContactLine personalInfo={personalInfo} className="mt-2" />
      </header>

      <SummaryBlock summary={summary} theme={theme} />

      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Career Timeline" theme={theme} />
          <div className="relative ml-3 border-l-2 border-violet-200 pl-6 space-y-5">
            {experience.map((exp) => (
              <div key={exp.id} className="relative">
                <span className="absolute -left-[1.9rem] top-1 h-3.5 w-3.5 rounded-full bg-violet-600 ring-4 ring-violet-100" />
                <div className="flex flex-wrap justify-between gap-2 text-xs font-bold">
                  <span className="text-sm">{exp.role}</span>
                  <span className={`px-2 py-0.5 rounded-full ${theme.chip}`}>{exp.dates}</span>
                </div>
                <div className={`text-xs font-medium ${theme.accent}`}>
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ''}
                </div>
                <ul className="mt-1.5 list-disc list-inside text-xs space-y-1 opacity-90">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectsBlock projects={projects} theme={theme} />
        <div className="space-y-6">
          <EducationBlock education={education} theme={theme} />
          <SkillsBlock skills={skills} theme={theme} />
          <CertificatesBlock certificates={certificates} theme={theme} />
          <LanguagesBlock languages={languages} theme={theme} />
          <AchievementsBlock achievements={achievements} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function MagazineLayout({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const { personalInfo, summary, experience, projects, education, skills, certificates, languages, achievements } = data;
  return (
    <div className={`${theme.page} p-8 ${theme.text} font-sans text-sm leading-relaxed max-w-4xl mx-auto shadow-xl rounded-xl border ${theme.border}`}>
      <header className="mb-8 grid gap-4 md:grid-cols-12 items-end border-b-4 border-rose-600 pb-6">
        <div className="md:col-span-8">
          <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.accent} font-bold mb-2`}>Resume Profile</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.95]">
            {personalInfo.fullName || 'Your Name'}
          </h1>
        </div>
        <div className="md:col-span-4 text-xs space-y-1 md:text-right">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedIn && <div>{personalInfo.linkedIn}</div>}
          {personalInfo.portfolio && <div>{personalInfo.portfolio}</div>}
        </div>
      </header>

      {summary && (
        <section className="mb-8">
          <p className="text-base leading-relaxed font-medium opacity-90 border-l-4 border-rose-500 pl-4">{summary}</p>
        </section>
      )}

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <ExperienceBlock experience={experience} theme={theme} />
          <ProjectsBlock projects={projects} theme={theme} />
          <AchievementsBlock achievements={achievements} theme={theme} />
        </div>
        <div className="md:col-span-2 space-y-6">
          <EducationBlock education={education} theme={theme} />
          <SkillsBlock skills={skills} theme={theme} />
          <CertificatesBlock certificates={certificates} theme={theme} />
          <LanguagesBlock languages={languages} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function SidebarLeftLayout({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const { personalInfo, summary, experience, projects, achievements } = data;
  return (
    <div className={`${theme.page} ${theme.text} font-sans text-sm leading-relaxed max-w-4xl mx-auto shadow-xl rounded-xl overflow-hidden border ${theme.border} flex flex-col sm:flex-row`}>
      <aside className={`${theme.sidebarBg ?? 'bg-slate-900'} ${theme.sidebarText ?? 'text-white'} p-6 sm:w-[32%] shrink-0`}>
        <h1 className="text-2xl font-extrabold tracking-tight leading-tight">{personalInfo.fullName || 'Your Name'}</h1>
        <div className="mt-3 space-y-1 text-[11px] opacity-90">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedIn && <div>{personalInfo.linkedIn}</div>}
          {personalInfo.github && <div>{personalInfo.github}</div>}
          {personalInfo.portfolio && <div>{personalInfo.portfolio}</div>}
        </div>
        <div className="mt-6">
          <SidebarExtras data={data} theme={theme} light />
        </div>
      </aside>

      <main className="p-6 sm:p-8 flex-1 space-y-6">
        <SummaryBlock summary={summary} theme={theme} />
        <ExperienceBlock experience={experience} theme={theme} />
        <ProjectsBlock projects={projects} theme={theme} />
        <AchievementsBlock achievements={achievements} theme={theme} />
      </main>
    </div>
  );
}

function CompactLayout({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const { personalInfo, summary, experience, projects, education, skills, certificates, languages, achievements } = data;
  return (
    <div className={`${theme.page} p-6 ${theme.text} font-sans text-[12px] leading-snug max-w-4xl mx-auto shadow-xl rounded-xl border ${theme.border}`}>
      <header className={`pb-3 mb-3 border-b-2 ${theme.border} flex flex-wrap justify-between gap-3 items-end`}>
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">{personalInfo.fullName || 'Your Name'}</h1>
          <ContactLine personalInfo={personalInfo} withIcons={false} className={`mt-1 ${theme.muted}`} />
        </div>
        {theme.accent.includes('red') && <div className="h-8 w-8 bg-red-600 shrink-0" aria-hidden />}
      </header>

      {summary && (
        <section className="mb-3">
          <SectionTitle title="Summary" theme={theme} />
          <p className="text-[11px] leading-relaxed opacity-90">{summary}</p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-3">
        <ExperienceBlock experience={experience} theme={theme} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ProjectsBlock projects={projects} theme={theme} />
          <div className="space-y-3">
            <EducationBlock education={education} theme={theme} />
            <SkillsBlock skills={skills} theme={theme} />
            <CertificatesBlock certificates={certificates} theme={theme} />
            <LanguagesBlock languages={languages} theme={theme} />
            <AchievementsBlock achievements={achievements} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StandardLayout({
  data,
  theme,
  twoColumn = false,
  banner = false,
}: {
  data: ResumeData;
  theme: TemplateTheme;
  twoColumn?: boolean;
  banner?: boolean;
}) {
  const { personalInfo, summary, experience, projects, education, skills, certificates, languages, achievements } = data;
  const useBanner = banner || Boolean(theme.headerBg);

  return (
    <div
      className={`${theme.page} p-8 ${theme.text} ${theme.font ?? 'font-sans'} text-sm leading-relaxed max-w-4xl mx-auto shadow-xl rounded-xl border ${theme.border} print:p-0 print:border-none print:shadow-none`}
    >
      <header
        className={`pb-6 mb-6 ${
          useBanner
            ? `${theme.headerBg} ${theme.headerText ?? 'text-white'} p-6 -mx-8 -mt-8 rounded-t-xl`
            : `border-b ${theme.border}`
        }`}
      >
        <h1 className="text-3xl font-extrabold tracking-tight">{personalInfo.fullName || 'Your Name'}</h1>
        <ContactLine personalInfo={personalInfo} className="mt-2" />
      </header>

      <SummaryBlock summary={summary} theme={theme} />

      <div className={twoColumn ? 'grid grid-cols-1 sm:grid-cols-3 gap-6' : 'space-y-6'}>
        <div className={twoColumn ? 'sm:col-span-2 space-y-6' : 'space-y-6'}>
          <ExperienceBlock experience={experience} theme={theme} />
          <ProjectsBlock projects={projects} theme={theme} />
          <AchievementsBlock achievements={achievements} theme={theme} />
        </div>

        <div className={twoColumn ? 'sm:col-span-1 space-y-6' : 'space-y-6'}>
          <EducationBlock education={education} theme={theme} />
          <SkillsBlock skills={skills} theme={theme} />
          <CertificatesBlock certificates={certificates} theme={theme} />
          <LanguagesBlock languages={languages} theme={theme} />
        </div>
      </div>
    </div>
  );
}

export function ResumeRenderer({ data, templateId }: { data: ResumeData; templateId: string }) {
  const theme = getTheme(templateId);

  switch (theme.layout) {
    case 'ats':
      return <AtsLayout data={data} theme={theme} />;
    case 'terminal':
      return <TerminalLayout data={data} theme={theme} />;
    case 'timeline':
      return <TimelineLayout data={data} theme={theme} />;
    case 'magazine':
      return <MagazineLayout data={data} theme={theme} />;
    case 'sidebar-left':
      return <SidebarLeftLayout data={data} theme={theme} />;
    case 'compact':
      return <CompactLayout data={data} theme={theme} />;
    case 'two-column':
      return <StandardLayout data={data} theme={theme} twoColumn />;
    case 'banner':
      return <StandardLayout data={data} theme={theme} banner />;
    case 'single':
    default:
      return <StandardLayout data={data} theme={theme} />;
  }
}
