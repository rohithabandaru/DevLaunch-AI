"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Download,
  Rocket,
  ExternalLink,
  FolderArchive,
  Globe,
  FileJson,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Field from "@/components/portfolio/editor/Field";
import SectionShell from "@/components/portfolio/editor/SectionShell";
import {
  DEFAULT_SECTION_ORDER,
  PORTFOLIO_FONTS,
  PORTFOLIO_TEMPLATES,
  SKILL_CATEGORIES,
  createEmptyAchievement,
  createEmptyBlogPost,
  createEmptyCertification,
  createEmptyHobby,
  createEmptyLanguage,
  createEmptyProject,
  createEmptyService,
  createEmptySkill,
  createEmptyTestimonial,
  createEmptyTimeline,
  parseTechInput,
  slugify,
} from "@/lib/portfolio";
import {
  generateAboutLocal,
  generateFullPortfolioLocal,
  generateProjectDescriptionLocal,
  generateSkillsSummaryLocal,
  runLocalAiAction,
} from "@/lib/portfolio-ai";
import {
  deployToVercel,
  downloadPortfolioJson,
  downloadPortfolioPdfSummary,
  downloadPortfolioZip,
  downloadStaticPortfolio,
} from "@/lib/portfolio-export";
import type {
  PortfolioAiAction,
  PortfolioData,
  PortfolioEditorSection,
  PortfolioFontId,
  PortfolioProject,
  PortfolioSectionKey,
  PortfolioTemplateId,
  SkillCategory,
} from "@/types/portfolio";
import { cn } from "@/lib/utils";

type Props = {
  section: PortfolioEditorSection;
  data: PortfolioData;
  onChange: (patch: Partial<PortfolioData>) => void;
  onReplace?: (data: PortfolioData) => void;
  onOpenPreview?: () => void;
  onPublish?: () => void;
  publishing?: boolean;
};

export default function PortfolioEditor({
  section,
  data,
  onChange,
  onReplace,
  onOpenPreview,
  onPublish,
  publishing,
}: Props) {
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiText, setAiText] = useState("");

  async function runAi(
    action: PortfolioAiAction,
    extra?: { projectId?: string; text?: string }
  ) {
    setAiError(null);
    setAiLoading(action + (extra?.projectId ?? ""));
    try {
      const res = await fetch("/api/ai/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          portfolio: data,
          projectId: extra?.projectId,
          text: extra?.text,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        applyAiResult(action, json, extra?.projectId);
        if (json.demo) {
          setAiError("Using local AI draft (sign in for cloud AI).");
        }
        return;
      }

      const local = runLocalAiAction(action, data, {
        projectId: extra?.projectId,
        text: extra?.text,
      });
      applyAiResult(action, local, extra?.projectId);
      setAiError("Using local AI draft.");
    } catch {
      const local = runLocalAiAction(action, data, {
        projectId: extra?.projectId,
        text: extra?.text,
      });
      applyAiResult(action, local, extra?.projectId);
      setAiError("Using local AI draft (network unavailable).");
    } finally {
      setAiLoading(null);
    }
  }

  function applyAiResult(
    action: PortfolioAiAction,
    json: Record<string, unknown>,
    projectId?: string
  ) {
    if (action === "about") {
      onChange({
        biography: (json.biography as string) ?? data.biography,
        careerObjective:
          (json.careerObjective as string) ?? data.careerObjective,
        introduction: (json.introduction as string) ?? data.introduction,
        professionalSummary:
          (json.professionalSummary as string) ?? data.professionalSummary,
      });
    } else if (action === "bio") {
      onChange({
        professionalSummary: (json.bio as string) ?? data.professionalSummary,
      });
    } else if (action === "skills_summary") {
      onChange({
        skillsSummary: (json.skillsSummary as string) ?? data.skillsSummary,
      });
    } else if (action === "project" && projectId) {
      onChange({
        projects: data.projects.map((p) =>
          p.id === projectId
            ? { ...p, description: (json.description as string) ?? p.description }
            : p
        ),
      });
    } else if (action === "full_portfolio" && json.portfolio) {
      onReplace?.(json.portfolio as PortfolioData);
    } else if (action === "hero_headline") {
      onChange({
        heroHeadline: (json.heroHeadline as string) ?? data.heroHeadline,
        tagline: (json.tagline as string) ?? data.tagline,
        introduction: (json.introduction as string) ?? data.introduction,
      });
    } else if (action === "cta") {
      onChange({
        heroCtaLabel: (json.heroCtaLabel as string) ?? data.heroCtaLabel,
      });
    } else if (action === "seo") {
      onChange({
        seoTitle: (json.seoTitle as string) ?? data.seoTitle,
        seoDescription: (json.seoDescription as string) ?? data.seoDescription,
      });
    } else if (
      action === "improve" ||
      action === "rewrite" ||
      action === "fix_grammar"
    ) {
      const text = (json.text as string) ?? "";
      setAiText(text);
      onChange({ biography: text || data.biography });
    }
  }

  /* ───────────── Personal ───────────── */
  if (section === "personal") {
    return (
      <SectionShell
        title="Personal Information"
        description="Core identity fields used across hero, contact, and SEO."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="fullName" className="sm:col-span-2">
            <Input
              id="fullName"
              className="h-10 bg-white"
              value={data.fullName}
              onChange={(e) => {
                const fullName = e.target.value;
                onChange({
                  fullName,
                  slug:
                    data.slug === "my-portfolio" || !data.slug
                      ? slugify(fullName)
                      : data.slug,
                });
              }}
              placeholder="Alex Chen"
            />
          </Field>
          <Field label="Professional title" htmlFor="title" className="sm:col-span-2">
            <Input
              id="title"
              className="h-10 bg-white"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Full Stack Engineer"
            />
          </Field>
          <Field label="Short bio" htmlFor="tagline" className="sm:col-span-2">
            <Textarea
              id="tagline"
              className="min-h-20 bg-white"
              value={data.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="One-line professional bio"
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              className="h-10 bg-white"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="you@email.com"
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              className="h-10 bg-white"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+1 …"
            />
          </Field>
          <Field label="Location" htmlFor="location" className="sm:col-span-2">
            <Input
              id="location"
              className="h-10 bg-white"
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="City, Country"
            />
          </Field>
        </div>
      </SectionShell>
    );
  }

  /* ───────────── Hero ───────────── */
  if (section === "hero") {
    return (
      <SectionShell
        title="Hero Section"
        description="Name, tagline, CTAs, resume, and imagery."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={aiLoading === "hero_headline"}
            onClick={() => runAi("hero_headline")}
          >
            {aiLoading === "hero_headline" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI Headline
          </Button>
        }
      >
        {aiError && <p className="text-xs text-amber-600">{aiError}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="heroName" className="sm:col-span-2">
            <Input
              id="heroName"
              className="h-10 bg-white"
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
            />
          </Field>
          <Field label="Hero headline" htmlFor="headline" className="sm:col-span-2">
            <Input
              id="headline"
              className="h-10 bg-white"
              value={data.heroHeadline}
              onChange={(e) => onChange({ heroHeadline: e.target.value })}
              placeholder="I build products people love."
            />
          </Field>
          <Field label="Tagline" htmlFor="heroTag" className="sm:col-span-2">
            <Input
              id="heroTag"
              className="h-10 bg-white"
              value={data.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
            />
          </Field>
          <Field label="Introduction" htmlFor="intro" className="sm:col-span-2">
            <Textarea
              id="intro"
              className="min-h-24 bg-white"
              value={data.introduction}
              onChange={(e) => onChange({ introduction: e.target.value })}
            />
          </Field>
          <Field label="CTA button label" htmlFor="cta">
            <div className="flex gap-2">
              <Input
                id="cta"
                className="h-10 bg-white"
                value={data.heroCtaLabel}
                onChange={(e) => onChange({ heroCtaLabel: e.target.value })}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-10 shrink-0"
                disabled={aiLoading === "cta"}
                onClick={() => runAi("cta")}
              >
                {aiLoading === "cta" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </Field>
          <Field label="Resume download URL" htmlFor="resume">
            <Input
              id="resume"
              className="h-10 bg-white"
              value={data.resumeUrl}
              onChange={(e) => onChange({ resumeUrl: e.target.value })}
              placeholder="https://…/resume.pdf"
            />
          </Field>
          <Field label="Profile / hero image URL" htmlFor="heroImg" className="sm:col-span-2">
            <Input
              id="heroImg"
              className="h-10 bg-white"
              value={data.heroImage || data.profilePhoto}
              onChange={(e) =>
                onChange({
                  heroImage: e.target.value,
                  profilePhoto: e.target.value,
                })
              }
              placeholder="https://…"
            />
          </Field>
          <Field label="Background image URL" htmlFor="bgImg" className="sm:col-span-2">
            <Input
              id="bgImg"
              className="h-10 bg-white"
              value={data.backgroundImage}
              onChange={(e) => onChange({ backgroundImage: e.target.value })}
              placeholder="https://… (optional)"
            />
          </Field>
        </div>
      </SectionShell>
    );
  }

  /* ───────────── About ───────────── */
  if (section === "about") {
    return (
      <SectionShell
        title="About Me"
        description="Biography, career objective, and professional summary."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={aiLoading === "about"}
            onClick={() => runAi("about")}
          >
            {aiLoading === "about" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI About Me
          </Button>
        }
      >
        {aiError && <p className="text-xs text-amber-600">{aiError}</p>}
        <Field label="Years of experience" htmlFor="years">
          <Input
            id="years"
            className="h-10 bg-white"
            value={data.yearsExperience}
            onChange={(e) => onChange({ yearsExperience: e.target.value })}
            placeholder="5+"
          />
        </Field>
        <Field label="Professional summary" htmlFor="summary">
          <Textarea
            id="summary"
            className="min-h-20 bg-white"
            value={data.professionalSummary}
            onChange={(e) => onChange({ professionalSummary: e.target.value })}
          />
        </Field>
        <Field label="Biography" htmlFor="bio">
          <Textarea
            id="bio"
            className="min-h-32 bg-white"
            value={data.biography}
            onChange={(e) => onChange({ biography: e.target.value })}
          />
        </Field>
        <Field label="Career objective" htmlFor="objective">
          <Textarea
            id="objective"
            className="min-h-20 bg-white"
            value={data.careerObjective}
            onChange={(e) => onChange({ careerObjective: e.target.value })}
          />
        </Field>
      </SectionShell>
    );
  }

  /* ───────────── Skills ───────────── */
  if (section === "skills") {
    return (
      <SectionShell
        title="Skills"
        description="Frontend, Backend, Database, Cloud, DevOps, Languages, Tools, Soft Skills."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={aiLoading === "skills_summary"}
            onClick={() => runAi("skills_summary")}
          >
            {aiLoading === "skills_summary" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI summary
          </Button>
        }
      >
        {aiError && <p className="text-xs text-amber-600">{aiError}</p>}
        <Field label="Skills summary" htmlFor="skillsSummary">
          <Textarea
            id="skillsSummary"
            className="min-h-20 bg-white"
            value={data.skillsSummary}
            onChange={(e) => onChange({ skillsSummary: e.target.value })}
          />
        </Field>
        {SKILL_CATEGORIES.map((cat) => {
          const items = data.skills.filter((s) => s.category === cat.id);
          return (
            <div
              key={cat.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1"
                  onClick={() =>
                    onChange({
                      skills: [
                        ...data.skills,
                        createEmptySkill(cat.id as SkillCategory),
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-slate-400">No skills yet.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((skill) => (
                    <div
                      key={skill.id}
                      className="grid grid-cols-[1fr_70px_auto] items-center gap-2"
                    >
                      <Input
                        className="h-9 bg-white"
                        value={skill.name}
                        placeholder="Skill name"
                        onChange={(e) =>
                          onChange({
                            skills: data.skills.map((s) =>
                              s.id === skill.id
                                ? { ...s, name: e.target.value }
                                : s
                            ),
                          })
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="h-9 bg-white"
                        value={skill.level}
                        onChange={(e) =>
                          onChange({
                            skills: data.skills.map((s) =>
                              s.id === skill.id
                                ? {
                                    ...s,
                                    level: Math.min(
                                      100,
                                      Math.max(0, Number(e.target.value) || 0)
                                    ),
                                  }
                                : s
                            ),
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-rose-600"
                        onClick={() =>
                          onChange({
                            skills: data.skills.filter((s) => s.id !== skill.id),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </SectionShell>
    );
  }

  /* ───────────── Projects ───────────── */
  if (section === "projects") {
    return (
      <SectionShell
        title="Projects"
        description="Unlimited projects with tech, links, features, challenges, and achievements."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              onChange({ projects: [...data.projects, createEmptyProject()] })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add project
          </Button>
        }
      >
        {aiError && <p className="text-xs text-amber-600">{aiError}</p>}
        <div className="space-y-5">
          {data.projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              index={index}
              project={project}
              aiLoading={aiLoading === `project${project.id}`}
              onAi={() => runAi("project", { projectId: project.id })}
              onChange={(patch) =>
                onChange({
                  projects: data.projects.map((p) =>
                    p.id === project.id ? { ...p, ...patch } : p
                  ),
                })
              }
              onRemove={() => {
                if (data.projects.length <= 1) {
                  onChange({ projects: [createEmptyProject()] });
                  return;
                }
                onChange({
                  projects: data.projects.filter((p) => p.id !== project.id),
                });
              }}
            />
          ))}
        </div>
      </SectionShell>
    );
  }

  /* ───────────── Experience ───────────── */
  if (section === "experience") {
    const items = data.experience;
    return (
      <SectionShell
        title="Experience"
        description="Company, position, employment type, dates, description, technologies."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              onChange({ experience: [...items, createEmptyTimeline()] })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        }
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Role {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-600"
                  onClick={() => {
                    if (items.length <= 1) {
                      onChange({ experience: [createEmptyTimeline()] });
                      return;
                    }
                    onChange({
                      experience: items.filter((i) => i.id !== item.id),
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Position">
                  <Input
                    className="h-10 bg-white"
                    value={item.title}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? { ...i, title: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Company">
                  <Input
                    className="h-10 bg-white"
                    value={item.organization}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? { ...i, organization: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Employment type">
                  <Input
                    className="h-10 bg-white"
                    value={item.employmentType || ""}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? { ...i, employmentType: e.target.value }
                            : i
                        ),
                      })
                    }
                    placeholder="Full-time / Contract / Internship"
                  />
                </Field>
                <Field label="Location">
                  <Input
                    className="h-10 bg-white"
                    value={item.location}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? { ...i, location: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Start date">
                  <Input
                    className="h-10 bg-white"
                    value={item.startDate}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? { ...i, startDate: e.target.value }
                            : i
                        ),
                      })
                    }
                    placeholder="2022"
                  />
                </Field>
                <Field label="End date">
                  <Input
                    className="h-10 bg-white"
                    value={item.current ? "Present" : item.endDate}
                    disabled={item.current}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? { ...i, endDate: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? {
                                ...i,
                                current: e.target.checked,
                                endDate: e.target.checked ? "" : i.endDate,
                              }
                            : i
                        ),
                      })
                    }
                  />
                  Currently working
                </label>
                <Field label="Description" className="sm:col-span-2">
                  <Textarea
                    className="min-h-20 bg-white"
                    value={item.description}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? { ...i, description: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Technologies used" className="sm:col-span-2">
                  <Input
                    className="h-10 bg-white"
                    value={(item.technologies || []).join(", ")}
                    onChange={(e) =>
                      onChange({
                        experience: items.map((i) =>
                          i.id === item.id
                            ? {
                                ...i,
                                technologies: parseTechInput(e.target.value),
                              }
                            : i
                        ),
                      })
                    }
                    placeholder="React, Node.js, AWS"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  /* ───────────── Education ───────────── */
  if (section === "education") {
    const items = data.education;
    return (
      <SectionShell
        title="Education"
        description="Degree, college, university, CGPA, years, location."
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              onChange({ education: [...items, createEmptyTimeline()] })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        }
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Education {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-600"
                  onClick={() => {
                    if (items.length <= 1) {
                      onChange({ education: [createEmptyTimeline()] });
                      return;
                    }
                    onChange({
                      education: items.filter((i) => i.id !== item.id),
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Degree">
                  <Input
                    className="h-10 bg-white"
                    value={item.title}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? { ...i, title: e.target.value }
                            : i
                        ),
                      })
                    }
                    placeholder="B.S. Computer Science"
                  />
                </Field>
                <Field label="College">
                  <Input
                    className="h-10 bg-white"
                    value={item.college || ""}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? { ...i, college: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="University">
                  <Input
                    className="h-10 bg-white"
                    value={item.university || item.organization}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? {
                                ...i,
                                university: e.target.value,
                                organization: e.target.value,
                              }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="CGPA">
                  <Input
                    className="h-10 bg-white"
                    value={item.cgpa || ""}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? { ...i, cgpa: e.target.value }
                            : i
                        ),
                      })
                    }
                    placeholder="3.8"
                  />
                </Field>
                <Field label="Start year">
                  <Input
                    className="h-10 bg-white"
                    value={item.startDate}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? { ...i, startDate: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="End year">
                  <Input
                    className="h-10 bg-white"
                    value={item.endDate}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? { ...i, endDate: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Location" className="sm:col-span-2">
                  <Input
                    className="h-10 bg-white"
                    value={item.location}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? { ...i, location: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Notes" className="sm:col-span-2">
                  <Textarea
                    className="min-h-16 bg-white"
                    value={item.description}
                    onChange={(e) =>
                      onChange({
                        education: items.map((i) =>
                          i.id === item.id
                            ? { ...i, description: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  /* ───────────── Certifications ───────────── */
  if (section === "certifications") {
    return (
      <ListSection
        title="Certifications"
        description="Support multiple professional certifications."
        empty="No certifications yet."
        onAdd={() =>
          onChange({
            certifications: [
              ...data.certifications,
              createEmptyCertification(),
            ],
          })
        }
      >
        {data.certifications.map((c) => (
          <div
            key={c.id}
            className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-2"
          >
            <Input
              className="h-9 bg-white"
              placeholder="Name"
              value={c.name}
              onChange={(e) =>
                onChange({
                  certifications: data.certifications.map((x) =>
                    x.id === c.id ? { ...x, name: e.target.value } : x
                  ),
                })
              }
            />
            <Input
              className="h-9 bg-white"
              placeholder="Issuer"
              value={c.issuer}
              onChange={(e) =>
                onChange({
                  certifications: data.certifications.map((x) =>
                    x.id === c.id ? { ...x, issuer: e.target.value } : x
                  ),
                })
              }
            />
            <Input
              className="h-9 bg-white"
              placeholder="Date"
              value={c.date}
              onChange={(e) =>
                onChange({
                  certifications: data.certifications.map((x) =>
                    x.id === c.id ? { ...x, date: e.target.value } : x
                  ),
                })
              }
            />
            <div className="flex gap-2">
              <Input
                className="h-9 bg-white"
                placeholder="Credential URL"
                value={c.credentialUrl}
                onChange={(e) =>
                  onChange({
                    certifications: data.certifications.map((x) =>
                      x.id === c.id
                        ? { ...x, credentialUrl: e.target.value }
                        : x
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={() =>
                  onChange({
                    certifications: data.certifications.filter(
                      (x) => x.id !== c.id
                    ),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </ListSection>
    );
  }

  /* ───────────── Achievements ───────────── */
  if (section === "achievements") {
    return (
      <ListSection
        title="Achievements"
        description="Awards, hackathons, and career highlights."
        empty="No achievements yet."
        onAdd={() =>
          onChange({
            achievements: [...data.achievements, createEmptyAchievement()],
          })
        }
      >
        {data.achievements.map((a) => (
          <div
            key={a.id}
            className="space-y-2 rounded-xl border border-slate-200 p-3"
          >
            <div className="flex gap-2">
              <Input
                className="h-9 bg-white"
                placeholder="Title"
                value={a.title}
                onChange={(e) =>
                  onChange({
                    achievements: data.achievements.map((x) =>
                      x.id === a.id ? { ...x, title: e.target.value } : x
                    ),
                  })
                }
              />
              <Input
                className="h-9 w-24 bg-white"
                placeholder="Year"
                value={a.year}
                onChange={(e) =>
                  onChange({
                    achievements: data.achievements.map((x) =>
                      x.id === a.id ? { ...x, year: e.target.value } : x
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={() =>
                  onChange({
                    achievements: data.achievements.filter((x) => x.id !== a.id),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              className="min-h-16 bg-white"
              placeholder="Description"
              value={a.description}
              onChange={(e) =>
                onChange({
                  achievements: data.achievements.map((x) =>
                    x.id === a.id ? { ...x, description: e.target.value } : x
                  ),
                })
              }
            />
          </div>
        ))}
      </ListSection>
    );
  }

  /* ───────────── Languages ───────────── */
  if (section === "languages") {
    return (
      <ListSection
        title="Languages"
        description="Spoken languages and proficiency levels."
        empty="No languages yet."
        onAdd={() =>
          onChange({ languages: [...data.languages, createEmptyLanguage()] })
        }
      >
        {data.languages.map((l) => (
          <div key={l.id} className="flex gap-2">
            <Input
              className="h-9 bg-white"
              placeholder="Language"
              value={l.name}
              onChange={(e) =>
                onChange({
                  languages: data.languages.map((x) =>
                    x.id === l.id ? { ...x, name: e.target.value } : x
                  ),
                })
              }
            />
            <Input
              className="h-9 bg-white"
              placeholder="Proficiency"
              value={l.proficiency}
              onChange={(e) =>
                onChange({
                  languages: data.languages.map((x) =>
                    x.id === l.id ? { ...x, proficiency: e.target.value } : x
                  ),
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-rose-600"
              onClick={() =>
                onChange({
                  languages: data.languages.filter((x) => x.id !== l.id),
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ListSection>
    );
  }

  /* ───────────── Hobbies ───────────── */
  if (section === "hobbies") {
    return (
      <ListSection
        title="Hobbies"
        description="Interests that humanize your portfolio."
        empty="No hobbies yet."
        onAdd={() =>
          onChange({ hobbies: [...data.hobbies, createEmptyHobby()] })
        }
      >
        {data.hobbies.map((h) => (
          <div key={h.id} className="flex gap-2">
            <Input
              className="h-9 bg-white"
              placeholder="Hobby"
              value={h.name}
              onChange={(e) =>
                onChange({
                  hobbies: data.hobbies.map((x) =>
                    x.id === h.id ? { ...x, name: e.target.value } : x
                  ),
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-rose-600"
              onClick={() =>
                onChange({
                  hobbies: data.hobbies.filter((x) => x.id !== h.id),
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ListSection>
    );
  }

  /* ───────────── Services ───────────── */
  if (section === "services") {
    return (
      <SectionShell
        title="Services"
        description="List services you provide as a freelancer or consultant."
        action={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Show section</span>
            <Switch
              checked={data.sectionVisibility.services}
              onCheckedChange={(checked) =>
                onChange({
                  showServices: Boolean(checked),
                  sectionVisibility: {
                    ...data.sectionVisibility,
                    services: Boolean(checked),
                  },
                })
              }
            />
          </div>
        }
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() =>
            onChange({ services: [...data.services, createEmptyService()] })
          }
        >
          <Plus className="h-3.5 w-3.5" /> Add service
        </Button>
        {data.services.map((s) => (
          <div
            key={s.id}
            className="space-y-2 rounded-xl border border-slate-200 p-3"
          >
            <div className="flex gap-2">
              <Input
                className="h-9 bg-white"
                placeholder="Service title"
                value={s.title}
                onChange={(e) =>
                  onChange({
                    services: data.services.map((x) =>
                      x.id === s.id ? { ...x, title: e.target.value } : x
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={() =>
                  onChange({
                    services: data.services.filter((x) => x.id !== s.id),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              className="min-h-16 bg-white"
              placeholder="Description"
              value={s.description}
              onChange={(e) =>
                onChange({
                  services: data.services.map((x) =>
                    x.id === s.id ? { ...x, description: e.target.value } : x
                  ),
                })
              }
            />
          </div>
        ))}
      </SectionShell>
    );
  }

  /* ───────────── Testimonials ───────────── */
  if (section === "testimonials") {
    return (
      <ListSection
        title="Testimonials"
        description="Quotes from clients, managers, or teammates."
        empty="No testimonials yet."
        onAdd={() =>
          onChange({
            testimonials: [...data.testimonials, createEmptyTestimonial()],
          })
        }
      >
        {data.testimonials.map((t) => (
          <div
            key={t.id}
            className="space-y-2 rounded-xl border border-slate-200 p-3"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                className="h-9 bg-white"
                placeholder="Name"
                value={t.name}
                onChange={(e) =>
                  onChange({
                    testimonials: data.testimonials.map((x) =>
                      x.id === t.id ? { ...x, name: e.target.value } : x
                    ),
                  })
                }
              />
              <Input
                className="h-9 bg-white"
                placeholder="Role"
                value={t.role}
                onChange={(e) =>
                  onChange({
                    testimonials: data.testimonials.map((x) =>
                      x.id === t.id ? { ...x, role: e.target.value } : x
                    ),
                  })
                }
              />
              <div className="flex gap-2">
                <Input
                  className="h-9 bg-white"
                  placeholder="Company"
                  value={t.company}
                  onChange={(e) =>
                    onChange({
                      testimonials: data.testimonials.map((x) =>
                        x.id === t.id ? { ...x, company: e.target.value } : x
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-rose-600"
                  onClick={() =>
                    onChange({
                      testimonials: data.testimonials.filter(
                        (x) => x.id !== t.id
                      ),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              className="min-h-16 bg-white"
              placeholder="Quote"
              value={t.quote}
              onChange={(e) =>
                onChange({
                  testimonials: data.testimonials.map((x) =>
                    x.id === t.id ? { ...x, quote: e.target.value } : x
                  ),
                })
              }
            />
          </div>
        ))}
      </ListSection>
    );
  }

  /* ───────────── Blog ───────────── */
  if (section === "blog") {
    return (
      <SectionShell
        title="Blog (Optional)"
        description="Link to writing and technical posts."
        action={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Show section</span>
            <Switch
              checked={data.sectionVisibility.blog}
              onCheckedChange={(checked) =>
                onChange({
                  showBlog: Boolean(checked),
                  sectionVisibility: {
                    ...data.sectionVisibility,
                    blog: Boolean(checked),
                  },
                })
              }
            />
          </div>
        }
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() =>
            onChange({ blogPosts: [...data.blogPosts, createEmptyBlogPost()] })
          }
        >
          <Plus className="h-3.5 w-3.5" /> Add post
        </Button>
        {data.blogPosts.map((b) => (
          <div
            key={b.id}
            className="space-y-2 rounded-xl border border-slate-200 p-3"
          >
            <div className="flex gap-2">
              <Input
                className="h-9 bg-white"
                placeholder="Title"
                value={b.title}
                onChange={(e) =>
                  onChange({
                    blogPosts: data.blogPosts.map((x) =>
                      x.id === b.id ? { ...x, title: e.target.value } : x
                    ),
                  })
                }
              />
              <Input
                className="h-9 w-28 bg-white"
                placeholder="Date"
                value={b.date}
                onChange={(e) =>
                  onChange({
                    blogPosts: data.blogPosts.map((x) =>
                      x.id === b.id ? { ...x, date: e.target.value } : x
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-rose-600"
                onClick={() =>
                  onChange({
                    blogPosts: data.blogPosts.filter((x) => x.id !== b.id),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              className="h-9 bg-white"
              placeholder="URL"
              value={b.url}
              onChange={(e) =>
                onChange({
                  blogPosts: data.blogPosts.map((x) =>
                    x.id === b.id ? { ...x, url: e.target.value } : x
                  ),
                })
              }
            />
            <Textarea
              className="min-h-16 bg-white"
              placeholder="Excerpt"
              value={b.excerpt}
              onChange={(e) =>
                onChange({
                  blogPosts: data.blogPosts.map((x) =>
                    x.id === b.id ? { ...x, excerpt: e.target.value } : x
                  ),
                })
              }
            />
          </div>
        ))}
      </SectionShell>
    );
  }

  /* ───────────── Contact ───────────── */
  if (section === "contact") {
    return (
      <SectionShell
        title="Contact Section"
        description="Contact form, Google Maps, and social links."
      >
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Switch
              checked={data.showContactForm}
              onCheckedChange={(c) =>
                onChange({ showContactForm: Boolean(c) })
              }
            />
            Contact form
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Switch
              checked={data.showMaps}
              onCheckedChange={(c) => onChange({ showMaps: Boolean(c) })}
            />
            Google Maps
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["email", "Email", "you@email.com"],
              ["phone", "Phone", "+1 …"],
              ["location", "Location", "City, Country"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <Field key={key} label={label} htmlFor={key}>
              <Input
                id={key}
                className="h-10 bg-white"
                value={data[key]}
                placeholder={placeholder}
                onChange={(e) => onChange({ [key]: e.target.value })}
              />
            </Field>
          ))}
          <Field
            label="Google Maps embed URL"
            htmlFor="maps"
            className="sm:col-span-2"
            hint="Paste an iframe src from Google Maps → Share → Embed."
          >
            <Input
              id="maps"
              className="h-10 bg-white"
              value={data.mapsEmbedUrl}
              onChange={(e) => onChange({ mapsEmbedUrl: e.target.value })}
              placeholder="https://www.google.com/maps/embed?…"
            />
          </Field>
        </div>
        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Social links
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["linkedin", "LinkedIn"],
              ["github", "GitHub"],
              ["portfolioUrl", "Portfolio website"],
              ["twitter", "Twitter / X"],
              ["instagram", "Instagram"],
              ["youtube", "YouTube"],
              ["medium", "Medium"],
              ["devto", "Dev.to"],
              ["leetcode", "LeetCode"],
              ["hackerrank", "HackerRank"],
              ["dribbble", "Dribbble"],
              ["footerTagline", "Footer tagline"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label} htmlFor={key}>
              <Input
                id={key}
                className="h-10 bg-white"
                value={data[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </SectionShell>
    );
  }

  /* ───────────── Design ───────────── */
  if (section === "design") {
    const accents = [
      "#4f46e5",
      "#7c3aed",
      "#0ea5e9",
      "#059669",
      "#e11d48",
      "#ea580c",
      "#0891b2",
      "#111827",
    ];
    const secondaries = [
      "#a855f7",
      "#ec4899",
      "#06b6d4",
      "#f59e0b",
      "#10b981",
      "#6366f1",
    ];

    return (
      <SectionShell
        title="Customization"
        description="Themes, colors, fonts, dark mode, animations, spacing, section order & visibility."
      >
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Themes</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange({ template: t.id })}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  data.template === t.id
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div
                  className={cn(
                    "mb-2 h-8 rounded-lg bg-gradient-to-r",
                    t.preview
                  )}
                />
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="mt-1 text-xs text-slate-500">{t.blurb}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Dark mode</span>
            <Switch
              checked={data.themeMode === "dark"}
              onCheckedChange={(checked) =>
                onChange({ themeMode: checked ? "dark" : "light" })
              }
            />
            <Badge variant="secondary">
              {data.themeMode === "dark" ? "Dark" : "Light"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              Animations
            </span>
            <Switch
              checked={data.animationsEnabled !== false}
              onCheckedChange={(checked) =>
                onChange({ animationsEnabled: Boolean(checked) })
              }
            />
          </div>
        </div>

        <Field label="Primary color" htmlFor="accent">
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="accent"
              type="color"
              value={data.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
            />
            <Input
              className="h-10 w-28 bg-white font-mono text-xs"
              value={data.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
            />
            {accents.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ accentColor: c })}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition",
                  data.accentColor === c
                    ? "scale-110 border-slate-900"
                    : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Field>

        <Field label="Secondary color" htmlFor="secondary">
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="secondary"
              type="color"
              value={data.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
            />
            <Input
              className="h-10 w-28 bg-white font-mono text-xs"
              value={data.secondaryColor}
              onChange={(e) => onChange({ secondaryColor: e.target.value })}
            />
            {secondaries.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ secondaryColor: c })}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition",
                  data.secondaryColor === c
                    ? "scale-110 border-slate-900"
                    : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Fonts</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PORTFOLIO_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  onChange({ fontFamily: f.id as PortfolioFontId })
                }
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm transition",
                  data.fontFamily === f.id
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
                style={{ fontFamily: f.stack }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Spacing</p>
          <div className="flex flex-wrap gap-2">
            {(["compact", "comfortable", "spacious"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ spacing: s })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize",
                  data.spacing === s
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Show / hide sections
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(data.sectionOrder.length
              ? data.sectionOrder
              : DEFAULT_SECTION_ORDER
            ).map((key) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm capitalize"
              >
                {key}
                <Switch
                  checked={data.sectionVisibility[key] !== false}
                  onCheckedChange={(checked) =>
                    onChange({
                      sectionVisibility: {
                        ...data.sectionVisibility,
                        [key]: Boolean(checked),
                      },
                      ...(key === "services"
                        ? { showServices: Boolean(checked) }
                        : {}),
                      ...(key === "blog"
                        ? { showBlog: Boolean(checked) }
                        : {}),
                    })
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Section order
          </p>
          <p className="mb-2 text-xs text-slate-400">
            Move sections up or down for the live site.
          </p>
          <div className="space-y-1">
            {(data.sectionOrder.length
              ? data.sectionOrder
              : DEFAULT_SECTION_ORDER
            ).map((key, idx, arr) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm capitalize"
              >
                <span>{key}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...arr];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      onChange({
                        sectionOrder: next as PortfolioSectionKey[],
                      });
                    }}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={idx === arr.length - 1}
                    onClick={() => {
                      const next = [...arr];
                      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                      onChange({
                        sectionOrder: next as PortfolioSectionKey[],
                      });
                    }}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Field label="SEO title" htmlFor="seoTitle">
          <div className="flex gap-2">
            <Input
              id="seoTitle"
              className="h-10 bg-white"
              value={data.seoTitle}
              onChange={(e) => onChange({ seoTitle: e.target.value })}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-10 shrink-0 gap-1"
              disabled={aiLoading === "seo"}
              onClick={() => runAi("seo")}
            >
              {aiLoading === "seo" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              AI SEO
            </Button>
          </div>
        </Field>
        <Field label="SEO meta description" htmlFor="seoDesc">
          <Textarea
            id="seoDesc"
            className="min-h-20 bg-white"
            value={data.seoDescription}
            onChange={(e) => onChange({ seoDescription: e.target.value })}
          />
        </Field>
      </SectionShell>
    );
  }

  /* ───────────── AI Studio ───────────── */
  if (section === "ai") {
    const tools: {
      action: PortfolioAiAction;
      label: string;
      blurb: string;
    }[] = [
      {
        action: "bio",
        label: "Generate Professional Bio",
        blurb: "Short professional summary",
      },
      {
        action: "about",
        label: "Generate About Me",
        blurb: "Full biography + objective",
      },
      {
        action: "skills_summary",
        label: "Generate Skills Summary",
        blurb: "Narrative over your stack",
      },
      {
        action: "hero_headline",
        label: "Generate Hero Headline",
        blurb: "Headline + tagline + intro",
      },
      {
        action: "cta",
        label: "Generate Call-To-Action",
        blurb: "CTA button label",
      },
      {
        action: "seo",
        label: "Generate SEO Meta Description",
        blurb: "Title + meta description",
      },
      {
        action: "improve",
        label: "Improve Portfolio Content",
        blurb: "Polish existing bio",
      },
      {
        action: "rewrite",
        label: "Rewrite Content",
        blurb: "Fresh rewrite of bio",
      },
      {
        action: "fix_grammar",
        label: "Fix Grammar",
        blurb: "Grammar & punctuation only",
      },
      {
        action: "full_portfolio",
        label: "Generate Full Portfolio",
        blurb: "Starter content for all sections",
      },
    ];

    return (
      <SectionShell
        title="AI Studio"
        description="Generate, improve, rewrite, and SEO-optimize portfolio copy."
      >
        {aiError && <p className="text-xs text-amber-600">{aiError}</p>}
        <Field
          label="Text to improve / rewrite (optional)"
          htmlFor="aiText"
          hint="Used by Improve, Rewrite, and Fix Grammar. Defaults to your biography."
        >
          <Textarea
            id="aiText"
            className="min-h-24 bg-white"
            value={aiText || data.biography}
            onChange={(e) => setAiText(e.target.value)}
          />
        </Field>
        <div className="grid gap-2 sm:grid-cols-2">
          {tools.map((t) => (
            <Button
              key={t.action}
              type="button"
              variant="outline"
              className="h-auto flex-col items-start gap-0.5 px-3 py-3 text-left"
              disabled={!!aiLoading}
              onClick={() =>
                runAi(t.action, {
                  text: aiText || data.biography,
                })
              }
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                {aiLoading === t.action ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                )}
                {t.label}
              </span>
              <span className="text-xs font-normal text-slate-500">
                {t.blurb}
              </span>
            </Button>
          ))}
        </div>
      </SectionShell>
    );
  }

  /* ───────────── Deploy / Publish ───────────── */
  return (
    <SectionShell
      title="Publish & Export"
      description="Public URL at devlaunch.ai/p/username · HTML, ZIP, JSON, PDF."
    >
      <Field
        label="Portfolio slug (username)"
        htmlFor="slug"
        hint="Public URL: /p/your-slug"
      >
        <Input
          id="slug"
          className="h-10 bg-white font-mono"
          value={data.slug}
          onChange={(e) => onChange({ slug: slugify(e.target.value) })}
        />
      </Field>
      <Field label="Custom domain" htmlFor="domain">
        <Input
          id="domain"
          className="h-10 bg-white"
          value={data.customDomain}
          onChange={(e) => onChange({ customDomain: e.target.value })}
          placeholder="alexchen.dev"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          className="h-11 gap-2 bg-indigo-600 hover:bg-indigo-700"
          disabled={publishing}
          onClick={() => onPublish?.()}
        >
          {publishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          {data.published ? "Republish" : "Publish"}
        </Button>
        <Button
          type="button"
          className="h-11 gap-2 bg-slate-900 hover:bg-slate-800"
          onClick={() => deployToVercel(data)}
        >
          <Globe className="h-4 w-4" />
          Deploy to Vercel
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2"
          onClick={() => downloadStaticPortfolio(data)}
        >
          <FileText className="h-4 w-4" />
          Export HTML
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2"
          onClick={() => downloadPortfolioZip(data)}
        >
          <FolderArchive className="h-4 w-4" />
          Export ZIP
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2"
          onClick={() => downloadPortfolioJson(data)}
        >
          <FileJson className="h-4 w-4" />
          Export JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2"
          onClick={() => downloadPortfolioPdfSummary(data)}
        >
          <Download className="h-4 w-4" />
          Export PDF summary
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 sm:col-span-2"
          onClick={onOpenPreview}
        >
          <ExternalLink className="h-4 w-4" />
          Open live preview · /p/{data.slug || "preview"}
        </Button>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Publish checklist</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Set a unique <strong>slug</strong> for{" "}
            <code className="text-xs">devlaunch.ai/p/{data.slug || "username"}</code>
          </li>
          <li>
            Click <strong>Publish</strong> to generate the public URL (re-publish after edits).
          </li>
          <li>
            Optionally export ZIP and deploy to Vercel with a custom domain.
          </li>
        </ol>
        {data.published && (
          <p className="pt-2 font-medium text-emerald-600">
            Live at /p/{data.slug || "preview"}
            {data.publishedAt
              ? ` · published ${new Date(data.publishedAt).toLocaleString()}`
              : ""}
          </p>
        )}
      </div>
    </SectionShell>
  );
}

function ListSection({
  title,
  description,
  empty,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  empty: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  const childArray = Array.isArray(children) ? children : [children];
  return (
    <SectionShell
      title={title}
      description={description}
      action={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      }
    >
      {childArray.filter(Boolean).length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
          {empty}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </SectionShell>
  );
}

function ProjectCard({
  index,
  project,
  onChange,
  onRemove,
  onAi,
  aiLoading,
}: {
  index: number;
  project: PortfolioProject;
  onChange: (patch: Partial<PortfolioProject>) => void;
  onRemove: () => void;
  onAi: () => void;
  aiLoading: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          Project {index + 1}
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <Switch
              checked={project.featured}
              onCheckedChange={(checked) =>
                onChange({ featured: Boolean(checked) })
              }
            />
            Featured
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-600"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Input
        className="h-10 bg-white"
        placeholder="Title"
        value={project.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <div className="flex gap-2">
        <Textarea
          className="min-h-20 flex-1 bg-white"
          placeholder="Description"
          value={project.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0 gap-1"
          disabled={aiLoading}
          onClick={onAi}
        >
          {aiLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          AI
        </Button>
      </div>
      <Input
        className="h-10 bg-white"
        placeholder="Image URL"
        value={project.image}
        onChange={(e) => onChange({ image: e.target.value })}
      />
      <Input
        className="h-10 bg-white"
        placeholder="Extra image URLs (comma separated)"
        value={(project.images || []).join(", ")}
        onChange={(e) => onChange({ images: parseTechInput(e.target.value) })}
      />
      <Input
        className="h-10 bg-white"
        placeholder="Technologies (comma separated)"
        value={project.technologies.join(", ")}
        onChange={(e) =>
          onChange({ technologies: parseTechInput(e.target.value) })
        }
      />
      <Input
        className="h-10 bg-white"
        placeholder="Features (comma separated)"
        value={(project.features || []).join(", ")}
        onChange={(e) => onChange({ features: parseTechInput(e.target.value) })}
      />
      <Textarea
        className="min-h-16 bg-white"
        placeholder="Challenges"
        value={project.challenges || ""}
        onChange={(e) => onChange({ challenges: e.target.value })}
      />
      <Textarea
        className="min-h-16 bg-white"
        placeholder="Achievements"
        value={project.achievements || ""}
        onChange={(e) => onChange({ achievements: e.target.value })}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          className="h-10 bg-white"
          placeholder="GitHub link"
          value={project.github}
          onChange={(e) => onChange({ github: e.target.value })}
        />
        <Input
          className="h-10 bg-white"
          placeholder="Live demo"
          value={project.liveDemo}
          onChange={(e) => onChange({ liveDemo: e.target.value })}
        />
      </div>
    </div>
  );
}
