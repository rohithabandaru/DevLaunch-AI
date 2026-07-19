"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useJobTracker } from "@/components/jobtracker/JobTrackerContext";
import type { Job, JobStatus, LocationType } from "@/components/jobtracker/JobTrackerContext";
import StatsCards from "@/components/jobtracker/StatsCards";
import JobCard from "@/components/jobtracker/JobCard";
import JobDetailPanel from "@/components/jobtracker/JobDetailPanel";

const columns: JobStatus[] = [
  "Wishlist",
  "Applied",
  "OA Received",
  "Interview",
  "HR Round",
  "Technical Round",
  "Offer",
  "Rejected",
  "Accepted",
];

const columnAccentColors: Record<JobStatus, string> = {
  Wishlist: "border-t-slate-400",
  Applied: "border-t-blue-500",
  "OA Received": "border-t-cyan-500",
  Interview: "border-t-indigo-500",
  "HR Round": "border-t-violet-500",
  "Technical Round": "border-t-purple-500",
  Offer: "border-t-emerald-500",
  Rejected: "border-t-rose-500",
  Accepted: "border-t-green-600",
};

export default function JobTrackerBoard() {
  const { filteredJobs, addJob, updateJob, deleteJob } = useJobTracker();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  /* ── New Job Form State ── */
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newLocationType, setNewLocationType] = useState<LocationType>("Onsite");
  const [newJobLink, setNewJobLink] = useState("");
  const [newReferral, setNewReferral] = useState("");
  const [newStatus, setNewStatus] = useState<JobStatus>("Wishlist");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newDeadline, setNewDeadline] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;
    addJob({
      company: newCompany,
      role: newRole,
      salary: newSalary || undefined,
      location: newLocation || undefined,
      locationType: newLocationType,
      jobLink: newJobLink || undefined,
      referral: newReferral || undefined,
      status: newStatus,
      appliedDate: newDate,
      deadline: newDeadline || undefined,
      notes: newNotes || undefined,
    });
    resetForm();
  };

  const resetForm = () => {
    setNewCompany("");
    setNewRole("");
    setNewSalary("");
    setNewLocation("");
    setNewLocationType("Onsite");
    setNewJobLink("");
    setNewReferral("");
    setNewStatus("Wishlist");
    setNewDate(new Date().toISOString().split("T")[0]);
    setNewDeadline("");
    setNewNotes("");
    setShowAddForm(false);
  };

  const moveJob = (id: string, direction: "left" | "right") => {
    const job = filteredJobs.find((j) => j.id === id);
    if (!job) return;
    const idx = columns.indexOf(job.status);
    const next = idx + (direction === "right" ? 1 : -1);
    if (next < 0 || next >= columns.length) return;
    updateJob(id, { status: columns[next] });
  };

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <StatsCards />

      {/* Title + Add */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Application Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag cards across columns or use the arrows to progress your pipeline.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 shrink-0 flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </div>

      {/* Add Job Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddJob}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md animate-fade-in"
        >
          <h3 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">
            New Job Application
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Company *</label>
              <input
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="e.g. Google"
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Role *</label>
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Salary</label>
              <input
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                placeholder="e.g. ₹18,00,000"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
              <input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
              <select
                value={newLocationType}
                onChange={(e) => setNewLocationType(e.target.value as LocationType)}
                className="w-full rounded-lg border border-slate-200 p-2.5 bg-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as JobStatus)}
                className="w-full rounded-lg border border-slate-200 p-2.5 bg-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Applied Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Deadline</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Job Link</label>
              <input
                value={newJobLink}
                onChange={(e) => setNewJobLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Referral</label>
              <input
                value={newReferral}
                onChange={(e) => setNewReferral(e.target.value)}
                placeholder="Referral contact"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-600 mb-1">Notes</label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Details, links, preparation notes..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Add Job
            </Button>
          </div>
        </form>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200">
        {columns.map((col) => {
          const colJobs = filteredJobs.filter((j) => j.status === col);
          return (
            <div
              key={col}
              className={`bg-slate-100/80 rounded-2xl border border-slate-200/50 border-t-2 ${columnAccentColors[col]} p-3 flex flex-col w-[260px] shrink-0 min-h-[420px]`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  {col}
                </h3>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {colJobs.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colJobs.length > 0 ? (
                  colJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      columns={columns}
                      onMove={moveJob}
                      onDelete={deleteJob}
                      onSelect={setSelectedJob}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-[10px] text-slate-400 font-medium">No applications</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
