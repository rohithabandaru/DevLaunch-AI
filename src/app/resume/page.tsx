import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumeBuilder from "@/components/resume/ResumeBuilder";

export const metadata: Metadata = {
  title: "ATS Resume Builder — DevLaunch AI",
  description:
    "Build a professional, ATS-friendly resume with a guided multi-step form and live preview.",
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Navigation — hidden in print */}
      <header className="print:hidden sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-indigo-600 transition-opacity hover:opacity-90"
          >
            DevLaunch AI
          </Link>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 print:max-w-none print:p-0">
        <div className="print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100">
              <FileText className="h-3.5 w-3.5" />
              Workspace
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            ATS Resume Builder
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Complete each step of the professional form. Your resume updates live
            in a clean, single-column layout that applicant tracking systems can parse.
          </p>
        </div>

        <div className="mt-8 print:mt-0">
          <ResumeBuilder />
        </div>
      </main>
    </div>
  );
}
