'use client';

import React, { useState } from 'react';
import { Wand2, Copy, Download, Check, Sparkles, FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCoverLetter } from '@/lib/ai';
import { useAuth } from '@/components/providers/app-provider';

export default function CoverLetterPage() {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  const [company, setCompany] = useState('Stripe Ecosystem Team');
  const [jobDescription, setJobDescription] = useState(
    'Seeking an experienced engineer to build reactive payment onboarding flows and developer API integrations using Next.js, React, and TypeScript.'
  );
  const [keyStrengths, setKeyStrengths] = useState('5+ years building scalable microservices, Next.js architecture, and React UI systems.');
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 2 weeks');
  const [cultureFitNotes, setCultureFitNotes] = useState('Passionate about clean software design, developer tooling, and user delight.');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [salutation, setSalutation] = useState('Dear Hiring Manager');
  const [signOff, setSignOff] = useState('Sincerely');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const enrichedContext = `${jobDescription}\nCandidate Strengths: ${keyStrengths}\nAvailability: ${noticePeriod}\nValues Alignment: ${cultureFitNotes}`;
      const candidateName = user?.name || 'Alex Morgan';
      const result = await generateCoverLetter({
        jobTitle,
        company,
        description: enrichedContext,
        tone,
        length,
        candidateName,
      });
      // Strip any existing salutation/sign-off from the AI/fallback result
      const body = result
        .replace(/^Dear[^\n]*,\s*\n\s*\n/, '')  // Remove leading "Dear..." salutation
        .replace(/\n\s*\n\s*(Sincerely|Warm regards|Best regards|Regards|Respectfully)[\s\S]*$/, '')  // Remove trailing sign-off
        .trim();
      const formatted = `${salutation} at ${company || 'the hiring team'},\n\n${body}\n\n${signOff},\n${candidateName}`;
      setContent(formatted);
    } catch (err) {
      console.error('Cover letter generation failed:', err);
      setError('Failed to generate cover letter. Using fallback template.');
      // Generate a simple fallback directly
      const candidateName = user?.name || 'Alex Morgan';
      const fallbackBody = `I am writing to express my strong interest in the ${jobTitle || 'Software Engineer'} position at ${company || 'your organization'}. With my background in ${keyStrengths || 'building high-performance software solutions'}, I am confident in my ability to deliver immediate value to your team.\n\nThroughout my career, I have consistently driven projects from concept to completion, pairing clean architecture with agile execution. ${cultureFitNotes ? `I am particularly drawn to your team because ${cultureFitNotes}.` : ''} ${noticePeriod ? `I am available ${noticePeriod}.` : ''}\n\nI would welcome the opportunity to discuss how my skill set aligns with your goals and contribute to the continued success of ${company || 'your organization'}.`;
      setContent(`${salutation} at ${company || 'the hiring team'},\n\n${fallbackBody}\n\n${signOff},\n${candidateName}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-300">
            <Wand2 className="h-3.5 w-3.5" /> AI Cover Letter Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mt-1">AI Cover Letter Generator</h1>
          <p className="text-xs text-slate-400">Generate targeted cover letters tailored with candidate strengths, availability, and values alignment.</p>
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating} className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-xs text-white shadow-lg shadow-fuchsia-600/30">
          <Sparkles className="mr-1.5 h-4 w-4" /> {isGenerating ? 'AI Writing Letter...' : 'Generate Letter'}
        </Button>
      </div>

      {/* Grid Inputs & Output */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left Column: Form Controls (5 cols) */}
        <div className="xl:col-span-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4 max-h-[650px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-white">Target Position & Personalization</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] text-slate-400">Job Title</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Company Name</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400">Job Description / Requirements</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none leading-relaxed"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {/* Important Extra Sections Requested by User */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h4 className="text-xs font-semibold text-fuchsia-300 uppercase tracking-wider">Candidate Strengths & Availability</h4>
            
            <div>
              <label className="text-[11px] text-slate-400">Key Achievements / Core Strengths Highlight</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                placeholder="e.g. Scaled Next.js web app to 1M+ active users..."
                value={keyStrengths}
                onChange={(e) => setKeyStrengths(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] text-slate-400">Availability / Notice Period</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                  placeholder="e.g. Immediate / 2 weeks"
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Salutation</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400">Company Culture / Values Alignment Note</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none"
                placeholder="Why you value this specific company culture..."
                value={cultureFitNotes}
                onChange={(e) => setCultureFitNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 border-t border-white/10 pt-4">
            <div>
              <label className="text-[11px] text-slate-400">Tone</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="Professional">Professional</option>
                <option value="Executive">Executive</option>
                <option value="Confident">Confident</option>
                <option value="Enthusiastic">Enthusiastic</option>
                <option value="Minimalist">Minimalist</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400">Length</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              >
                <option value="Short">Short (1-2 paragraphs)</option>
                <option value="Medium">Medium (3 paragraphs)</option>
                <option value="Comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Output Letter Preview (7 cols) */}
        <div className="xl:col-span-7 rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-fuchsia-400" /> Tailored Cover Letter Preview
            </span>

            {content && (
              <Button onClick={handleCopy} size="sm" className="h-8 text-xs bg-white/10 text-white hover:bg-white/20">
                {copied ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Letter'}
              </Button>
            )}
          </div>

          {content ? (
            <textarea
              rows={16}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-xs text-slate-200 outline-none leading-relaxed font-sans"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-8 text-center">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Sparkles className="h-10 w-10 text-fuchsia-400/60 mb-3" />
              <p className="text-sm font-medium text-white">No cover letter generated yet</p>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">Fill in your job title, candidate strengths, and notice period, then click Generate Letter above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
