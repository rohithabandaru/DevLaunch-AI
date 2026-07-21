"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Field from "@/components/resume/Field";
import FormSection from "@/components/resume/FormSection";
import { createEmptyProject } from "@/lib/resume";
import type { ProjectEntry, ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
};

export default function ProjectsStep({ data, onChange }: Props) {
  function updateEntry(id: string, patch: Partial<ProjectEntry>) {
    onChange({
      projects: data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function removeEntry(id: string) {
    if (data.projects.length <= 1) {
      onChange({ projects: [createEmptyProject()] });
      return;
    }
    onChange({ projects: data.projects.filter((p) => p.id !== id) });
  }

  function addEntry() {
    onChange({ projects: [...data.projects, createEmptyProject()] });
  }

  return (
    <FormSection
      title="Projects"
      description="Showcase impactful projects. Include technologies and outcomes that mirror job requirements."
      action={
        <Button type="button" variant="outline" size="sm" onClick={addEntry} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add project
        </Button>
      }
    >
      <div className="space-y-6">
        {data.projects.map((entry, index) => (
          <div
            key={entry.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Project {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEntry(entry.id)}
                className="h-8 gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project Name" htmlFor={`proj-name-${entry.id}`} required>
                <Input
                  id={`proj-name-${entry.id}`}
                  value={entry.name}
                  onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                  placeholder="DevLaunch Job Tracker"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="Link" htmlFor={`proj-link-${entry.id}`}>
                <Input
                  id={`proj-link-${entry.id}`}
                  type="url"
                  value={entry.link}
                  onChange={(e) => updateEntry(entry.id, { link: e.target.value })}
                  placeholder="https://github.com/…"
                  className="h-10 bg-white"
                />
              </Field>

              <Field
                label="Technologies"
                htmlFor={`proj-tech-${entry.id}`}
                className="sm:col-span-2"
              >
                <Input
                  id={`proj-tech-${entry.id}`}
                  value={entry.technologies}
                  onChange={(e) => updateEntry(entry.id, { technologies: e.target.value })}
                  placeholder="React, TypeScript, Supabase"
                  className="h-10 bg-white"
                />
              </Field>

              <Field
                label="Description"
                htmlFor={`proj-desc-${entry.id}`}
                required
                className="sm:col-span-2"
                hint="What you built, your role, and measurable results."
              >
                <Textarea
                  id={`proj-desc-${entry.id}`}
                  value={entry.description}
                  onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                  placeholder="Built a full-stack job application tracker with Kanban boards and analytics. Reduced manual tracking time by 60% for beta users."
                  rows={3}
                  className="min-h-20 resize-y bg-white text-sm leading-relaxed"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
