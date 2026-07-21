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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Field from "@/components/portfolio/editor/Field";
import SectionShell from "@/components/portfolio/editor/SectionShell";
import {
  SKILL_CATEGORIES,
  createEmptyAchievement,
  createEmptyBlogPost,
  createEmptyCertification,
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
  generateProjectDescriptionLocal,
  generateSkillsSummaryLocal,
} from "@/lib/portfolio-ai";
import { downloadStaticPortfolio } from "@/lib/portfolio-export";
import type {
  PortfolioData,
  PortfolioEditorSection,
  PortfolioProject,
  PortfolioTemplateId,
  SkillCategory,
} from "@/types/portfolio";
import { cn } from "@/lib/utils";

type Props = {
  section: PortfolioEditorSection;
  data: PortfolioData;
  onChange: (patch: Partial<PortfolioData>) => void;
  onOpenPreview?: () => void;
};

export default function PortfolioEditor({
  section,
  data,
  onChange,
  onOpenPreview,
}: Props) {
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  async function runAi(
    action: "about" | "project" | "skills_summary",
    extra?: { projectId?: string }
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
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (action === "about") {
          onChange({
            biography: json.biography ?? data.biography,
            careerObjective: json.careerObjective ?? data.careerObjective,
            introduction: json.introduction ?? data.introduction,
          });
        } else if (action === "skills_summary") {
          onChange({ skillsSummary: json.skillsSummary ?? data.skillsSummary });
        } else if (action === "project" && extra?.projectId) {
          onChange({
            projects: data.projects.map((p) =>
              p.id === extra.projectId
                ? { ...p, description: json.description ?? p.description }
                : p
            ),
          });
        }
        return;
      }

      // Fallback local generation
      if (action === "about") {
        onChange(generateAboutLocal(data));
      } else if (action === "skills_summary") {
        onChange({ skillsSummary: generateSkillsSummaryLocal(data) });
      } else if (action === "project" && extra?.projectId) {
        const project = data.projects.find((p) => p.id === extra.projectId);
        if (project) {
          onChange({
            projects: data.projects.map((p) =>
              p.id === extra.projectId
                ? {
                    ...p,
                    description: generateProjectDescriptionLocal(project),
                  }
                : p
            ),
          });
        }
      }
      if (res.status === 401) {
        setAiError("Using local AI draft (sign in for cloud AI).");
      }
    } catch {
      if (action === "about") onChange(generateAboutLocal(data));
      else if (action === "skills_summary")
        onChange({ skillsSummary: generateSkillsSummaryLocal(data) });
      else if (action === "project" && extra?.projectId) {
        const project = data.projects.find((p) => p.id === extra.projectId);
        if (project) {
          onChange({
            projects: data.projects.map((p) =>
              p.id === extra.projectId
                ? {
                    ...p,
                    description: generateProjectDescriptionLocal(project),
                  }
                : p
            ),
          });
        }
      }
      setAiError("Using local AI draft (network unavailable).");
    } finally {
      setAiLoading(null);
    }
  }

  if (section === "hero") {
    return (
      <SectionShell
        title="Hero"
        description="First impression: name, title, photo, intro, and CTAs."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" className="sm:col-span-2">
            <Input
              id="fullName"
              className="h-10 bg-white"
              value={data.fullName}
              onChange={(e) => {
                const fullName = e.target.value;
                onChange({
                  fullName,
                  slug: data.slug === "my-portfolio" || !data.slug
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
          <Field
            label="Profile photo URL"
            htmlFor="photo"
            className="sm:col-span-2"
            hint="Paste an image URL. Leave blank for monogram avatar."
          >
            <Input
              id="photo"
              className="h-10 bg-white"
              value={data.profilePhoto}
              onChange={(e) => onChange({ profilePhoto: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Short introduction" htmlFor="intro" className="sm:col-span-2">
            <Textarea
              id="intro"
              className="min-h-24 bg-white"
              value={data.introduction}
              onChange={(e) => onChange({ introduction: e.target.value })}
              placeholder="One or two sentences that define your brand."
            />
          </Field>
          <Field label="Resume URL" htmlFor="resume">
            <Input
              id="resume"
              className="h-10 bg-white"
              value={data.resumeUrl}
              onChange={(e) => onChange({ resumeUrl: e.target.value })}
              placeholder="https://…/resume.pdf"
            />
          </Field>
          <Field label="Contact button label" htmlFor="cta">
            <Input
              id="cta"
              className="h-10 bg-white"
              value={data.heroCtaLabel}
              onChange={(e) => onChange({ heroCtaLabel: e.target.value })}
              placeholder="Get in touch"
            />
          </Field>
        </div>
      </SectionShell>
    );
  }

  if (section === "about") {
    return (
      <SectionShell
        title="About"
        description="Biography, career objective, and years of experience."
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
        <Field label="Biography" htmlFor="bio">
          <Textarea
            id="bio"
            className="min-h-32 bg-white"
            value={data.biography}
            onChange={(e) => onChange({ biography: e.target.value })}
            placeholder="Tell your story…"
          />
        </Field>
        <Field label="Career objective" htmlFor="objective">
          <Textarea
            id="objective"
            className="min-h-20 bg-white"
            value={data.careerObjective}
            onChange={(e) => onChange({ careerObjective: e.target.value })}
            placeholder="What you want next…"
          />
        </Field>
      </SectionShell>
    );
  }

  if (section === "skills") {
    return (
      <SectionShell
        title="Skills"
        description="Categorized skills with levels for progress bars or badges."
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
            placeholder="A short narrative over your skill set…"
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

  if (section === "projects") {
    return (
      <SectionShell
        title="Projects"
        description="Showcase work with tech stack, links, and featured flag."
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

  if (section === "experience" || section === "education") {
    const key = section;
    const items = data[key];
    const label = section === "experience" ? "Experience" : "Education";
    return (
      <SectionShell
        title={`${label} Timeline`}
        description={
          section === "experience"
            ? "Career history in reverse chronological order."
            : "Degrees, bootcamps, and academic milestones."
        }
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              onChange({ [key]: [...items, createEmptyTimeline()] })
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
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Entry {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-600"
                  onClick={() => {
                    if (items.length <= 1) {
                      onChange({ [key]: [createEmptyTimeline()] });
                      return;
                    }
                    onChange({
                      [key]: items.filter((i) => i.id !== item.id),
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title / Degree">
                  <Input
                    className="h-10 bg-white"
                    value={item.title}
                    onChange={(e) =>
                      onChange({
                        [key]: items.map((i) =>
                          i.id === item.id
                            ? { ...i, title: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Organization">
                  <Input
                    className="h-10 bg-white"
                    value={item.organization}
                    onChange={(e) =>
                      onChange({
                        [key]: items.map((i) =>
                          i.id === item.id
                            ? { ...i, organization: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Location">
                  <Input
                    className="h-10 bg-white"
                    value={item.location}
                    onChange={(e) =>
                      onChange({
                        [key]: items.map((i) =>
                          i.id === item.id
                            ? { ...i, location: e.target.value }
                            : i
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Start">
                  <Input
                    className="h-10 bg-white"
                    value={item.startDate}
                    onChange={(e) =>
                      onChange({
                        [key]: items.map((i) =>
                          i.id === item.id
                            ? { ...i, startDate: e.target.value }
                            : i
                        ),
                      })
                    }
                    placeholder="2022"
                  />
                </Field>
                <Field label="End">
                  <Input
                    className="h-10 bg-white"
                    value={item.current ? "Present" : item.endDate}
                    disabled={item.current}
                    onChange={(e) =>
                      onChange({
                        [key]: items.map((i) =>
                          i.id === item.id
                            ? { ...i, endDate: e.target.value }
                            : i
                        ),
                      })
                    }
                    placeholder="2024"
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(e) =>
                      onChange({
                        [key]: items.map((i) =>
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
                  Current
                </label>
                <Field label="Description" className="sm:col-span-2">
                  <Textarea
                    className="min-h-20 bg-white"
                    value={item.description}
                    onChange={(e) =>
                      onChange({
                        [key]: items.map((i) =>
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

  if (section === "certifications") {
    return (
      <ListSection
        title="Certifications"
        description="Credentials and professional courses."
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

  if (section === "services") {
    return (
      <SectionShell
        title="Services (Optional)"
        description="Offerings for freelancers and consultants."
        action={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Show section</span>
            <Switch
              checked={data.showServices}
              onCheckedChange={(checked) =>
                onChange({ showServices: Boolean(checked) })
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

  if (section === "blog") {
    return (
      <SectionShell
        title="Blog (Optional)"
        description="Link to writing and technical posts."
        action={
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Show section</span>
            <Switch
              checked={data.showBlog}
              onCheckedChange={(checked) =>
                onChange({ showBlog: Boolean(checked) })
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

  if (section === "contact") {
    return (
      <SectionShell
        title="Contact"
        description="Links shown in the contact section and footer."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["email", "Email", "you@email.com"],
              ["phone", "Phone", "+1 …"],
              ["location", "Location", "City, Country"],
              ["linkedin", "LinkedIn", "https://linkedin.com/in/…"],
              ["github", "GitHub", "https://github.com/…"],
              ["portfolioUrl", "Portfolio URL", "https://…"],
              ["twitter", "Twitter / X", "https://x.com/…"],
              ["footerTagline", "Footer tagline", "Built with care"],
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
        </div>
      </SectionShell>
    );
  }

  if (section === "design") {
    const templates: {
      id: PortfolioTemplateId;
      name: string;
      blurb: string;
    }[] = [
      {
        id: "modern",
        name: "Modern",
        blurb: "Balanced layout with progress bars and soft cards.",
      },
      {
        id: "minimal",
        name: "Minimal",
        blurb: "Clean typography with skill badges.",
      },
      {
        id: "bold",
        name: "Bold",
        blurb: "Centered hero and high-impact presentation.",
      },
    ];

    return (
      <SectionShell
        title="Design & SEO"
        description="Template, theme, accent color, and search metadata."
      >
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Template</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {templates.map((t) => (
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
          <Field label="Accent color" htmlFor="accent">
            <div className="flex items-center gap-2">
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
            </div>
          </Field>
        </div>

        <Field label="SEO title" htmlFor="seoTitle">
          <Input
            id="seoTitle"
            className="h-10 bg-white"
            value={data.seoTitle}
            onChange={(e) => onChange({ seoTitle: e.target.value })}
            placeholder="Name — Role"
          />
        </Field>
        <Field label="SEO description" htmlFor="seoDesc">
          <Textarea
            id="seoDesc"
            className="min-h-20 bg-white"
            value={data.seoDescription}
            onChange={(e) => onChange({ seoDescription: e.target.value })}
            placeholder="1–2 sentences for search engines and social previews."
          />
        </Field>
      </SectionShell>
    );
  }

  // deploy
  return (
    <SectionShell
      title="Deploy & Export"
      description="Custom domain, static download, and one-click publish path."
    >
      <Field
        label="Portfolio slug"
        htmlFor="slug"
        hint="Public path: /p/your-slug"
      >
        <Input
          id="slug"
          className="h-10 bg-white font-mono"
          value={data.slug}
          onChange={(e) => onChange({ slug: slugify(e.target.value) })}
        />
      </Field>
      <Field
        label="Custom domain"
        htmlFor="domain"
        hint="Point a CNAME to your host after deploying static files (e.g. alexchen.dev)."
      >
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
          onClick={() => {
            localStorage.setItem(
              "devlaunch-portfolio-published",
              JSON.stringify({ ...data, published: true })
            );
            onChange({ published: true });
            window.open(`/p/${data.slug || "preview"}`, "_blank");
          }}
        >
          <Rocket className="h-4 w-4" />
          One-click publish
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2"
          onClick={() => downloadStaticPortfolio(data)}
        >
          <Download className="h-4 w-4" />
          Download static HTML
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 sm:col-span-2"
          onClick={onOpenPreview}
        >
          <ExternalLink className="h-4 w-4" />
          Open full preview
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-2">
        <p className="font-semibold text-slate-800">Deploy checklist</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Download the static HTML file.</li>
          <li>
            Drop it into Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
          </li>
          <li>
            Attach your custom domain and enable HTTPS.
          </li>
          <li>
            Optionally sync JSON to Supabase <code className="text-xs">portfolios</code> table
            for multi-device editing.
          </li>
        </ol>
        {data.published && (
          <p className="pt-2 text-emerald-600 font-medium">
            Published draft available at /p/{data.slug || "preview"}
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
        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onAdd}>
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
        <p className="text-sm font-semibold text-slate-700">Project {index + 1}</p>
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
        placeholder="Project name"
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
        placeholder="Technologies (comma separated)"
        value={project.technologies.join(", ")}
        onChange={(e) => onChange({ technologies: parseTechInput(e.target.value) })}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          className="h-10 bg-white"
          placeholder="GitHub URL"
          value={project.github}
          onChange={(e) => onChange({ github: e.target.value })}
        />
        <Input
          className="h-10 bg-white"
          placeholder="Live demo URL"
          value={project.liveDemo}
          onChange={(e) => onChange({ liveDemo: e.target.value })}
        />
      </div>
    </div>
  );
}
