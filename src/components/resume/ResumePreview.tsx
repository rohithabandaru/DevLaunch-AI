"use client";

import { calculateAtsScore, formatDateRange } from "@/lib/resume";
import type { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";

type ResumePreviewProps = {
  data: ResumeData;
  className?: string;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-slate-800 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
      {children}
    </h2>
  );
}

function ContactLine({ data }: { data: ResumeData }) {
  const parts = [
    data.email.trim() || null,
    data.phone.trim() || null,
    data.location.trim() || null,
    data.linkedin.trim() || null,
    data.github.trim() || null,
    data.portfolio.trim() || null,
  ].filter(Boolean) as string[];

  if (parts.length === 0) {
    return (
      <p className="mt-1 text-[11px] text-slate-400">
        email · phone · location · links
      </p>
    );
  }

  return (
    <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] leading-relaxed text-slate-600">
      {parts.map((part, i) => (
        <span key={`${part}-${i}`} className="inline-flex items-center gap-2">
          {i > 0 && <span className="text-slate-300" aria-hidden>|</span>}
          <span className="break-all">{part}</span>
        </span>
      ))}
    </p>
  );
}

export default function ResumePreview({ data, className }: ResumePreviewProps) {
  const score = calculateAtsScore(data);
  const skills = data.skills.filter((s) => s.trim());
  const experience = data.experience.filter(
    (e) => e.company.trim() || e.role.trim() || e.description.trim()
  );
  const education = data.education.filter(
    (e) => e.school.trim() || e.degree.trim()
  );
  const projects = data.projects.filter(
    (p) => p.name.trim() || p.description.trim()
  );
  const certifications = data.certifications.filter((c) => c.name.trim());

  return (
    <div className={cn("space-y-4", className)}>
      {/* Score badge — hidden when printing */}
      <div className="print:hidden flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live ATS preview
          </p>
          <p className="text-sm font-medium text-slate-700">
            Single-column · standard headings · parse-friendly text
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 flex-col items-center justify-center rounded-xl text-xs font-black shadow-sm",
            score >= 80
              ? "bg-emerald-500 text-white"
              : score >= 50
                ? "bg-amber-500 text-white"
                : "bg-slate-200 text-slate-600"
          )}
        >
          <span className="text-sm leading-none">{score}</span>
          <span className="text-[9px] font-semibold opacity-90">ATS</span>
        </div>
      </div>

      {/* Resume document — ATS-friendly layout */}
      <article
        id="resume-print-area"
        className="resume-document rounded-2xl border border-slate-200 bg-white p-8 shadow-md print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-10"
      >
        {/* Header */}
        <header className="border-b border-slate-200 pb-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {data.fullName.trim() || "Your Name"}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {data.title.trim() || "Professional Title"}
          </p>
          <ContactLine data={data} />
        </header>

        <div className="mt-5 space-y-5 text-[12.5px] leading-relaxed text-slate-800">
          {/* Summary */}
          <section>
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="text-slate-700">
              {data.summary.trim() ||
                "A concise professional summary highlighting your experience, strengths, and target role will appear here."}
            </p>
          </section>

          {/* Experience */}
          <section>
            <SectionTitle>Experience</SectionTitle>
            {experience.length === 0 ? (
              <p className="text-slate-400">Your work experience will appear here.</p>
            ) : (
              <div className="space-y-4">
                {experience.map((job) => {
                  const bullets = job.description
                    .split("\n")
                    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
                    .filter(Boolean);
                  const range = formatDateRange(
                    job.startDate,
                    job.endDate,
                    job.current
                  );

                  return (
                    <div key={job.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <p className="font-bold text-slate-900">
                          {job.role.trim() || "Job Title"}
                          {job.company.trim() ? (
                            <span className="font-semibold text-slate-700">
                              {" · "}
                              {job.company.trim()}
                            </span>
                          ) : null}
                        </p>
                        {range && (
                          <p className="shrink-0 text-[11px] font-medium text-slate-500">
                            {range}
                          </p>
                        )}
                      </div>
                      {(job.location.trim() || null) && (
                        <p className="text-[11px] text-slate-500">{job.location}</p>
                      )}
                      {bullets.length > 0 && (
                        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-slate-700">
                          {bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Education */}
          <section>
            <SectionTitle>Education</SectionTitle>
            {education.length === 0 ? (
              <p className="text-slate-400">Your education will appear here.</p>
            ) : (
              <div className="space-y-3">
                {education.map((edu) => {
                  const range = formatDateRange(edu.startDate, edu.endDate);
                  const degreeLine = [edu.degree, edu.field]
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(" in ");

                  return (
                    <div key={edu.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-bold text-slate-900">
                          {edu.school.trim() || "School"}
                        </p>
                        {range && (
                          <p className="text-[11px] font-medium text-slate-500">
                            {range}
                          </p>
                        )}
                      </div>
                      {degreeLine && (
                        <p className="text-slate-700">{degreeLine}</p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        {[edu.location.trim(), edu.gpa.trim() ? `GPA: ${edu.gpa.trim()}` : ""]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Skills */}
          <section>
            <SectionTitle>Skills</SectionTitle>
            {skills.length === 0 ? (
              <p className="text-slate-400">Your skills will appear here.</p>
            ) : (
              <p className="text-slate-700">{skills.join(" · ")}</p>
            )}
          </section>

          {/* Projects */}
          <section>
            <SectionTitle>Projects</SectionTitle>
            {projects.length === 0 ? (
              <p className="text-slate-400">Your projects will appear here.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <p className="font-bold text-slate-900">
                      {proj.name.trim() || "Project"}
                      {proj.link.trim() && (
                        <span className="ml-2 text-[11px] font-normal text-slate-500">
                          {proj.link.trim()}
                        </span>
                      )}
                    </p>
                    {proj.technologies.trim() && (
                      <p className="text-[11px] font-medium text-slate-500">
                        {proj.technologies.trim()}
                      </p>
                    )}
                    {proj.description.trim() && (
                      <p className="mt-0.5 text-slate-700">{proj.description.trim()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Certifications */}
          {certifications.length > 0 && (
            <section>
              <SectionTitle>Certifications</SectionTitle>
              <ul className="space-y-1">
                {certifications.map((c) => (
                  <li key={c.id} className="text-slate-700">
                    <span className="font-semibold">{c.name}</span>
                    {c.issuer.trim() && ` — ${c.issuer.trim()}`}
                    {c.date.trim() && (
                      <span className="text-slate-500"> ({c.date.trim()})</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Languages */}
          {data.languages.trim() && (
            <section>
              <SectionTitle>Languages</SectionTitle>
              <p className="text-slate-700">{data.languages.trim()}</p>
            </section>
          )}

          {/* Interests */}
          {data.interests.trim() && (
            <section>
              <SectionTitle>Interests</SectionTitle>
              <p className="text-slate-700">{data.interests.trim()}</p>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
