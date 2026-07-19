"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileSearch,
  PenTool,
  Lightbulb,
  Target,
  BarChart3,
  Loader2,
  Copy,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useJobTracker } from "@/components/jobtracker/JobTrackerContext";

type ToolId = "match" | "suggestions" | "coverletter" | "analyzer" | "prep" | "skillgap";

const tools: { id: ToolId; title: string; desc: string; icon: typeof Sparkles; color: string; bg: string }[] = [
  { id: "match", title: "Resume Match Score", desc: "Check ATS compatibility against a job description", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "suggestions", title: "AI Resume Tips", desc: "Get improvement suggestions for your resume", icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "coverletter", title: "Cover Letter Generator", desc: "Generate a professional cover letter", icon: PenTool, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "analyzer", title: "JD Analyzer", desc: "Extract key skills and requirements from a job posting", icon: FileSearch, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "prep", title: "Interview Prep", desc: "AI-suggested preparation topics for a role", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "skillgap", title: "Skill Gap Analysis", desc: "Compare your skills vs job requirements", icon: BarChart3, color: "text-rose-600", bg: "bg-rose-50" },
];

/* ──────────────── Mock AI Responses ──────────────── */

const mockMatchSeed = {
  score: 78,
  matched: ["React", "TypeScript", "Next.js", "REST APIs", "Git"],
  missing: ["GraphQL", "AWS", "Docker", "CI/CD"],
  suggestions: [
    "Add a projects section showcasing GraphQL integration",
    "Include DevOps experience even if limited (GitHub Actions counts!)",
    "Mention cloud deployment experience with Vercel or AWS",
  ],
};

const mockSuggestionsSeed = [
  "🎯 Use action verbs: Replace 'Responsible for' with 'Led', 'Built', 'Shipped'",
  "📊 Add metrics: 'Reduced page load time by 40%' is stronger than 'Improved performance'",
  "🔗 Include GitHub links for all major projects",
  "📝 Tailor your summary to match the job description keywords",
  "💡 Add a 'Technical Skills' section with proficiency levels",
  "🏆 Include any certifications (AWS, Google, etc.) prominently",
];

const mockCoverLetterSeed = `Dear Hiring Manager,

I am writing to express my strong interest in the Frontend Developer position at Google. With extensive experience in React, Next.js, and TypeScript, I am confident in my ability to contribute meaningfully to your team.

In my recent role, I led the development of a full-stack AI-powered platform using Next.js 15 and React 19, implementing features such as real-time interview simulation, a Monaco-based coding workspace, and interactive SVG analytics dashboards. This project sharpened my skills in component architecture, state management, and responsive design.

I am particularly drawn to Google’s commitment to building products that impact billions of users. I am eager to bring my technical expertise and collaborative mindset to your engineering team.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
Rohitha`;

const mockJDAnalysisSeed = {
  skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker"],
  requirements: [
    "3+ years of frontend development experience",
    "Proficiency in React and TypeScript",
    "Experience with cloud services (AWS preferred)",
    "Strong understanding of REST and GraphQL APIs",
  ],
  redFlags: [
    "⚠️ 'Fast-paced environment' — may indicate high pressure / overtime",
    "⚠️ 'Wear many hats' — role boundaries may be unclear",
  ],
  positives: [
    "✅ Competitive salary and stock options mentioned",
    "✅ Remote-friendly with flexible hours",
    "✅ Learning & development budget provided",
  ],
};

const mockPrepSeed = [
  { topic: "React Internals", desc: "Virtual DOM diffing, Fiber architecture, concurrent rendering" },
  { topic: "System Design", desc: "Design a real-time notification system at scale" },
  { topic: "TypeScript Advanced", desc: "Generics, conditional types, mapped types, utility types" },
  { topic: "Behavioral (STAR)", desc: "Prepare 3 stories: leadership, conflict resolution, failure & learning" },
  { topic: "Coding Patterns", desc: "Two pointers, sliding window, BFS/DFS, dynamic programming basics" },
];

const mockSkillGapSeed = {
  strong: [
    { skill: "React", level: 92 },
    { skill: "TypeScript", level: 88 },
    { skill: "Next.js", level: 85 },
    { skill: "CSS/Tailwind", level: 90 },
  ],
  weak: [
    { skill: "GraphQL", level: 30 },
    { skill: "AWS", level: 25 },
    { skill: "Docker", level: 20 },
    { skill: "System Design", level: 45 },
  ],
};

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Dynamic States for API/Fallback Data
  const [matchData, setMatchData] = useState(mockMatchSeed);
  const [suggestionsData] = useState(mockSuggestionsSeed);
  const [coverLetterData, setCoverLetterData] = useState(mockCoverLetterSeed);
  const [jdAnalysisData, setJdAnalysisData] = useState(mockJDAnalysisSeed);
  const [prepData] = useState(mockPrepSeed);
  const [skillGapData] = useState(mockSkillGapSeed);

  const { tier } = useJobTracker();
  const isPro = tier === "pro";

  const handleUpgrade = async (planType: "monthly" | "yearly" = "monthly") => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, userId: "test-user-id" }), // Replace with actual user ID from auth
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Local re-mapping to preserve JSX references
  const mockMatch = matchData;
  const mockSuggestions = suggestionsData;
  const mockCoverLetter = coverLetterData;
  const mockJDAnalysis = jdAnalysisData;
  const mockPrep = prepData;
  const mockSkillGap = skillGapData;

  const handleRun = async () => {
    if (!activeTool) return;
    setLoading(true);
    setResult(null);

    try {
      if (activeTool === "match") {
        const res = await fetch("/api/ai/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: "React, TypeScript, Next.js, HTML, CSS, Git, Webpack, Tailwind CSS.",
            jobDescription: input,
          }),
        });
        const data = await res.json();
        if (data && !data.error) {
          setMatchData(data);
        }
      } else if (activeTool === "coverletter") {
        const parts = input.split("—").map((p) => p.trim());
        const company = parts[0] || "Target Company";
        const role = parts[1] || "Software Engineer";
        const res = await fetch("/api/ai/coverletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company,
            role,
            resumeText: "Experienced frontend engineer skilled in React, Next.js, Tailwind CSS, and building premium user interfaces.",
          }),
        });
        const data = await res.json();
        if (data && data.coverLetter) {
          setCoverLetterData(data.coverLetter);
        }
      } else if (activeTool === "analyzer") {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: input }),
        });
        const data = await res.json();
        if (data && !data.error) {
          setJdAnalysisData(data);
        }
      }
      setResult("done");
    } catch (err) {
      console.error("AI Tool integration error:", err);
      setResult("done");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Tools</h1>
        <p className="text-sm text-slate-500 mt-1">
          AI-powered tools to optimize your job search. All analysis runs locally with simulated results.
        </p>
      </div>

      {/* Tool Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id);
              setResult(null);
              setInput("");
            }}
            className={`text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${
              activeTool === tool.id
                ? "border-indigo-300 ring-2 ring-indigo-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className={`${tool.bg} p-2.5 rounded-xl w-fit mb-3`}>
              <tool.icon className={`h-5 w-5 ${tool.color}`} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{tool.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Active Tool Panel */}
      {activeTool && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in space-y-5 relative overflow-hidden">
          
          {/* Paywall Overlay for Free Users */}
          {!isPro && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[3px] flex flex-col items-center justify-center p-6">
              <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm text-center border border-slate-100 animate-fade-in-up">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-5 shadow-lg shadow-indigo-200">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-2xl mb-3 tracking-tight">Pro Feature</h4>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Upgrade to DevLaunch AI Pro to unlock advanced AI generation, match scoring, and unlimited interview prep.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => handleUpgrade("monthly")} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 text-sm font-bold shadow-lg shadow-slate-200">
                    Upgrade to Pro (₹499/mo)
                  </Button>
                  <Button onClick={() => handleUpgrade("yearly")} variant="outline" className="w-full rounded-xl h-12 text-sm font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
                    Get Yearly (₹4999/yr)
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={!isPro ? "opacity-30 pointer-events-none select-none blur-sm" : ""}>
            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
              {tools.find((t) => t.id === activeTool)?.title}
            </h3>

          {/* Input area for tools that need it */}
          {(activeTool === "match" || activeTool === "analyzer" || activeTool === "coverletter") && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {activeTool === "coverletter"
                  ? "Enter company name and role"
                  : "Paste the job description below"}
              </label>
              <textarea
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTool === "coverletter"
                    ? "e.g. Google — Frontend Developer"
                    : "Paste the full job description here..."
                }
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
          )}

          <Button
            onClick={handleRun}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Run Analysis
              </>
            )}
          </Button>

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              {activeTool === "match" && (
                <>
                  {/* Score circle */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={mockMatch.score >= 70 ? "#10b981" : "#f59e0b"}
                          strokeWidth="8"
                          strokeDasharray={`${(mockMatch.score / 100) * 251.2} 251.2`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                        <text x="50" y="54" textAnchor="middle" className="fill-slate-900 font-extrabold" style={{ fontSize: 20 }}>
                          {mockMatch.score}%
                        </text>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">ATS Match Score</p>
                      <p className="text-xs text-slate-500 mt-1">Based on keyword analysis</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-emerald-700 mb-2">✅ Matched Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mockMatch.matched.map((k) => (
                          <span key={k} className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-rose-700 mb-2">❌ Missing Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mockMatch.missing.map((k) => (
                          <span key={k} className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-semibold">{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-700 mb-2">💡 Suggestions</p>
                    <ul className="space-y-1.5">
                      {mockMatch.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-slate-600">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {activeTool === "suggestions" && (
                <div className="space-y-3">
                  {mockSuggestions.map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-700">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTool === "coverletter" && (
                <div className="relative">
                  <div className="bg-slate-50 rounded-xl p-5 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {mockCoverLetter}
                  </div>
                  <button
                    onClick={() => handleCopy(mockCoverLetter)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
              )}

              {activeTool === "analyzer" && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-indigo-700 mb-2">🛠 Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mockJDAnalysis.skills.map((s) => (
                        <span key={s} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-700 mb-2">📋 Requirements</p>
                    <ul className="space-y-1">
                      {mockJDAnalysis.requirements.map((r, i) => (
                        <li key={i} className="text-xs text-slate-600">• {r}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-emerald-700 mb-2">Positives</p>
                      <ul className="space-y-1">
                        {mockJDAnalysis.positives.map((p, i) => (
                          <li key={i} className="text-xs text-emerald-700">{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-amber-700 mb-2">Red Flags</p>
                      <ul className="space-y-1">
                        {mockJDAnalysis.redFlags.map((f, i) => (
                          <li key={i} className="text-xs text-amber-700">{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTool === "prep" && (
                <div className="space-y-3">
                  {mockPrep.map((p, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                      <div className="bg-indigo-50 p-2 rounded-lg shrink-0">
                        <span className="text-indigo-600 font-extrabold text-sm">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.topic}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTool === "skillgap" && (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wider">💪 Strong Skills</h4>
                    <div className="space-y-3">
                      {mockSkillGap.strong.map((s) => (
                        <div key={s.skill}>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>{s.skill}</span>
                            <span>{s.level}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${s.level}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-700 mb-3 uppercase tracking-wider">📈 Areas to Improve</h4>
                    <div className="space-y-3">
                      {mockSkillGap.weak.map((s) => (
                        <div key={s.skill}>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>{s.skill}</span>
                            <span>{s.level}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full transition-all duration-700" style={{ width: `${s.level}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
