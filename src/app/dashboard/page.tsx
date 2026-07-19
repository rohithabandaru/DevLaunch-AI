"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Globe,
  Briefcase,
  Bot,
  Code,
  BookOpen,
  BarChart3,
  Flame,
  Trophy,
  Target,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

const tools = [
  {
    title: "AI Interview Coach",
    description: "Simulate live voice/text mock interviews with STAR-method review.",
    icon: Bot,
    href: "/aiinterview",
    gradient: "from-indigo-500 to-blue-500",
    shadow: "shadow-indigo-100",
  },
  {
    title: "Coding Playground",
    description: "Solve algorithmic challenges with a built-in Monaco Editor.",
    icon: Code,
    href: "/coding",
    gradient: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-100",
  },
  {
    title: "Company Q&A Bank",
    description: "Browse curated questions from Google, Meta, Microsoft, and more.",
    icon: BookOpen,
    href: "/questionbank",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-100",
  },
  {
    title: "Skill Reports",
    description: "Track performance trends with custom skill radar dashboards.",
    icon: BarChart3,
    href: "/reports",
    gradient: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-100",
  },
  {
    title: "Resume Optimizer",
    description: "Build and parse ATS-friendly resumes in real-time.",
    icon: FileText,
    href: "/resume",
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-100",
  },
  {
    title: "Portfolio Website",
    description: "Create and host your professional developer portfolio.",
    icon: Globe,
    href: "/portfolio",
    gradient: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-100",
  },
  {
    title: "Job Applications",
    description: "Organize applications across pipeline Kanban board stages.",
    icon: Briefcase,
    href: "/jobtracker",
    gradient: "from-slate-600 to-slate-800",
    shadow: "shadow-slate-200",
  },
];

const leaderboard = [
  { rank: 1, name: "Rohitha", xp: "4,820 XP", avatar: "R", color: "bg-indigo-100 text-indigo-700" },
  { rank: 2, name: "Arjun Kumar", xp: "4,450 XP", avatar: "A", color: "bg-emerald-100 text-emerald-700" },
  { rank: 3, name: "You", xp: "3,890 XP", avatar: "U", color: "bg-violet-100 text-violet-700 font-bold border-2 border-violet-300" },
  { rank: 4, name: "Priya Reddy", xp: "3,620 XP", avatar: "P", color: "bg-amber-100 text-amber-700" },
  { rank: 5, name: "Sneha Patel", xp: "3,110 XP", avatar: "S", color: "bg-rose-100 text-rose-700" },
];

const achievements = [
  { title: "STAR Speaker", desc: "STAR structure response", icon: Sparkles, color: "text-amber-500 bg-amber-50" },
  { title: "Code Warrior", desc: "Solve 5 coding tests", icon: Target, color: "text-indigo-500 bg-indigo-50" },
  { title: "Consistency King", desc: "5-day practice streak", icon: Flame, color: "text-rose-500 bg-rose-50" },
];

export default function DashboardPage() {
  const [streakCount] = useState(5);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-indigo-600 hover:opacity-90 transition-opacity"
          >
            DevLaunch AI
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard" className="text-sm font-semibold text-indigo-600">
              Dashboard
            </Link>
            <Link href="/questionbank" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Question Bank
            </Link>
            <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Performance Reports
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* Welcome Section */}
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white shadow-lg shadow-indigo-200 animate-float">
            👋
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back to DevLaunch AI
            </h1>
            <p className="mt-1 text-slate-600">
              Here is your interview preparation overview for today.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* interviews count */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews Completed</span>
              <p className="text-3xl font-black text-slate-900">12</p>
              <span className="text-2xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">+3 this week</span>
            </div>
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl">
              <Trophy className="h-6 w-6" />
            </div>
          </div>

          {/* average score circular svg */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</span>
              <p className="text-3xl font-black text-slate-900">82%</p>
              <span className="text-2xs text-slate-500 font-medium">Ranked top 15%</span>
            </div>
            <div className="relative h-14 w-14 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 w-14 h-14">
                <circle cx="28" cy="28" r="24" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                <circle cx="28" cy="28" r="24" stroke="#4f46e5" strokeWidth="4" fill="transparent"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - 0.82)} />
              </svg>
              <span className="text-xs font-black text-indigo-600">82%</span>
            </div>
          </div>

          {/* daily practice streak */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Practice Streak</span>
              <p className="text-3xl font-black text-slate-900">{streakCount} Days</p>
              <span className="text-2xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Keep it up!</span>
            </div>
            <div className="h-12 w-12 bg-rose-50 text-rose-500 flex items-center justify-center rounded-xl animate-pulse">
              <Flame className="h-6 w-6 fill-rose-500" />
            </div>
          </div>

          {/* weak area Focus */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Focus Area</span>
              <p className="text-xl font-black text-slate-900">System Design</p>
              <span className="text-2xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">Needs Practice</span>
            </div>
            <div className="h-12 w-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-xl">
              <Target className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* main grid section */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* left tools panel */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Your Workspaces</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    className={`group border border-slate-200 bg-white rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200`}
                  >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-md ${tool.shadow}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{tool.title}</h3>
                    <p className="mt-2 text-slate-600 text-sm leading-relaxed">{tool.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Workspace <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* right widgets panel */}
          <div className="lg:col-span-4 space-y-8">
            {/* Leaderboard widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Weekly Leaderboard</h3>
              </div>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{user.rank}</span>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${user.color}`}>
                        {user.avatar}
                      </div>
                      <span className={`text-sm ${user.name === "You" ? "font-bold text-slate-900" : "text-slate-700"}`}>
                        {user.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{user.xp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Achievements</h3>
              </div>
              <div className="grid gap-4">
                {achievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div key={ach.title} className="flex items-center gap-3">
                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${ach.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ach.title}</h4>
                        <p className="text-2xs text-slate-500">{ach.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}