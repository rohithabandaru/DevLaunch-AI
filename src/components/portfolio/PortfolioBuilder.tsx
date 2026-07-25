"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Moon,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PortfolioEditor from "@/components/portfolio/editor/PortfolioEditor";
import PortfolioDashboard from "@/components/portfolio/PortfolioDashboard";
import PortfolioSite from "@/components/portfolio/preview/PortfolioSite";
import { EDITOR_SECTIONS } from "@/lib/portfolio";
import { generateFullPortfolioLocal } from "@/lib/portfolio-ai";
import {
  deployToVercel,
  downloadPortfolioJson,
  downloadPortfolioPdfSummary,
  downloadPortfolioZip,
  downloadStaticPortfolio,
} from "@/lib/portfolio-export";
import { usePortfolio, saveAnalyticsLocal } from "@/hooks/usePortfolio";
import type {
  PortfolioData,
  PortfolioEditorSection,
  PortfolioTemplateId,
} from "@/types/portfolio";
import { cn } from "@/lib/utils";

type PreviewDevice = "desktop" | "tablet" | "mobile";

export default function PortfolioBuilder() {
  const {
    data,
    hydrated,
    savedFlash,
    lastSavedAt,
    patchData,
    replaceData,
    handleManualSave,
    handleReset,
    handleLoadSample,
    publishLocal,
    completion,
    suggestions,
  } = usePortfolio();

  const [section, setSection] = useState<PortfolioEditorSection>("dashboard");
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const openFullPreview = useCallback(() => {
    localStorage.setItem(
      "devlaunch-portfolio-published",
      JSON.stringify({ ...data, published: true })
    );
    window.open(
      `/p/${data.slug || "preview"}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [data]);

  async function handleAiGenerate() {
    setAiLoading(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/ai/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "full_portfolio",
          portfolio: data,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.portfolio) {
          replaceData(json.portfolio as PortfolioData);
          setAiNote(
            json.demo
              ? "Generated with local AI draft (sign in + API key for cloud AI)."
              : "Full portfolio generated with AI."
          );
          setSection("hero");
          return;
        }
      }

      replaceData(generateFullPortfolioLocal(data));
      setAiNote("Generated with local AI draft.");
      setSection("hero");
    } catch {
      replaceData(generateFullPortfolioLocal(data));
      setAiNote("Generated with local AI draft (network unavailable).");
      setSection("hero");
    } finally {
      setAiLoading(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setAiNote(null);
    try {
      const local = publishLocal();
      saveAnalyticsLocal(local.slug, local.analytics);

      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: local.slug,
          title: local.seoTitle || local.fullName,
          theme: local.template,
          data: local,
          publish: true,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.portfolio?.id) {
          patchData({
            id: json.portfolio.id,
            published: true,
            publishedAt: new Date().toISOString(),
          });
        }
        setAiNote(
          json.demo
            ? `Published locally at /p/${local.slug} (connect Supabase for cloud publish).`
            : `Published at /p/${local.slug}`
        );
      } else {
        setAiNote(`Published locally at /p/${local.slug}`);
      }
      openFullPreview();
    } catch {
      const local = publishLocal();
      setAiNote(`Published locally at /p/${local.slug}`);
      openFullPreview();
    } finally {
      setPublishing(false);
    }
  }

  function handleSuggestion(suggestion: string) {
    const lower = suggestion.toLowerCase();
    if (lower.includes("full ai") || lower.includes("fill gaps")) {
      void handleAiGenerate();
      return;
    }
    if (lower.includes("about") || lower.includes("biography")) {
      setSection("about");
      return;
    }
    if (lower.includes("headline") || lower.includes("tagline")) {
      setSection("hero");
      return;
    }
    if (lower.includes("skills")) {
      setSection("skills");
      return;
    }
    if (lower.includes("project")) {
      setSection("projects");
      return;
    }
    if (lower.includes("seo") || lower.includes("meta")) {
      setSection("design");
      return;
    }
    if (lower.includes("call-to-action") || lower.includes("cta")) {
      setSection("hero");
      return;
    }
    setSection("ai");
  }

  const sectionMeta = useMemo(
    () => EDITOR_SECTIONS.find((s) => s.id === section),
    [section]
  );

  const deviceWidth =
    previewDevice === "mobile"
      ? "max-w-[390px]"
      : previewDevice === "tablet"
        ? "max-w-[768px]"
        : "w-full";

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading builder…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-indigo-600 hover:bg-indigo-600">
            Live builder
          </Badge>
          <span className="text-sm text-slate-500">
            {data.fullName || "Untitled portfolio"}
            {data.template ? ` · ${data.template}` : ""}
          </span>
          {data.published && (
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700"
            >
              Published
            </Badge>
          )}
          <Badge variant="secondary" className="tabular-nums">
            {completion.percent}% complete
          </Badge>
          {aiNote && (
            <span className="text-xs text-amber-600 sm:max-w-xs">{aiNote}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-violet-600 hover:bg-violet-700"
            disabled={aiLoading}
            onClick={handleAiGenerate}
          >
            {aiLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI Portfolio Generator
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              patchData({
                themeMode: data.themeMode === "dark" ? "light" : "dark",
              })
            }
          >
            {data.themeMode === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
            {data.themeMode === "dark" ? "Light" : "Dark"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 lg:hidden"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            Preview
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5 text-slate-500"
            onClick={handleManualSave}
          >
            <Save className="h-3.5 w-3.5" />
            {savedFlash ? "Saved" : "Save"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5 text-slate-500"
            onClick={handleLoadSample}
          >
            Sample
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5 text-rose-600"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        {/* Section nav + editor */}
        <div className="space-y-4 xl:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sections
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 xl:grid xl:grid-cols-2 xl:overflow-visible">
              {EDITOR_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "shrink-0 rounded-xl px-3 py-2 text-left text-sm transition",
                    section === s.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span className="font-medium">{s.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 hidden text-[11px] leading-tight xl:block",
                      section === s.id ? "text-indigo-100" : "text-slate-400"
                    )}
                  >
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3 xl:hidden">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  {sectionMeta?.label}
                </p>
                <p className="text-sm text-slate-500">
                  {sectionMeta?.description}
                </p>
              </div>
            </div>

            {section === "dashboard" ? (
              <PortfolioDashboard
                data={data}
                completion={completion}
                suggestions={suggestions}
                lastSavedAt={lastSavedAt}
                publishing={publishing}
                onThemeSelect={(template: PortfolioTemplateId) => {
                  const darkish =
                    template === "dark" || template === "developer";
                  patchData({
                    template,
                    themeMode: darkish ? "dark" : data.themeMode,
                  });
                }}
                onPublish={handlePublish}
                onExportHtml={() => downloadStaticPortfolio(data)}
                onExportZip={() => downloadPortfolioZip(data)}
                onExportJson={() => downloadPortfolioJson(data)}
                onExportPdf={() => downloadPortfolioPdfSummary(data)}
                onOpenPreview={openFullPreview}
                onSuggestion={handleSuggestion}
                onGoSection={(key) =>
                  setSection(key as PortfolioEditorSection)
                }
              />
            ) : (
              <PortfolioEditor
                section={section}
                data={data}
                onChange={patchData}
                onReplace={replaceData}
                onOpenPreview={openFullPreview}
                onPublish={handlePublish}
                publishing={publishing}
              />
            )}
          </div>
        </div>

        {/* Live preview */}
        <div
          className={cn(
            "xl:col-span-7 xl:sticky xl:top-24",
            !showPreview && "hidden xl:block"
          )}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                Live Preview
              </span>
              <Badge variant="secondary" className="text-[10px]">
                updates instantly
              </Badge>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
              {(
                [
                  { id: "desktop" as const, label: "Desktop", Icon: Monitor },
                  { id: "tablet" as const, label: "Tablet", Icon: Tablet },
                  { id: "mobile" as const, label: "Mobile", Icon: Smartphone },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPreviewDevice(id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
                    previewDevice === id
                      ? "bg-slate-900 text-white"
                      : "text-slate-500"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-all",
              deviceWidth
            )}
          >
            <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-3 truncate font-mono text-xs text-slate-500">
                {data.customDomain ||
                  `devlaunch.ai/p/${data.slug || "portfolio"}`}
              </span>
            </div>
            <div className="h-[min(72vh,780px)] overflow-y-auto bg-white">
              <PortfolioSite data={data} preview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
