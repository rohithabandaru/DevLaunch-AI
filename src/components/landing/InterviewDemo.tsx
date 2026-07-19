"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, User, CheckCircle, Sparkles } from "lucide-react";
import { useInView } from "@/hooks/useInView";

export default function InterviewDemo() {
  const { ref, isInView } = useInView();

  return (
    <section id="interview-demo" className="relative bg-slate-50 py-24 pattern-section overflow-hidden">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            AI Interview Practice
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Practice Interviews with AI
          </h2>

          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Improve your confidence by answering AI-generated interview
            questions and receive instant, actionable feedback.
          </p>
        </div>

        {/* Chat container */}
        <div
          className={`mt-16 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/50 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Interview Coach</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-slate-500">Active now</span>
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                Behavioral Round
              </span>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-6">
              {/* AI Question */}
              <div
                className={`flex gap-3 transition-all duration-500 delay-300 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                  <Bot className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-5 py-3.5 max-w-[80%]">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Tell me about yourself and your most impactful recent project. What was your role and what was the outcome?
                  </p>
                </div>
              </div>

              {/* User Answer */}
              <div
                className={`flex gap-3 justify-end transition-all duration-500 delay-500 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-5 py-3.5 max-w-[80%]">
                  <p className="text-white text-sm leading-relaxed">
                    I&apos;m a Full Stack Developer passionate about building modern
                    web applications. Recently, I led the frontend rebuild of our
                    dashboard using React and Next.js, which improved load times by 40%
                    and increased user engagement by 25%.
                  </p>
                </div>
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <User className="h-4.5 w-4.5 text-emerald-600" />
                </div>
              </div>

              {/* Typing indicator */}
              <div
                className={`flex gap-3 transition-all duration-500 delay-700 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                  <Bot className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-5 py-3.5 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-slate-400 typing-dot-1" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 typing-dot-2" />
                  <div className="h-2 w-2 rounded-full bg-slate-400 typing-dot-3" />
                </div>
              </div>
            </div>

            {/* Feedback panel */}
            <div className="border-t border-slate-100 bg-gradient-to-r from-emerald-50/50 to-white p-6">
              <div
                className={`transition-all duration-500 delay-700 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    AI Feedback
                  </h3>
                  <div className="ml-auto flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600">85/100</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mb-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 delay-800 ${
                      isInView ? "w-[85%]" : "w-0"
                    }`}
                  />
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Great answer with measurable outcomes! You effectively used the STAR method.
                  Consider adding a brief mention of the tech challenges you overcame for an even stronger response.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link href="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl hover:-translate-y-0.5">
                Start AI Interview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}