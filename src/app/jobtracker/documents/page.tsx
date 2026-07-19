"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Trash2,
  Plus,
  CheckCircle2,
  ExternalLink,
  Award,
  Link2,
  File,
  Mail,
} from "lucide-react";
import { useJobTracker } from "@/components/jobtracker/JobTrackerContext";
import type { Document } from "@/components/jobtracker/JobTrackerContext";

type DocType = Document["type"];

const typeConfig: Record<DocType, { icon: typeof FileText; color: string; bg: string }> = {
  Resume: { icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  "Cover Letter": { icon: Mail, color: "text-violet-600", bg: "bg-violet-50" },
  Certificate: { icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
  "Offer Letter": { icon: File, color: "text-emerald-600", bg: "bg-emerald-50" },
  "Portfolio Link": { icon: Link2, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument, setActiveResume } = useJobTracker();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState<DocType>("Resume");
  const [uploadCompany, setUploadCompany] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName) return;
    addDocument({
      name: uploadName,
      type: uploadType,
      company: uploadCompany || undefined,
      uploadedAt: new Date().toISOString().split("T")[0],
      isActive: uploadType === "Resume" ? false : undefined,
      url: uploadUrl || undefined,
    });
    setUploadName("");
    setUploadType("Resume");
    setUploadCompany("");
    setUploadUrl("");
    setShowUpload(false);
  };

  const grouped: Record<DocType, Document[]> = {
    Resume: [],
    "Cover Letter": [],
    Certificate: [],
    "Offer Letter": [],
    "Portfolio Link": [],
  };
  documents.forEach((d) => {
    grouped[d.type].push(d);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Documents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage resumes, cover letters, certificates, and portfolio links.
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-indigo-600 hover:bg-indigo-700 shrink-0 flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus className="h-4 w-4" /> Add Document
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <form
          onSubmit={handleUpload}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md animate-fade-in"
        >
          <h3 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">
            Add New Document
          </h3>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-colors ${
              dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) setUploadName(file.name);
            }}
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              Drag and drop a file here, or enter details below
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Document Name *</label>
              <input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g. Resume_v3.pdf"
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as DocType)}
                className="w-full rounded-lg border border-slate-200 p-2.5 bg-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Resume">Resume</option>
                <option value="Cover Letter">Cover Letter</option>
                <option value="Certificate">Certificate</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Portfolio Link">Portfolio Link</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Company (optional)</label>
              <input
                value={uploadCompany}
                onChange={(e) => setUploadCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {uploadType === "Portfolio Link" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">URL</label>
                <input
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Add
            </Button>
          </div>
        </form>
      )}

      {/* Document Sections */}
      {(Object.entries(grouped) as [DocType, Document[]][]).map(([type, docs]) => {
        const config = typeConfig[type];
        const Icon = config.icon;
        return (
          <div key={type}>
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <div className={`${config.bg} p-1.5 rounded-lg`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              {type === "Portfolio Link" ? "Portfolio Links" : `${type}s`}
              <span className="text-xs text-slate-400 font-medium ml-1">({docs.length})</span>
            </h3>

            {docs.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-bold text-slate-900 text-sm truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {doc.company && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                            {doc.company}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">{doc.uploadedAt}</span>
                      </div>
                      {doc.isActive && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Active
                        </span>
                      )}
                      {type === "Resume" && !doc.isActive && (
                        <button
                          onClick={() => setActiveResume(doc.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:underline"
                        >
                          Set as Active
                        </button>
                      )}
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 hover:underline"
                        >
                          <ExternalLink className="h-2.5 w-2.5" /> Open Link
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  No {type.toLowerCase()}s added yet.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
