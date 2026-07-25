"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  Globe,
  Award,
  Sparkles,
  Quote,
  BookOpen,
  Briefcase,
  GraduationCap,
  Star,
} from "lucide-react";
import {
  SKILL_CATEGORIES,
  getFontGoogleUrl,
  getFontStack,
  getSeoTitle,
} from "@/lib/portfolio";
import type { PortfolioData, PortfolioTemplateId } from "@/types/portfolio";
import { cn } from "@/lib/utils";

function Github(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function Linkedin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type Props = {
  data: PortfolioData;
  /** Compact mode for the builder preview frame */
  preview?: boolean;
  className?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function templateClasses(template: PortfolioTemplateId) {
  switch (template) {
    case "minimal":
      return {
        radius: "rounded-lg",
        hero: "text-left",
        accentBar: false,
        dense: true,
        creative: false,
      };
    case "bold":
      return {
        radius: "rounded-3xl",
        hero: "text-center",
        accentBar: true,
        dense: false,
        creative: false,
      };
    case "creative":
      return {
        radius: "rounded-3xl",
        hero: "text-left",
        accentBar: true,
        dense: false,
        creative: true,
      };
    default:
      return {
        radius: "rounded-2xl",
        hero: "text-left md:text-left",
        accentBar: true,
        dense: false,
        creative: false,
      };
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PortfolioSite({ data, preview, className }: Props) {
  const [formStatus, setFormStatus] = useState<"idle" | "sent">("idle");
  const isDark = data.themeMode === "dark";
  const tpl = templateClasses(data.template);
  const accent = data.accentColor || "#4f46e5";
  const anim = data.animationsEnabled !== false;
  const fontStack = getFontStack(data.fontFamily);
  const fontUrl = getFontGoogleUrl(data.fontFamily);

  const skillsByCategory = useMemo(
    () =>
      SKILL_CATEGORIES.map((cat) => ({
        ...cat,
        items: data.skills.filter(
          (s) => s.category === cat.id && s.name.trim()
        ),
      })).filter((c) => c.items.length > 0),
    [data.skills]
  );

  const projects = data.projects.filter(
    (p) => p.name.trim() || p.description.trim()
  );
  const experience = data.experience.filter(
    (e) => e.title.trim() || e.organization.trim()
  );
  const education = data.education.filter(
    (e) => e.title.trim() || e.organization.trim()
  );

  const socials = [
    { href: data.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: data.github, label: "GitHub", icon: Github },
    { href: data.twitter, label: "Twitter", icon: TwitterX },
    { href: data.portfolioUrl, label: "Website", icon: Globe },
    { href: data.dribbble, label: "Dribbble", icon: ExternalLink },
    { href: data.youtube, label: "YouTube", icon: ExternalLink },
    { href: data.medium, label: "Medium", icon: BookOpen },
  ].filter((s) => s.href?.trim());

  const motionProps = anim
    ? {
        variants: stagger,
        initial: "hidden" as const,
        whileInView: "show" as const,
        viewport: { once: true, amount: 0.2 },
      }
    : {};

  return (
    <div
      className={cn(
        "min-h-full transition-colors duration-300",
        isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900",
        className
      )}
      style={{
        ["--portfolio-accent" as string]: accent,
        fontFamily: fontStack,
      }}
    >
      {fontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={fontUrl} />
      )}
      {/* SEO-friendly document title hint for live preview */}
      <span className="sr-only">{getSeoTitle(data)}</span>

      {tpl.accentBar && (
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${accent}, #a855f7, ${accent})`,
          }}
        />
      )}

      <div
        className={cn(
          "mx-auto",
          preview ? "max-w-3xl px-5 py-6 sm:px-8" : "max-w-5xl px-6 py-10"
        )}
      >
        {/* Nav */}
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: accent }}
          >
            {data.fullName?.split(" ")[0] || "Portfolio"}
          </span>
          <div
            className={cn(
              "flex flex-wrap gap-3 text-xs font-medium sm:text-sm",
              isDark ? "text-slate-400" : "text-slate-500"
            )}
          >
            {[
              "About",
              "Skills",
              "Projects",
              "Experience",
              "Contact",
            ].map((label) => (
              <a
                key={label}
                href={`#p-${label.toLowerCase()}`}
                className="transition-colors hover:opacity-80"
                style={{ ["--tw-text-opacity" as string]: 1 }}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* 1. Hero */}
        <motion.section
          id="p-hero"
          {...motionProps}
          className={cn(
            "mb-16 grid items-center gap-8",
            data.template === "bold"
              ? "justify-items-center text-center"
              : "md:grid-cols-[1.3fr_0.7fr]",
            tpl.creative &&
              cn(
                "rounded-3xl border p-6 sm:p-8",
                isDark ? "border-slate-800" : "border-slate-200"
              )
          )}
          style={
            tpl.creative
              ? {
                  background: `linear-gradient(135deg, ${accent}18, transparent 65%)`,
                }
              : undefined
          }
        >
          <div className={cn(tpl.hero, data.template === "bold" && "max-w-2xl")}>
            <motion.p
              variants={anim ? fadeUp : undefined}
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              Hello, I&apos;m
            </motion.p>
            <motion.h1
              variants={anim ? fadeUp : undefined}
              className={cn(
                "mt-2 font-extrabold tracking-tight",
                preview ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
              )}
            >
              {data.fullName || "Your Name"}
            </motion.h1>
            <motion.p
              variants={anim ? fadeUp : undefined}
              className="mt-2 text-lg font-semibold"
              style={{ color: accent }}
            >
              {data.title || "Professional Title"}
            </motion.p>
            <motion.p
              variants={anim ? fadeUp : undefined}
              className={cn(
                "mt-4 max-w-xl leading-relaxed",
                isDark ? "text-slate-300" : "text-slate-600",
                data.template === "bold" && "mx-auto"
              )}
            >
              {data.introduction ||
                "A short introduction about who you are and what you build."}
            </motion.p>
            <motion.div
              variants={anim ? fadeUp : undefined}
              className={cn(
                "mt-6 flex flex-wrap gap-3",
                data.template === "bold" && "justify-center"
              )}
            >
              {data.resumeUrl ? (
                <a
                  href={data.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  <Download className="h-4 w-4" />
                  Download Resume
                </a>
              ) : (
                <span
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white opacity-80"
                  style={{ backgroundColor: accent }}
                >
                  <Download className="h-4 w-4" />
                  Download Resume
                </span>
              )}
              <a
                href="#p-contact"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                  isDark
                    ? "border-slate-700 hover:bg-slate-900"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <Mail className="h-4 w-4" />
                {data.heroCtaLabel || "Contact"}
              </a>
            </motion.div>
          </div>

          <motion.div
            variants={anim ? fadeUp : undefined}
            className={cn(
              "mx-auto flex h-40 w-40 items-center justify-center overflow-hidden shadow-xl sm:h-48 sm:w-48",
              tpl.radius,
              data.template === "minimal" && "h-32 w-32 sm:h-36 sm:w-36"
            )}
            style={{
              background: data.profilePhoto
                ? undefined
                : `linear-gradient(135deg, ${accent}, #a855f7)`,
            }}
          >
            {data.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.profilePhoto}
                alt={data.fullName || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-black text-white">
                {initials(data.fullName || "Y")}
              </span>
            )}
          </motion.div>
        </motion.section>

        {/* 2. About */}
        <Section
          id="p-about"
          title="About"
          isDark={isDark}
          accent={accent}
          anim={anim}
          icon={<Sparkles className="h-4 w-4" />}
        >
          <p className={cn("leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
            {data.biography ||
              "Your biography will appear here. Share your story, strengths, and what drives your work."}
          </p>
          {data.careerObjective && (
            <p className={cn("mt-4 leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
              <strong className={isDark ? "text-white" : "text-slate-900"}>
                Career objective:{" "}
              </strong>
              {data.careerObjective}
            </p>
          )}
          {data.yearsExperience && (
            <p className={cn("mt-2 text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
              Experience: {data.yearsExperience} years
            </p>
          )}
        </Section>

        {/* 3. Skills */}
        <Section
          id="p-skills"
          title="Skills"
          isDark={isDark}
          accent={accent}
          anim={anim}
          icon={<Star className="h-4 w-4" />}
        >
          {data.skillsSummary && (
            <p className={cn("mb-6 leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
              {data.skillsSummary}
            </p>
          )}
          {skillsByCategory.length === 0 ? (
            <p className="text-sm text-slate-400">Add skills in the editor to see badges and progress bars.</p>
          ) : (
            <div className="space-y-6">
              {skillsByCategory.map((cat) => (
                <div key={cat.id}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                    {cat.label}
                  </h3>
                  {data.template === "minimal" ? (
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((skill, i) => (
                        <motion.span
                          key={skill.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            isDark
                              ? "bg-slate-800 text-slate-200"
                              : "bg-slate-100 text-slate-700"
                          )}
                          style={{ boxShadow: `inset 0 0 0 1px ${accent}33` }}
                        >
                          {skill.name}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cat.items.map((skill, i) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <div className="mb-1 flex justify-between text-xs font-medium">
                            <span>{skill.name}</span>
                            <span className="text-slate-400">{skill.level}%</span>
                          </div>
                          <div
                            className={cn(
                              "h-2 overflow-hidden rounded-full",
                              isDark ? "bg-slate-800" : "bg-slate-100"
                            )}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: accent }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 4. Projects */}
        <Section
          id="p-projects"
          title="Projects"
          isDark={isDark}
          accent={accent}
          anim={anim}
          icon={<Briefcase className="h-4 w-4" />}
        >
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400">Add projects to showcase your work.</p>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                data.template === "bold" ? "sm:grid-cols-1" : "sm:grid-cols-2"
              )}
            >
              {projects.map((project, i) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "group overflow-hidden border transition hover:-translate-y-0.5 hover:shadow-lg",
                    tpl.radius,
                    isDark
                      ? "border-slate-800 bg-slate-900/60"
                      : "border-slate-200 bg-slate-50/80"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-28 items-center justify-center text-3xl font-black text-white/90",
                      project.image ? "bg-cover bg-center" : ""
                    )}
                    style={
                      project.image
                        ? { backgroundImage: `url(${project.image})` }
                        : {
                            background: `linear-gradient(135deg, ${accent}cc, #7c3aedcc)`,
                          }
                    }
                  >
                    {!project.image && (project.name?.[0] || "P")}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{project.name || "Untitled project"}</h3>
                      {project.featured && (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: accent }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed",
                        isDark ? "text-slate-300" : "text-slate-600"
                      )}
                    >
                      {project.description || "Project description"}
                    </p>
                    {project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.technologies.map((t) => (
                          <span
                            key={t}
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-white text-slate-600 ring-1 ring-slate-200"
                            )}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex gap-3 text-xs font-semibold" style={{ color: accent }}>
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <Github className="h-3.5 w-3.5" /> GitHub
                        </a>
                      )}
                      {project.liveDemo && (
                        <a
                          href={project.liveDemo}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </Section>

        {/* 5. Experience timeline */}
        <Section
          id="p-experience"
          title="Experience"
          isDark={isDark}
          accent={accent}
          anim={anim}
          icon={<Briefcase className="h-4 w-4" />}
        >
          <Timeline
            items={experience}
            isDark={isDark}
            accent={accent}
            anim={anim}
            empty="Add work experience."
          />
        </Section>

        {/* 6. Education timeline */}
        <Section
          id="p-education"
          title="Education"
          isDark={isDark}
          accent={accent}
          anim={anim}
          icon={<GraduationCap className="h-4 w-4" />}
        >
          <Timeline
            items={education}
            isDark={isDark}
            accent={accent}
            anim={anim}
            empty="Add education."
          />
        </Section>

        {/* 7. Certifications */}
        {data.certifications.some((c) => c.name.trim()) && (
          <Section
            id="p-certifications"
            title="Certificates"
            isDark={isDark}
            accent={accent}
            anim={anim}
            icon={<Award className="h-4 w-4" />}
          >
            <ul className="space-y-3">
              {data.certifications
                .filter((c) => c.name.trim())
                .map((c) => (
                  <li
                    key={c.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 border px-4 py-3",
                      tpl.radius,
                      isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-slate-400">
                        {c.issuer}
                        {c.date ? ` · ${c.date}` : ""}
                      </p>
                    </div>
                    {c.credentialUrl && (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold"
                        style={{ color: accent }}
                      >
                        Credential
                      </a>
                    )}
                  </li>
                ))}
            </ul>
          </Section>
        )}

        {/* 8. Achievements */}
        {data.achievements.some((a) => a.title.trim()) && (
          <Section
            id="p-achievements"
            title="Achievements"
            isDark={isDark}
            accent={accent}
            anim={anim}
            icon={<Award className="h-4 w-4" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {data.achievements
                .filter((a) => a.title.trim())
                .map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      "border p-4",
                      tpl.radius,
                      isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold">{a.title}</h3>
                      {a.year && (
                        <span className="text-xs font-semibold text-slate-400">{a.year}</span>
                      )}
                    </div>
                    <p className={cn("mt-1 text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                      {a.description}
                    </p>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {/* 9. Services */}
        {data.showServices && data.services.some((s) => s.title.trim()) && (
          <Section
            id="p-services"
            title="Services"
            isDark={isDark}
            accent={accent}
            anim={anim}
            icon={<Sparkles className="h-4 w-4" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {data.services
                .filter((s) => s.title.trim())
                .map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "border p-4",
                      tpl.radius,
                      isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <h3 className="font-bold" style={{ color: accent }}>
                      {s.title}
                    </h3>
                    <p className={cn("mt-1 text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                      {s.description}
                    </p>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {/* 10. Testimonials */}
        {data.testimonials.some((t) => t.quote.trim()) && (
          <Section
            id="p-testimonials"
            title="Testimonials"
            isDark={isDark}
            accent={accent}
            anim={anim}
            icon={<Quote className="h-4 w-4" />}
          >
            <div className="grid gap-4">
              {data.testimonials
                .filter((t) => t.quote.trim())
                .map((t) => (
                  <blockquote
                    key={t.id}
                    className={cn(
                      "border p-5",
                      tpl.radius,
                      isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <p className={cn("text-sm leading-relaxed italic", isDark ? "text-slate-300" : "text-slate-700")}>
                      “{t.quote}”
                    </p>
                    <footer className="mt-3 text-sm font-semibold">
                      {t.name}
                      <span className="font-normal text-slate-400">
                        {t.role ? ` · ${t.role}` : ""}
                        {t.company ? ` at ${t.company}` : ""}
                      </span>
                    </footer>
                  </blockquote>
                ))}
            </div>
          </Section>
        )}

        {/* 11. Blog */}
        {data.showBlog && data.blogPosts.some((b) => b.title.trim()) && (
          <Section
            id="p-blog"
            title="Blog"
            isDark={isDark}
            accent={accent}
            anim={anim}
            icon={<BookOpen className="h-4 w-4" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {data.blogPosts
                .filter((b) => b.title.trim())
                .map((b) => (
                  <article
                    key={b.id}
                    className={cn(
                      "border p-4",
                      tpl.radius,
                      isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <h3 className="font-bold">
                      {b.url ? (
                        <a href={b.url} target="_blank" rel="noreferrer" style={{ color: accent }}>
                          {b.title}
                        </a>
                      ) : (
                        b.title
                      )}
                    </h3>
                    <p className={cn("mt-1 text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                      {b.excerpt}
                    </p>
                    {b.date && <p className="mt-2 text-xs text-slate-400">{b.date}</p>}
                  </article>
                ))}
            </div>
          </Section>
        )}

        {/* 12. Contact */}
        <Section
          id="p-contact"
          title="Contact"
          isDark={isDark}
          accent={accent}
          anim={anim}
          icon={<Mail className="h-4 w-4" />}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              {data.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" style={{ color: accent }} />
                  <a href={`mailto:${data.email}`} className="hover:underline">
                    {data.email}
                  </a>
                </p>
              )}
              {data.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" style={{ color: accent }} />
                  {data.phone}
                </p>
              )}
              {data.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: accent }} />
                  {data.location}
                </p>
              )}
              {socials.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socials.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-90",
                          isDark
                            ? "border-slate-700 bg-slate-900"
                            : "border-slate-200 bg-white"
                        )}
                        style={{ color: accent }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {s.label}
                      </a>
                    );
                  })}
                </div>
              )}
              {!data.email && !data.phone && socials.length === 0 && (
                <p className="text-slate-400">
                  Add contact details and social links in the editor.
                </p>
              )}
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setFormStatus("sent");
              }}
            >
              <input
                required
                placeholder="Your name"
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2",
                  isDark
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white"
                )}
                style={{ ["--tw-ring-color" as string]: `${accent}55` }}
              />
              <input
                required
                type="email"
                placeholder="Your email"
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2",
                  isDark
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white"
                )}
              />
              <textarea
                required
                rows={4}
                placeholder="Your message"
                className={cn(
                  "w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2",
                  isDark
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white"
                )}
              />
              <button
                type="submit"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: accent }}
              >
                {formStatus === "sent" ? "Message ready ✓" : "Send message"}
              </button>
              {formStatus === "sent" && (
                <p className="text-xs text-slate-400">
                  Demo form — wire to Formspree, Supabase, or your API for production.
                </p>
              )}
            </form>
          </div>
        </Section>

        {/* 13. Footer */}
        <footer
          className={cn(
            "mt-16 border-t pt-6 text-center text-sm",
            isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-500"
          )}
        >
          <p>
            © {new Date().getFullYear()} {data.fullName || "Portfolio"}
            {data.footerTagline ? ` · ${data.footerTagline}` : ""}
          </p>
          {data.customDomain && (
            <p className="mt-1 text-xs">Custom domain: {data.customDomain}</p>
          )}
        </footer>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
  isDark,
  accent,
  icon,
  anim = true,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  isDark: boolean;
  accent: string;
  icon?: React.ReactNode;
  anim?: boolean;
}) {
  return (
    <motion.section
      id={id}
      initial={anim ? { opacity: 0, y: 20 } : false}
      whileInView={anim ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
      className="mb-14 scroll-mt-6"
    >
      <div className="mb-4 flex items-center gap-2 border-b pb-2" style={{ borderColor: `${accent}33` }}>
        <span style={{ color: accent }}>{icon}</span>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      <div className={isDark ? "" : ""}>{children}</div>
    </motion.section>
  );
}

function Timeline({
  items,
  isDark,
  accent,
  empty,
  anim = true,
}: {
  items: PortfolioData["experience"];
  isDark: boolean;
  accent: string;
  empty: string;
  anim?: boolean;
}) {
  if (!items.length) {
    return <p className="text-sm text-slate-400">{empty}</p>;
  }

  return (
    <div
      className={cn(
        "relative space-y-6 border-l-2 pl-5",
        isDark ? "border-slate-800" : "border-slate-200"
      )}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={anim ? { opacity: 0, x: -10 } : false}
          whileInView={anim ? { opacity: 1, x: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="relative"
        >
          <span
            className={cn(
              "absolute -left-[1.45rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4",
              isDark ? "ring-slate-950" : "ring-white"
            )}
            style={{ backgroundColor: accent }}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold">
              {item.title || "Title"}
              {item.organization ? (
                <span className="font-semibold text-slate-500">
                  {" "}
                  · {item.organization}
                </span>
              ) : null}
            </h3>
            <span className="text-xs font-medium text-slate-400">
              {item.startDate}
              {item.current
                ? " – Present"
                : item.endDate
                  ? ` – ${item.endDate}`
                  : ""}
            </span>
          </div>
          {item.location && (
            <p className="text-xs text-slate-400">{item.location}</p>
          )}
          {item.description && (
            <p
              className={cn(
                "mt-1 text-sm leading-relaxed",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              {item.description}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
