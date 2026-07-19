"use client";

import { useState } from "react";
import { X, Save, ExternalLink, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job, JobStatus, LocationType } from "./JobTrackerContext";
import { useJobTracker } from "./JobTrackerContext";

const allStatuses: JobStatus[] = [
  "Wishlist", "Applied", "OA Received", "Interview",
  "HR Round", "Technical Round", "Offer", "Rejected", "Accepted",
];

const allLocationTypes: LocationType[] = ["Remote", "Hybrid", "Onsite"];

export default function JobDetailPanel({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const { updateJob, deleteJob } = useJobTracker();

  const [company, setCompany] = useState(job.company);
  const [role, setRole] = useState(job.role);
  const [salary, setSalary] = useState(job.salary ?? "");
  const [location, setLocation] = useState(job.location ?? "");
  const [locationType, setLocationType] = useState<LocationType>(job.locationType);
  const [jobLink, setJobLink] = useState(job.jobLink ?? "");
  const [referral, setReferral] = useState(job.referral ?? "");
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [appliedDate, setAppliedDate] = useState(job.appliedDate);
  const [deadline, setDeadline] = useState(job.deadline ?? "");
  const [notes, setNotes] = useState(job.notes ?? "");

  const handleSave = () => {
    updateJob(job.id, {
      company,
      role,
      salary: salary || undefined,
      location: location || undefined,
      locationType,
      jobLink: jobLink || undefined,
      referral: referral || undefined,
      status,
      appliedDate,
      deadline: deadline || undefined,
      notes: notes || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteJob(job.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Job Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">Edit and manage this application</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Role</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Salary</label>
              <input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. ₹18,00,000"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Location Type</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as LocationType)}
                className="w-full rounded-lg border border-slate-200 p-2.5 bg-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                {allLocationTypes.map((lt) => (
                  <option key={lt} value={lt}>{lt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full rounded-lg border border-slate-200 p-2.5 bg-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <Calendar className="h-3 w-3 inline mr-1" />Applied Date
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <Calendar className="h-3 w-3 inline mr-1" />Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              <ExternalLink className="h-3 w-3 inline mr-1" />Job Link
            </label>
            <input
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              <UserCheck className="h-3 w-3 inline mr-1" />Referral
            </label>
            <input
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              placeholder="Referral contact name"
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, preparation notes..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-200 shrink-0 bg-slate-50/50">
          <Button
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
            onClick={handleDelete}
          >
            Delete Application
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1" /> Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
