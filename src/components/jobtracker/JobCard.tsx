"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserCheck,
  FileText,
} from "lucide-react";
import type { Job, JobStatus } from "./JobTrackerContext";

const statusColors: Record<JobStatus, string> = {
  Wishlist: "bg-slate-100 text-slate-600",
  Applied: "bg-blue-50 text-blue-600",
  "OA Received": "bg-cyan-50 text-cyan-600",
  Interview: "bg-indigo-50 text-indigo-600",
  "HR Round": "bg-violet-50 text-violet-600",
  "Technical Round": "bg-purple-50 text-purple-600",
  Offer: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-rose-50 text-rose-600",
  Accepted: "bg-green-50 text-green-700",
};

const locationColors: Record<string, string> = {
  Remote: "bg-teal-50 text-teal-600 border-teal-100",
  Hybrid: "bg-amber-50 text-amber-600 border-amber-100",
  Onsite: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function JobCard({
  job,
  columns,
  onMove,
  onDelete,
  onSelect,
}: {
  job: Job;
  columns: JobStatus[];
  onMove: (id: string, dir: "left" | "right") => void;
  onDelete: (id: string) => void;
  onSelect: (job: Job) => void;
}) {
  const [nowTime] = useState(() => Date.now());
  const colIdx = columns.indexOf(job.status);
  const isFirst = colIdx <= 0;
  const isLast = colIdx >= columns.length - 1;

  /* Days until deadline */
  let daysLeft: number | null = null;
  if (job.deadline) {
    const diff = new Date(job.deadline).getTime() - nowTime;
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div
      className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3 group hover:border-indigo-200 transition-all hover:shadow-md animate-fade-in cursor-pointer"
      onClick={() => onSelect(job)}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-extrabold text-slate-900 text-sm leading-snug truncate">
              {job.role}
            </h4>
            <p className="text-slate-500 text-xs font-semibold mt-0.5 truncate">
              {job.company}
            </p>
          </div>
          <span
            className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${locationColors[job.locationType]}`}
          >
            {job.locationType}
          </span>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {job.salary && (
            <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">
              {job.salary}
            </span>
          )}
          {job.location && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-semibold">
              <MapPin className="h-2.5 w-2.5" />
              {job.location}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-semibold">
            <Calendar className="h-2.5 w-2.5" />
            {job.appliedDate}
          </span>
        </div>

        {/* Deadline warning */}
        {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
          <p className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 inline-block">
            ⏰ Deadline in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
          </p>
        )}

        {/* Referral */}
        {job.referral && (
          <p className="mt-2 text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
            <UserCheck className="h-2.5 w-2.5" /> Referral: {job.referral}
          </p>
        )}

        {/* Notes */}
        {job.notes && (
          <p className="mt-2 text-slate-600 text-[11px] leading-relaxed border-t border-slate-50 pt-2 flex items-start gap-1">
            <FileText className="h-3 w-3 shrink-0 text-slate-400 mt-0.5" />
            <span className="line-clamp-2" title={job.notes}>
              {job.notes}
            </span>
          </p>
        )}
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-between border-t border-slate-100 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(job.id)}
            className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {job.jobLink && (
            <a
              href={job.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
              title="Open Job Link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={isFirst}
            onClick={() => onMove(job.id, "left")}
            className="p-1 rounded bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={isLast}
            onClick={() => onMove(job.id, "right")}
            className="p-1 rounded bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { statusColors, locationColors };
