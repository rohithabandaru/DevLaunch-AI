"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  FileText,
  FolderArchive,
  Globe,
  Loader2,
  Mail,
  MousePointerClick,
  Palette,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PORTFOLIO_TEMPLATES,
  getPublicPortfolioPath,
} from "@/lib/portfolio";
import type {
  PortfolioCompletionBreakdown,
  PortfolioData,
  PortfolioTemplateId,
} from "@/types/portfolio";
import { cn } from "@/lib/utils";

/** Brand icons removed from lucide-react — local SVGs match PortfolioSite. */
function Github({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function Linkedin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

type Props = {
  data: PortfolioData;
  completion: PortfolioCompletionBreakdown;
  suggestions: string[];
  lastSavedAt: string | null;
  publishing?: boolean;
  onThemeSelect: (template: PortfolioTemplateId) => void;
  onPublish: () => void;
  onExportHtml: () => void;
  onExportZip: () => void;
  onExportJson: () => void;
  onExportPdf: () => void;
  onOpenPreview: () => void;
  onSuggestion: (suggestion: string) => void;
  onGoSection: (section: string) => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not saved yet";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
      <div
        className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-xl"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className="rounded-xl p-2 text-white shadow-md"
          style={{ background: accent }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function PortfolioDashboard({
  data,
  completion,
  suggestions,
  lastSavedAt,
  publishing,
  onThemeSelect,
  onPublish,
  onExportHtml,
  onExportZip,
  onExportJson,
  onExportPdf,
  onOpenPreview,
  onSuggestion,
  onGoSection,
}: Props) {
  const publicPath = getPublicPortfolioPath(data.slug || "portfolio");
  const analytics = data.analytics;

  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                Portfolio Dashboard
              </Badge>
              {data.published ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-300/40">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/90 ring-1 ring-white/20">
                  <Circle className="h-3.5 w-3.5" />
                  Draft
                </span>
              )}
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {data.fullName || "Your portfolio"}
            </h2>
            <p className="mt-1 text-sm text-indigo-100">
              {data.title || "Add your professional title"}
              {data.location ? ` · ${data.location}` : ""}
            </p>
            <p className="mt-3 text-sm text-white/80">
              Last updated: {formatDate(data.updatedAt || lastSavedAt)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-indigo-100">
              <Globe className="h-3.5 w-3.5" />
              devlaunch.ai{publicPath}
              {data.published && (
                <button
                  type="button"
                  onClick={onOpenPreview}
                  className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 hover:bg-white/25"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                  Completion
                </p>
                <p className="mt-1 text-4xl font-black tabular-nums">
                  {completion.percent}%
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-white/30 bg-white/10 p-1">
                <div
                  className="flex h-full w-full items-center justify-center rounded-full bg-white/20 text-sm font-bold"
                  style={{
                    background: `conic-gradient(white ${completion.percent}%, transparent 0)`,
                  }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-700 text-xs">
                    {completion.percent}
                  </span>
                </div>
              </div>
            </div>
            <Progress
              value={completion.percent}
              className="mt-4 h-2 bg-white/20 [&>div]:bg-white"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-white text-indigo-700 hover:bg-indigo-50"
                disabled={publishing}
                onClick={onPublish}
              >
                {publishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Rocket className="h-3.5 w-3.5" />
                )}
                {data.published ? "Republish" : "Publish"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={onOpenPreview}
              >
                <Eye className="h-3.5 w-3.5" />
                Live preview
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Portfolio Analytics</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Views"
            value={analytics.views}
            icon={Eye}
            accent="#4f46e5"
          />
          <StatCard
            label="Unique visitors"
            value={analytics.uniqueVisitors}
            icon={Users}
            accent="#7c3aed"
          />
          <StatCard
            label="Resume downloads"
            value={analytics.resumeDownloads}
            icon={Download}
            accent="#059669"
          />
          <StatCard
            label="Contact submissions"
            value={analytics.contactSubmissions}
            icon={Mail}
            accent="#ea580c"
          />
          <StatCard
            label="GitHub clicks"
            value={analytics.githubClicks}
            icon={Github}
            accent="#0f172a"
          />
          <StatCard
            label="LinkedIn clicks"
            value={analytics.linkedinClicks}
            icon={Linkedin}
            accent="#0a66c2"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completion checklist */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
          <h3 className="text-sm font-bold text-slate-900">Section checklist</h3>
          <p className="mt-1 text-xs text-slate-500">
            Fill these areas to improve your completion score.
          </p>
          <ul className="mt-4 space-y-2">
            {completion.sections.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  {s.complete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                  {s.label}
                </span>
                {!s.complete && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                    onClick={() => onGoSection(s.key === "social" || s.key === "seo" || s.key === "design" || s.key === "extras" ? (s.key === "social" ? "contact" : s.key === "seo" || s.key === "design" ? "design" : "achievements") : s.key)}
                  >
                    Fix
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* AI suggestions */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">AI Suggestions</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            One-click improvements tailored to your draft.
          </p>
          {suggestions.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              Your portfolio looks polished. Try AI Studio for rewrites.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => onSuggestion(s)}
                    className="flex w-full items-start gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition hover:border-violet-300 hover:shadow-sm"
                  >
                    <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Theme selection */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Theme selection</h3>
          <Badge variant="secondary" className="text-[10px]">
            {data.template}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PORTFOLIO_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onThemeSelect(t.id)}
              className={cn(
                "group overflow-hidden rounded-2xl border text-left transition",
                data.template === t.id
                  ? "border-indigo-500 ring-2 ring-indigo-200"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "h-16 bg-gradient-to-br",
                  t.preview
                )}
              />
              <div className="p-3">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t.blurb}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Export portfolio</h3>
        <p className="mt-1 text-xs text-slate-500">
          Download HTML, ZIP (static site), JSON data, or a PDF summary.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={onExportHtml}
          >
            <FileText className="h-3.5 w-3.5" />
            HTML
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={onExportZip}
          >
            <FolderArchive className="h-3.5 w-3.5" />
            ZIP
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={onExportJson}
          >
            <FileJson className="h-3.5 w-3.5" />
            JSON
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={onExportPdf}
          >
            <Download className="h-3.5 w-3.5" />
            PDF summary
          </Button>
        </div>
      </div>
    </div>
  );
}
