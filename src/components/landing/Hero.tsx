"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { useInView } from "@/hooks/useInView";

export default function Hero() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-50" />

      {/* Animated blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl animate-blob-1" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-violet-200/30 blur-3xl animate-blob-2" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-[350px] w-[350px] rounded-full bg-purple-200/20 blur-3xl animate-blob-3" />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 -z-10 dot-grid opacity-40" />

      {/* Badge */}
      <span
        className={`mb-6 rounded-full border border-indigo-200/60 bg-white/80 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-700 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <span className="mr-2 inline-block animate-float">🚀</span>
        Welcome to DevLaunch AI
      </span>

      {/* Heading */}
      <h1
        className={`max-w-4xl text-center text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl transition-all duration-700 delay-100 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Everything You Need To
        <span className="gradient-text block mt-2"> Land Your Dream Job</span>
      </h1>

      {/* Subheading */}
      <p
        className={`mt-6 max-w-2xl text-center text-lg text-slate-600 leading-relaxed transition-all duration-700 delay-200 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Build ATS-friendly resumes, generate stunning portfolios, track job
        applications, and prepare for interviews with AI — all in one platform.
      </p>

      {/* CTA Buttons */}
      <div
        className={`mt-10 flex gap-4 transition-all duration-700 delay-300 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <Link href="/register">
          <Button
            size="lg"
            className="glow-button bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300/50 hover:-translate-y-0.5 text-base px-8"
          >
            Get Started Free
          </Button>
        </Link>

        <a href="#features">
          <Button
            variant="outline"
            size="lg"
            className="border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300 hover:-translate-y-0.5 text-base px-8"
          >
            Learn More
          </Button>
        </a>
      </div>

      {/* Stats row */}
      <div
        className={`mt-20 flex flex-wrap justify-center gap-8 md:gap-16 text-center transition-all duration-700 delay-500 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="group">
          <AnimatedCounter
            target={9}
            suffix="+"
            duration={1500}
            className="text-4xl font-black text-indigo-600"
          />
          <p className="mt-2 text-sm font-medium text-slate-500">
            Career Tools
          </p>
        </div>

        <div className="h-12 w-px bg-slate-200 hidden md:block" />

        <div className="group">
          <AnimatedCounter
            target={5000}
            suffix="+"
            duration={2000}
            className="text-4xl font-black text-indigo-600"
          />
          <p className="mt-2 text-sm font-medium text-slate-500">
            Active Users
          </p>
        </div>

        <div className="h-12 w-px bg-slate-200 hidden md:block" />

        <div className="group">
          <p className="text-4xl font-black text-indigo-600">100%</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Free to Start
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-float">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">Scroll</span>
        <div className="h-8 w-5 rounded-full border-2 border-slate-300 flex justify-center pt-1.5">
          <div className="h-2 w-1 rounded-full bg-slate-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}