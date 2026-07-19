"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useJobTracker } from "@/components/jobtracker/JobTrackerContext";
import type { InterviewRound, InterviewResult } from "@/components/jobtracker/JobTrackerContext";

const roundColors: Record<InterviewRound, string> = {
  HR: "bg-violet-50 text-violet-600",
  Technical: "bg-indigo-50 text-indigo-600",
  "System Design": "bg-blue-50 text-blue-600",
  Behavioral: "bg-amber-50 text-amber-600",
  Coding: "bg-purple-50 text-purple-600",
  Managerial: "bg-teal-50 text-teal-600",
};

const resultIcons: Record<InterviewResult, { icon: typeof CheckCircle2; color: string }> = {
  Passed: { icon: CheckCircle2, color: "text-emerald-500" },
  Failed: { icon: XCircle, color: "text-rose-500" },
  Pending: { icon: AlertCircle, color: "text-amber-500" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function InterviewsPage() {
  const { interviews, jobs, addInterview, deleteInterview } = useJobTracker();
  const [nowTime] = useState(() => Date.now());
  const [showForm, setShowForm] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  /* ── Form State ── */
  const [formJobId, setFormJobId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formRound, setFormRound] = useState<InterviewRound>("Technical");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const job = jobs.find((j) => j.id === formJobId);
    if (!job || !formDate || !formTime) return;
    addInterview({
      jobId: job.id,
      company: job.company,
      role: job.role,
      date: formDate,
      time: formTime,
      round: formRound,
      result: "Pending",
    });
    setShowForm(false);
    setFormJobId("");
    setFormDate("");
    setFormTime("");
  };

  /* ── Calendar helpers ── */
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const interviewDates = new Set(interviews.map((i) => i.date));

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const upcoming = interviews
    .filter((i) => i.result === "Pending" && i.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = interviews
    .filter((i) => i.result !== "Pending" || i.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - nowTime;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track upcoming interviews and view past performance.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 shrink-0 flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      {/* Add Interview Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md animate-fade-in"
        >
          <h3 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">
            Schedule New Interview
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Job Application *</label>
              <select
                value={formJobId}
                onChange={(e) => setFormJobId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 bg-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select a job...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Date *</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Time *</label>
              <input
                type="text"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                placeholder="e.g. 2:00 PM"
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Round</label>
              <select
                value={formRound}
                onChange={(e) => setFormRound(e.target.value as InterviewRound)}
                className="w-full rounded-lg border border-slate-200 p-2.5 bg-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="HR">HR</option>
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Coding">Coding</option>
                <option value="Managerial">Managerial</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Schedule
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Calendar */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm">
              {new Date(calYear, calMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasInterview = interviewDates.has(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={day}
                  className={`relative text-center py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isToday
                      ? "bg-indigo-600 text-white"
                      : hasInterview
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {day}
                  {hasInterview && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-indigo-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interview Lists */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-600" /> Upcoming Interviews
            </h3>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((iv) => {
                  const daysLeft = getDaysUntil(iv.date);
                  return (
                    <div
                      key={iv.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-1.5">
                        <p className="font-extrabold text-slate-900 text-sm">
                          {iv.company} — {iv.role}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roundColors[iv.round]}`}>
                            {iv.round}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                            <CalendarDays className="h-2.5 w-2.5" /> {iv.date}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> {iv.time}
                          </span>
                        </div>
                        {daysLeft >= 0 && (
                          <p className={`text-[10px] font-bold ${daysLeft <= 2 ? "text-rose-600" : "text-amber-600"}`}>
                            {daysLeft === 0 ? "🔴 Today!" : `⏰ In ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteInterview(iv.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center">
                <p className="text-xs text-slate-400 font-medium">No upcoming interviews scheduled.</p>
              </div>
            )}
          </div>

          {/* Past */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" /> Past Interviews
            </h3>
            {past.length > 0 ? (
              <div className="space-y-3">
                {past.map((iv) => {
                  const ResultIcon = resultIcons[iv.result].icon;
                  const resultColor = resultIcons[iv.result].color;
                  return (
                    <div
                      key={iv.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">
                            {iv.company} — {iv.role}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roundColors[iv.round]}`}>
                              {iv.round}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">{iv.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <ResultIcon className={`h-4 w-4 ${resultColor}`} />
                          <span className={`text-xs font-bold ${resultColor}`}>{iv.result}</span>
                        </div>
                      </div>
                      {iv.feedback && (
                        <p className="text-[11px] text-slate-600 border-t border-slate-100 pt-2 leading-relaxed">
                          {iv.feedback}
                        </p>
                      )}
                      {iv.score !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-slate-700">{iv.score}/10</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center">
                <p className="text-xs text-slate-400 font-medium">No past interviews.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
