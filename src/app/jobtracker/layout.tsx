"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { JobTrackerProvider, useJobTracker } from "@/components/jobtracker/JobTrackerContext";
import type { LocationType, JobStatus } from "@/components/jobtracker/JobTrackerContext";

const tabs = [
  { label: "Board", href: "/jobtracker" },
  { label: "Analytics", href: "/jobtracker/analytics" },
  { label: "Interviews", href: "/jobtracker/interviews" },
  { label: "Documents", href: "/jobtracker/documents" },
  { label: "AI Tools", href: "/jobtracker/ai" },
];

function LayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    searchQuery,
    setSearchQuery,
    locationFilter,
    setLocationFilter,
    statusFilter,
    setStatusFilter,
  } = useJobTracker();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-indigo-600 hover:opacity-90 transition-opacity"
          >
            DevLaunch AI
          </Link>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-slate-600 hover:text-indigo-600 flex items-center gap-2"
            >
              <span className="text-lg">&larr;</span> Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Sub-navigation tabs + filters */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                    active
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Filters bar */}
          <div className="flex flex-wrap items-center gap-3 py-3 border-t border-slate-100">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Location filter */}
            <div className="flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              {(["All", "Remote", "Hybrid", "Onsite"] as const).map((lt) => (
                <button
                  key={lt}
                  onClick={() => setLocationFilter(lt as LocationType | "All")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    locationFilter === lt
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {lt}
                </button>
              ))}
            </div>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | "All")}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold bg-white text-slate-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Wishlist">Wishlist</option>
              <option value="Applied">Applied</option>
              <option value="OA Received">OA Received</option>
              <option value="Interview">Interview</option>
              <option value="HR Round">HR Round</option>
              <option value="Technical Round">Technical Round</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Accepted">Accepted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

export default function JobTrackerLayout({ children }: { children: ReactNode }) {
  return (
    <JobTrackerProvider>
      <LayoutInner>{children}</LayoutInner>
    </JobTrackerProvider>
  );
}
