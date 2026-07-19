"use client";

import { Briefcase, Clock, Gift, XCircle, CalendarDays } from "lucide-react";
import { useJobTracker } from "./JobTrackerContext";

export default function StatsCards() {
  const { jobs, interviews } = useJobTracker();

  const total = jobs.length;
  const pending = jobs.filter((j) =>
    ["Applied", "OA Received", "Interview", "HR Round", "Technical Round"].includes(j.status)
  ).length;
  const offers = jobs.filter((j) => j.status === "Offer" || j.status === "Accepted").length;
  const rejections = jobs.filter((j) => j.status === "Rejected").length;
  const upcoming = interviews.filter((i) => i.result === "Pending").length;

  const cards = [
    {
      label: "Total Applications",
      value: total,
      icon: Briefcase,
      gradient: "from-indigo-500 to-blue-500",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      label: "In Progress",
      value: pending,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Offers",
      value: offers,
      icon: Gift,
      gradient: "from-emerald-500 to-green-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Rejections",
      value: rejections,
      icon: XCircle,
      gradient: "from-rose-500 to-pink-500",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
    {
      label: "Upcoming Interviews",
      value: upcoming,
      icon: CalendarDays,
      gradient: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${c.bg} p-2 rounded-xl`}>
              <c.icon className={`h-4 w-4 ${c.text}`} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {c.value}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
