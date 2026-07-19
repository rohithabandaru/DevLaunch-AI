"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import ResumeForm from "@/components/resume/ResumeForm";
import ResumePreview from "@/components/resume/ResumePreview";

export default function ResumePage() {
  const [resume, setResume] = useState({
    fullName: "",
    email: "",
    phone: "",
    education:"",
    experience:"",
    skills: "",
    projects: [] as string[],
    hobbies: "",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-indigo-600 hover:opacity-90 transition-opacity"
          >
            DevLaunch AI
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 flex items-center gap-2">
              <span className="text-lg">←</span> Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Workspace</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            AI Resume Builder
          </h1>
          <p className="mt-2 text-slate-600">
            Fill in your details on the left, and watch your professional, ATS-friendly resume compile in real-time.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Form Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Personal Details</h2>
            <ResumeForm onChange={setResume} />
          </div>

          {/* Sticky Preview Panel */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <ResumePreview
              fullName={resume.fullName}
              email={resume.email}
              phone={resume.phone}
              education={resume.education}
              experience={resume.experience}
              skills={resume.skills}
              projects={resume.projects}
              hobbies={resume.hobbies}
            />
          </div>
        </div>
      </main>
    </div>
  );
}