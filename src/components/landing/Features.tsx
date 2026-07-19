"use client";

import { FileText, Globe, Briefcase, Bot } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const DELAY_CLASSES = ["delay-0", "delay-150", "delay-300", "delay-500"];

const features = [
  {
    title: "Resume Builder",
    description:
      "Create ATS-friendly resumes using AI suggestions and professional templates that get past automated screening.",
    icon: FileText,
    gradient: "from-indigo-500 to-blue-500",
    shadowColor: "group-hover:shadow-indigo-200/60",
    ringColor: "ring-indigo-500/20",
  },
  {
    title: "Portfolio Generator",
    description:
      "Build a professional portfolio website that showcases your best work — SEO-optimized and mobile responsive.",
    icon: Globe,
    gradient: "from-violet-500 to-purple-500",
    shadowColor: "group-hover:shadow-violet-200/60",
    ringColor: "ring-violet-500/20",
  },
  {
    title: "Job Tracker",
    description:
      "Track all your job applications across a Kanban board with smart insights, deadlines, and status updates.",
    icon: Briefcase,
    gradient: "from-emerald-500 to-teal-500",
    shadowColor: "group-hover:shadow-emerald-200/60",
    ringColor: "ring-emerald-500/20",
  },
  {
    title: "AI Interview",
    description:
      "Practice mock interviews with real-time AI feedback, STAR method coaching, and confidence scoring.",
    icon: Bot,
    gradient: "from-amber-500 to-orange-500",
    shadowColor: "group-hover:shadow-amber-200/60",
    ringColor: "ring-amber-500/20",
  },
];

export default function Features() {
  const { ref, isInView } = useInView();

  return (
    <section id="features" className="relative py-24 pattern-section">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 -z-10" />

      <div ref={ref} className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div
          className={`text-center transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            Features
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Everything You Need
          </h2>

          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful AI-driven tools designed to give you an unfair advantage in
            your job search.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group glass-card rounded-2xl p-8 shadow-md ring-1 ring-slate-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${feature.shadowColor} ${DELAY_CLASSES[index]} ${
                  isInView
                    ? "animate-fade-in-up"
                    : "opacity-0"
                }`}
              >
                {/* Icon container */}
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ring-4 ${feature.ringColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Hover arrow indicator */}
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                  Learn more →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}