"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  Sparkles,
  Target,
  Calendar,
} from "lucide-react";

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<"technical" | "behavioral" | "communication">("technical");

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
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/questionbank" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Question Bank
            </Link>
            <Link href="/reports" className="text-sm font-semibold text-indigo-600">
              Performance Reports
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        <div>
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Analytics</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Performance Reports
          </h1>
          <p className="mt-2 text-slate-600">
            Monitor your interview preparedness, evaluate specific domain skill strengths, and track filler words statistics.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 text-sm shrink-0">
          <button
            onClick={() => setActiveTab("technical")}
            className={`pb-4 px-4 font-bold border-b-2 tracking-wide uppercase transition-colors ${
              activeTab === "technical" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Technical Capability
          </button>
          <button
            onClick={() => setActiveTab("communication")}
            className={`pb-4 px-4 font-bold border-b-2 tracking-wide uppercase transition-colors ${
              activeTab === "communication" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Communication Analytics
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* SVG Charts Dashboard widget (Left column, spans 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {activeTab === "technical" ? (
              /* Technical Reports charts */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Skill Strengths Radar</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Radar visualization of your capabilities across core software domains.
                  </p>
                </div>

                {/* SVG Radar Chart */}
                <div className="flex justify-center py-4">
                  <svg className="w-[300px] h-[300px]" viewBox="0 0 300 300">
                    {/* Concentric grid pentagons */}
                    {/* 100% pentagon */}
                    <polygon points="150,50 245,122 209,219 91,219 55,122" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    {/* 80% pentagon */}
                    <polygon points="150,70 226,127 197,205 103,205 74,127" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    {/* 60% pentagon */}
                    <polygon points="150,90 207,133 185,191 115,191 93,133" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    {/* 40% pentagon */}
                    <polygon points="150,110 188,139 173,177 127,177 112,139" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    
                    {/* Center axes lines */}
                    <line x1="150" y1="150" x2="150" y2="50" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="150" y1="150" x2="245" y2="122" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="150" y1="150" x2="209" y2="219" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="150" y1="150" x2="91" y2="219" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="150" y1="150" x2="55" y2="122" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Labeled categories text */}
                    <text x="150" y="38" textAnchor="middle" className="text-3xs font-extrabold fill-slate-500 uppercase tracking-wider font-sans">System Design</text>
                    <text x="255" y="125" textAnchor="start" className="text-3xs font-extrabold fill-slate-500 uppercase tracking-wider font-sans">Frontend</text>
                    <text x="219" y="235" textAnchor="middle" className="text-3xs font-extrabold fill-slate-500 uppercase tracking-wider font-sans">Algorithms</text>
                    <text x="81" y="235" textAnchor="middle" className="text-3xs font-extrabold fill-slate-500 uppercase tracking-wider font-sans">Database</text>
                    <text x="45" y="125" textAnchor="end" className="text-3xs font-extrabold fill-slate-500 uppercase tracking-wider font-sans">Behavioral</text>

                    {/* Data Polygon path based on scores:
                        System Design: 75% -> (150, 75)
                        Frontend: 90% -> (235.5, 122)
                        Algorithms: 85% -> (200, 209)
                        Database: 70% -> (109, 198)
                        Behavioral: 80% -> (74, 128) */}
                    <polygon
                      points="150,75 235.5,125 200,209 109,198 74,128"
                      className="fill-indigo-500/25 stroke-indigo-600"
                      strokeWidth="2"
                    />

                    {/* Data Points hover circles */}
                    <circle cx="150" cy="75" r="4" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="235.5" cy="125" r="4" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="200" cy="209" r="4" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="109" cy="198" r="4" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="74" cy="128" r="4" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            ) : (
              /* Communication Reports charts */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Filler Words Trend</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Timeline tracking of filler words (like &apos;um&apos;, &apos;uh&apos;, &apos;like&apos;) used per interview.
                  </p>
                </div>

                {/* SVG Progress Line Chart */}
                <div className="py-2">
                  <svg className="w-full h-[200px]" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Horizontal grid lines */}
                    <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Y-axis labels */}
                    <text x="25" y="34" className="text-4xs fill-slate-400 font-mono" textAnchor="end">10 words</text>
                    <text x="25" y="84" className="text-4xs fill-slate-400 font-mono" textAnchor="end">5 words</text>
                    <text x="25" y="134" className="text-4xs fill-slate-400 font-mono" textAnchor="end">2 words</text>
                    <text x="25" y="184" className="text-4xs fill-slate-400 font-mono" textAnchor="end">0 words</text>

                    {/* Data Points:
                        Int 1 (June 10): 9 words -> y = 180 - (9 * 15) = 45
                        Int 2 (June 15): 7 words -> y = 180 - (7 * 15) = 75
                        Int 3 (June 28): 4 words -> y = 180 - (4 * 15) = 120
                        Int 4 (July 05): 2 words -> y = 180 - (2 * 15) = 150
                        Int 5 (July 12): 1 word  -> y = 180 - (1 * 15) = 165
                     */}
                    <path
                      d="M 60,45 L 160,75 L 260,120 L 360,150 L 460,165"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                    />

                    {/* Data Circles */}
                    <circle cx="60" cy="45" r="4.5" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="160" cy="75" r="4.5" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="260" cy="120" r="4.5" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="360" cy="150" r="4.5" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />
                    <circle cx="460" cy="165" r="4.5" className="fill-indigo-600 stroke-white" strokeWidth="1.5" />

                    {/* X-axis labels */}
                    <text x="60" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">June 10</text>
                    <text x="160" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">June 15</text>
                    <text x="260" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">June 28</text>
                    <text x="360" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">July 05</text>
                    <text x="460" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">July 12</text>
                  </svg>
                </div>
              </div>
            )}

            {/* Score History Graph */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Overall Score Progression</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Timeline of your mock interview performance scores.
                </p>
              </div>

              {/* Progress Line Chart SVG */}
              <div className="py-2">
                <svg className="w-full h-[200px]" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Grids */}
                  <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Y Axis Labels */}
                  <text x="25" y="34" className="text-4xs fill-slate-400 font-mono" textAnchor="end">100%</text>
                  <text x="25" y="84" className="text-4xs fill-slate-400 font-mono" textAnchor="end">80%</text>
                  <text x="25" y="134" className="text-4xs fill-slate-400 font-mono" textAnchor="end">60%</text>
                  <text x="25" y="184" className="text-4xs fill-slate-400 font-mono" textAnchor="end">40%</text>

                  {/* Path based on scores:
                      Int 1 (June 10): 70% -> y = 180 - (70 * 1.5) = 75
                      Int 2 (June 15): 72% -> y = 180 - (72 * 1.5) = 72
                      Int 3 (June 28): 78% -> y = 180 - (78 * 1.5) = 63
                      Int 4 (July 05): 82% -> y = 180 - (82 * 1.5) = 57
                      Int 5 (July 12): 85% -> y = 180 - (85 * 1.5) = 52.5
                   */}
                  <path
                    d="M 60,75 L 160,72 L 260,63 L 360,57 L 460,52.5"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />

                  {/* Points */}
                  <circle cx="60" cy="75" r="4.5" className="fill-emerald-500 stroke-white" strokeWidth="1.5" />
                  <circle cx="160" cy="72" r="4.5" className="fill-emerald-500 stroke-white" strokeWidth="1.5" />
                  <circle cx="260" cy="63" r="4.5" className="fill-emerald-500 stroke-white" strokeWidth="1.5" />
                  <circle cx="360" cy="57" r="4.5" className="fill-emerald-500 stroke-white" strokeWidth="1.5" />
                  <circle cx="460" cy="52.5" r="4.5" className="fill-emerald-500 stroke-white" strokeWidth="1.5" />

                  {/* X axis labels */}
                  <text x="60" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">June 10</text>
                  <text x="160" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">June 15</text>
                  <text x="260" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">June 28</text>
                  <text x="360" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">July 05</text>
                  <text x="460" y="196" className="text-4xs fill-slate-500 font-bold font-sans" textAnchor="middle">July 12</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right column: Highlights and Metrics statistics (spans 4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Category breakdown summary details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Target className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Key Metrics</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>System Design</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Frontend Architecture</span>
                    <span>90%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "90%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Algorithms & Data Structures</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Behavioral Frameworks</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats insights widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 text-base">AI Coach Insights</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Your **Frontend Development** scores are in the top 10% bracket. We recommend dedicating practice sessions to **System Design scale patterns** (message queues, caching strategies) to boost database scoring parameters.
              </p>
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-2xs p-3 rounded-lg flex items-start gap-2">
                <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Next scheduled practice: HR and Behavioral scenarios.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
