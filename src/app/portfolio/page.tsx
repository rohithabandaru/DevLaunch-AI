import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PortfolioBuilder from "@/components/portfolio/PortfolioBuilder";

export const metadata: Metadata = {
  title: "Portfolio Builder — DevLaunch AI",
  description:
    "Build a modern portfolio website with live preview, AI generators, templates, custom colors, fonts, animations, and one-click export to HTML, ZIP, or Vercel.",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
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

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100">
              <Globe className="h-3.5 w-3.5" />
              Workspace
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 ring-1 ring-violet-100">
              <Sparkles className="h-3.5 w-3.5" />
              Framer-style builder
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Portfolio Builder
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Design a professional site with Hero, About, Education, Experience,
            Projects, Skills, Certificates, Services, Testimonials, Contact, and
            Social Links — plus live preview, templates, AI generators, themes,
            fonts, animations, HTML/ZIP export, and Vercel deploy.
          </p>
        </div>

        <PortfolioBuilder />
      </main>
    </div>
  );
}
