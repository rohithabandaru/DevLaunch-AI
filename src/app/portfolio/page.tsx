"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PortfolioBuilder() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState<{ name: string; desc: string }[]>([
    { name: "", desc: "" },
  ]);

  const handleAddProject = () => {
    setProjects([...projects, { name: "", desc: "" }]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index: number, field: "name" | "desc", value: string) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const skillsList = skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

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
            AI Portfolio Builder
          </h1>
          <p className="mt-2 text-slate-600">
            Generate and customize your professional personal website live.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Form Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Website Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700">Professional Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700">Short Bio</label>
                <textarea
                  placeholder="Describe your passion, experiences, and goals..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js, Python"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block font-medium text-slate-700">Featured Projects</label>
                {projects.map((proj, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-500">Project #{idx + 1}</span>
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={proj.name}
                      onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none"
                    />
                    <textarea
                      placeholder="Short description of your project..."
                      rows={2}
                      value={proj.desc}
                      onChange={(e) => handleProjectChange(idx, "desc", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProject}
                  className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                >
                  + Add Project
                </Button>
              </div>
            </div>
            
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => alert("Website Generated and Published!")}
            >
              Publish Portfolio
            </Button>
          </div>

          {/* Website Mock Live Preview */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-[650px] animate-fade-in">
              {/* Window controls Header */}
              <div className="bg-slate-950 px-4 py-3 flex items-center gap-2 border-b border-slate-800 shrink-0">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-500 text-xs font-mono ml-4">
                  {fullName ? `${fullName.toLowerCase().replace(/\s+/g, "")}.dev` : "your-portfolio.dev"}
                </span>
              </div>

              {/* Window Content */}
              <div className="bg-white text-slate-800 flex-1 overflow-y-auto font-sans p-6 md:p-10 space-y-12">
                {/* Mock Nav */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="font-bold text-indigo-600 text-lg">
                    {fullName ? fullName.split(" ")[0] : "Developer"}
                  </span>
                  <div className="flex gap-4 text-xs font-medium text-slate-500">
                    <span>About</span>
                    <span>Skills</span>
                    <span>Projects</span>
                  </div>
                </div>

                {/* Hero Header */}
                <div className="text-center md:text-left space-y-4">
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                    Hello, I am
                  </span>
                  <h3 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    {fullName || "Your Name"}
                  </h3>
                  <p className="text-lg font-medium text-indigo-600">
                    {role || "Your Role / Profession"}
                  </p>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base max-w-xl">
                    {bio || "Your short bio description will go here. Introduce yourself to visitors!"}
                  </p>
                </div>

                {/* Skills tags */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    My Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.length > 0 ? (
                      skillsList.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm">Add skills on the left to see them here.</span>
                    )}
                  </div>
                </div>

                {/* Projects grid */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Featured Projects
                  </h4>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {projects.some((p) => p.name.trim() || p.desc.trim()) ? (
                      projects.map((proj, i) => (
                        (proj.name.trim() || proj.desc.trim()) && (
                          <div key={i} className="border border-slate-100 bg-slate-50/50 rounded-xl p-5 hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all duration-300">
                            <h5 className="font-bold text-slate-900 text-base">{proj.name || "Untitled Project"}</h5>
                            <p className="mt-2 text-slate-600 text-xs leading-relaxed">{proj.desc || "Project description goes here."}</p>
                          </div>
                        )
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm col-span-2">Add project details to display cards here.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
