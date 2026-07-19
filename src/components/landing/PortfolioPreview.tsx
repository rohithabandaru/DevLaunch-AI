"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { Check, ExternalLink } from "lucide-react";

const checkItems = [
  "Beautiful Templates",
  "Mobile Responsive",
  "SEO Optimized",
  "One Click Publish",
];

const skills = [
  { name: "React", color: "bg-blue-50 text-blue-600 ring-blue-100" },
  { name: "Next.js", color: "bg-slate-100 text-slate-700 ring-slate-200" },
  { name: "TypeScript", color: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
  { name: "Tailwind", color: "bg-cyan-50 text-cyan-600 ring-cyan-100" },
  { name: "Python", color: "bg-amber-50 text-amber-600 ring-amber-100" },
];

const projects = [
  { name: "DevLaunch AI", tag: "SaaS" },
  { name: "Expense Tracker", tag: "Finance" },
  { name: "PG MoveIn", tag: "Real Estate" },
];

export default function PortfolioPreview() {
  const { ref, isInView } = useInView();

  return (
    <section id="portfolio-preview" className="bg-white py-24">
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">

        {/* Browser Mockup */}
        <div
          className={`transition-all duration-700 ${
            isInView ? "opacity-100 translate-x-0 rotate-0" : "opacity-0 -translate-x-8 -rotate-1"
          }`}
        >
          <div className="browser-chrome">
            {/* Chrome bar */}
            <div className="browser-chrome-bar">
              <div className="flex gap-2">
                <div className="browser-dot bg-red-400" />
                <div className="browser-dot bg-yellow-400" />
                <div className="browser-dot bg-green-400" />
              </div>
              <div className="flex-1 ml-4 rounded-md bg-slate-700/50 px-4 py-1.5 text-xs text-slate-400 font-mono">
                rohitha.devlaunch.ai
              </div>
            </div>

            {/* Portfolio content */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
              {/* Profile header */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-3xl font-bold text-white ring-4 ring-indigo-500/20 shadow-lg">
                  R
                </div>

                <h3 className="text-xl font-bold text-white">
                  Rohitha
                </h3>
                <p className="text-sm text-indigo-300 font-medium">
                  Full Stack Developer
                </p>
              </div>

              {/* About */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Passionate developer building modern web applications using
                  React, Next.js and AI technologies.
                </p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${skill.color}`}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Projects
                </h4>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.name}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sm font-medium text-white">
                        {project.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {project.tag}
                        </span>
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side — Content */}
        <div
          className={`transition-all duration-700 delay-200 ${
            isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            AI Portfolio Builder
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl leading-tight">
            Build Your Portfolio Website Instantly
          </h2>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Showcase your skills, projects and experience with a modern
            portfolio website generated using AI — no design skills required.
          </p>

          <ul className="mt-8 space-y-4">
            {checkItems.map((item, i) => (
              <li
                key={item}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
                style={{ transitionDelay: `${400 + i * 100}ms` }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-sm">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="font-medium text-slate-700">{item}</span>
              </li>
            ))}
          </ul>

          <Link href="/register">
            <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl hover:-translate-y-0.5" size="lg">
              Build Portfolio
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}