"use client";

import { UserPlus, FileText, Globe, Briefcase } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    title: "Create Account",
    description: "Sign up in less than a minute with email or social login.",
    icon: UserPlus,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Build Resume",
    description: "Generate an ATS-friendly resume powered by AI suggestions.",
    icon: FileText,
    color: "from-violet-500 to-violet-600",
  },
  {
    title: "Create Portfolio",
    description: "Build your personal portfolio website in a single click.",
    icon: Globe,
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Apply for Jobs",
    description: "Track applications and practice interviews to land offers.",
    icon: Briefcase,
    color: "from-indigo-600 to-violet-600",
  },
];

export default function HowItWorks() {
  const { ref, isInView } = useInView();

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            How It Works
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Four Steps to Success
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Get job-ready in four simple steps.
          </p>
        </div>

        {/* Timeline grid */}
        <div className="mt-16 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[72px] left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-[2px]">
            <div
              className={`h-full bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 rounded-full transition-all duration-1000 delay-300 ${
                isInView ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              } origin-left`}
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const delays = [
                "delay-100",
                "delay-200",
                "delay-300",
                "delay-400",
              ];

              return (
                <div
                  key={step.title}
                  className={`relative text-center group ${delays[index]} ${
                    isInView ? "animate-fade-in-up" : "opacity-0"
                  }`}
                >
                  {/* Step number + icon */}
                  <div className="relative mx-auto mb-6">
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600 ring-2 ring-indigo-200 shadow-sm">
                      {index + 1}
                    </div>

                    {/* Icon circle */}
                    <div
                      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-[200px] mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}