"use client";

import { useJobTracker } from "@/components/jobtracker/JobTrackerContext";
import { DonutChart, HBarChart, LineChart, VBarChart } from "@/components/jobtracker/SVGCharts";
import { TrendingUp, Percent, Award, Clock } from "lucide-react";

const statusColorMap: Record<string, string> = {
  Wishlist: "#94a3b8",
  Applied: "#3b82f6",
  "OA Received": "#06b6d4",
  Interview: "#6366f1",
  "HR Round": "#8b5cf6",
  "Technical Round": "#a855f7",
  Offer: "#10b981",
  Rejected: "#f43f5e",
  Accepted: "#16a34a",
};

export default function AnalyticsPage() {
  const { jobs, interviews } = useJobTracker();

  /* ── Donut: Status Distribution ── */
  const statusCounts = Object.entries(statusColorMap).map(([label, color]) => ({
    label,
    value: jobs.filter((j) => j.status === label).length,
    color,
  })).filter((s) => s.value > 0);

  /* ── HBar: Company Distribution ── */
  const companyCounts: Record<string, number> = {};
  jobs.forEach((j) => {
    companyCounts[j.company] = (companyCounts[j.company] || 0) + 1;
  });
  const companyData = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  /* ── Line: Applications per month ── */
  const monthCounts: Record<string, number> = {};
  jobs.forEach((j) => {
    const m = j.appliedDate.slice(0, 7); // YYYY-MM
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  });
  const monthData = Object.entries(monthCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({
      label: new Date(label + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      value,
    }));

  /* ── VBar: Monthly applications bar chart ── */
  const barColors = ["#6366f1", "#8b5cf6", "#a855f7", "#6366f1", "#8b5cf6", "#a855f7"];
  const monthBarData = monthData.map((d, i) => ({ ...d, color: barColors[i % barColors.length] }));

  /* ── Key Metrics ── */
  const totalApps = jobs.length;
  const interviewCount = interviews.length;
  const offerCount = jobs.filter((j) => j.status === "Offer" || j.status === "Accepted").length;
  const interviewRatio = totalApps > 0 ? Math.round((interviewCount / totalApps) * 100) : 0;
  const offerRate = totalApps > 0 ? Math.round((offerCount / totalApps) * 100) : 0;
  const successRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;

  const metrics = [
    {
      label: "Interview Ratio",
      value: `${interviewRatio}%`,
      desc: "Interviews / Applications",
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Offer Rate",
      value: `${offerRate}%`,
      desc: "Offers / Applications",
      icon: Award,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      desc: "Offers / Interviews",
      icon: Percent,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Avg Response",
      value: "5 days",
      desc: "Average time to hear back",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visualize your job search pipeline performance.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm"
          >
            <div className={`${m.bg} p-2 rounded-xl w-fit mb-3`}>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{m.value}</p>
            <p className="text-xs font-bold text-slate-700 mt-1">{m.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Donut */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-slate-900 mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">
            Breakdown of applications by current status.
          </p>
          <DonutChart segments={statusCounts} size={220} />
        </div>

        {/* Company Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-slate-900 mb-1">Top Companies</h3>
          <p className="text-xs text-slate-500 mb-6">
            Companies you have applied to the most.
          </p>
          <HBarChart data={companyData} />
        </div>

        {/* Application Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-slate-900 mb-1">Application Timeline</h3>
          <p className="text-xs text-slate-500 mb-6">
            Applications submitted per month.
          </p>
          <LineChart data={monthData} color="#6366f1" />
        </div>

        {/* Monthly Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-extrabold text-slate-900 mb-1">Monthly Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">
            Application volume by month.
          </p>
          <VBarChart data={monthBarData} />
        </div>
      </div>
    </div>
  );
}
