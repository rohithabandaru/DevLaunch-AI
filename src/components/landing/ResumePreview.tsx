"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { Check, Star } from "lucide-react";

const checkItems = [
  "AI Resume Suggestions",
  "ATS Score Checker",
  "Multiple Templates",
  "One Click PDF Download",
];

export default function ResumePreview() {
  const { ref, isInView } = useInView();

  return (
    <section id="resume-preview" className="relative bg-slate-50 py-24 overflow-hidden pattern-section">
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">

        {/* Left Content */}
        <div
          className={`transition-all duration-700 ${
            isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            AI Resume Builder
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl leading-tight">
            Build an ATS-Friendly Resume in Minutes
          </h2>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Create professional resumes using AI. Choose from beautiful templates,
            optimize keywords, and download as PDF with one click.
          </p>

          <ul className="mt-8 space-y-4">
            {checkItems.map((item, i) => (
              <li
                key={item}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
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
              Build Resume
            </Button>
          </Link>
        </div>

        {/* Resume Preview Card */}
        <div
          className={`relative transition-all duration-700 delay-200 ${
            isInView ? "opacity-100 translate-x-0 rotate-0" : "opacity-0 translate-x-8 rotate-2"
          }`}
        >
          {/* ATS Score Badge */}
          <div className="absolute -top-4 -right-4 z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white font-black text-lg shadow-lg shadow-emerald-200/50 animate-float-slow">
            92%
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200/50 hover:shadow-3xl transition-shadow duration-500">
            {/* Header */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  J
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    John Doe
                  </h3>
                  <p className="text-sm font-medium text-indigo-600">
                    Full Stack Developer
                  </p>
                </div>
              </div>
            </div>

            {/* Skills with bars */}
            <div className="mt-6">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {["React", "Next.js", "Node.js", "TypeScript", "SQL"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="mt-6">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3">
                Experience
              </h4>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400 ring-4 ring-indigo-100" />
                <div>
                  <p className="font-semibold text-slate-800">
                    Frontend Developer
                  </p>
                  <p className="text-sm text-slate-500">
                    ABC Technologies · 2023 — Present
                  </p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mt-6">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3">
                Education
              </h4>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-violet-400 ring-4 ring-violet-100" />
                <div>
                  <p className="font-semibold text-slate-800">
                    B.Tech in Computer Science
                  </p>
                  <p className="text-sm text-slate-500">
                    IIT Delhi · 2019 — 2023
                  </p>
                </div>
              </div>
            </div>

            {/* ATS Stars */}
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 ring-1 ring-emerald-200/50">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= 4
                        ? "fill-emerald-400 text-emerald-400"
                        : "fill-emerald-200 text-emerald-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-emerald-700">
                ATS Score: Excellent
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}