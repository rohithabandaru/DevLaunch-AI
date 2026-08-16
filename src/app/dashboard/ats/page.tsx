'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertTriangle, Wand2, RefreshCw, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateATSAnalysis } from '@/lib/ai';

export default function ATSCheckerPage() {
  const [resumeText, setResumeText] = useState(
    `Alex Morgan\nSenior Full Stack Engineer\nEmail: alex.morgan@devlaunch.ai | Location: San Francisco, CA\nSummary: Architected real-time dynamic dashboard pipelines serving 500k+ daily API requests using Next.js App Router and PostgreSQL. Engineered responsive component library in Tailwind CSS & TypeScript.`
  );
  const [jobDescription, setJobDescription] = useState(
    `We are looking for a Senior Full Stack Engineer with strong experience in TypeScript, React, Next.js, PostgreSQL, Node.js, and API architecture.`
  );
  const safeAnalyze = (resume: string, job: string) => {
    try {
      return generateATSAnalysis(resume, job);
    } catch (err) {
      return {
        overallScore: 0,
        keywordMatch: 0,
        formatting: 'Unconfigured',
        skillsMatch: 'AI Service Required',
        readability: 'Unconfigured',
        suggestions: ['AI service is not configured. Please set a valid OPENAI_API_KEY.'],
        missingKeywords: [],
        error: err instanceof Error ? err.message : 'AI service is not configured.',
      };
    }
  };

  const [analysis, setAnalysis] = useState(() => safeAnalyze(resumeText, jobDescription));
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setAnalysis(safeAnalyze(resumeText, jobDescription));
      setIsScanning(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" /> ATS Scanner Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mt-1">ATS Resume Scanner</h1>
          <p className="text-xs text-slate-400">Analyze your resume against job descriptions to increase recruiter response rates.</p>
        </div>

        <Button onClick={handleScan} disabled={isScanning} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white shadow-lg shadow-emerald-600/30">
          <Wand2 className="mr-1.5 h-4 w-4" /> {isScanning ? 'Scanning...' : 'Run ATS Audit'}
        </Button>
      </div>

      {/* Input Boxes Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resume Input Box */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-400" /> Resume Content
            </h3>
            <span className="text-[11px] text-slate-400">Paste raw text or edit</span>
          </div>
          <textarea
            rows={10}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-white outline-none leading-relaxed"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        {/* Job Description Input Box */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-cyan-400" /> Target Job Description
            </h3>
            <span className="text-[11px] text-slate-400">Target role keywords</span>
          </div>
          <textarea
            rows={10}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-white outline-none leading-relaxed"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <h2 className="text-lg font-bold text-white">ATS Analysis Results</h2>

        {/* Score Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-xs text-emerald-300">Overall Match Score</p>
            <p className="text-3xl font-extrabold text-white mt-1">{analysis.overallScore} / 100</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Keyword Coverage</p>
            <p className="text-2xl font-bold text-cyan-300 mt-1">{analysis.keywordMatch}%</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Formatting Readiness</p>
            <p className="text-2xl font-bold text-violet-300 mt-1">{analysis.formatting}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Skills Alignment</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{analysis.skillsMatch}</p>
          </div>
        </div>

        {/* Actionable Suggestions & Missing Keywords */}
        <div className="grid gap-6 lg:grid-cols-2 pt-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Actionable Recommendations
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {analysis.suggestions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-violet-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Missing High-Impact Keywords
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {analysis.missingKeywords.length > 0 ? (
                analysis.missingKeywords.map((kw, i) => (
                  <span key={i} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
                    + {kw}
                  </span>
                ))
              ) : (
                <p className="text-xs text-emerald-300">All target job keywords are present in your resume!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
