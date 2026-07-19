"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";

export default function CTA() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 py-28 text-white">
      {/* Dynamic abstract grid pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.03] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" />

      {/* Decorative radial glows */}
      <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl animate-blob-1" />
      <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-3xl animate-blob-2" />

      {/* Glassmorphic decorative floating shapes */}
      <div className="absolute top-12 right-[15%] h-12 w-12 rounded-xl bg-white/5 border border-white/10 blur-[1px] rotate-12 animate-float hidden md:block" />
      <div className="absolute bottom-12 left-[15%] h-16 w-16 rounded-full bg-white/5 border border-white/10 blur-[1px] animate-float-slow hidden md:block" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2
          className={`text-4xl font-extrabold tracking-tight text-white md:text-6xl transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Ready to Land Your
          <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-white bg-clip-text text-transparent"> Dream Job?</span>
        </h2>

        <p
          className={`mt-6 text-lg md:text-xl text-indigo-100/90 leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-150 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Join thousands of developers using DevLaunch AI to build resumes,
          generate portfolios, track applications, and prepare for interviews.
        </p>

        <div
          className={`mt-10 flex flex-col justify-center gap-4 sm:flex-row transition-all duration-700 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-slate-50 shadow-2xl shadow-indigo-950/40 hover:shadow-indigo-950/60 transition-all duration-300 hover:-translate-y-0.5 px-8 text-base font-bold"
            >
              Get Started Free
            </Button>
          </Link>

          <a href="#features">
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5 px-8 text-base"
            >
              Learn More
            </Button>
          </a>
        </div>

        {/* Small stats helper */}
        <p
          className={`mt-12 text-xs font-semibold uppercase tracking-wider text-indigo-200/60 transition-all duration-700 delay-500 ${
            isInView ? "opacity-100" : "opacity-0"
          }`}
        >
          No credit card required · Free tier forever
        </p>
      </div>
    </section>
  );
}