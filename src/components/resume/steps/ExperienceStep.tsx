"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Field from "@/components/resume/Field";
import FormSection from "@/components/resume/FormSection";
import { createEmptyExperience } from "@/lib/resume";
import type { ExperienceEntry, ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
};

export default function ExperienceStep({ data, onChange }: Props) {
  function updateEntry(id: string, patch: Partial<ExperienceEntry>) {
    onChange({
      experience: data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  }

  function removeEntry(id: string) {
    if (data.experience.length <= 1) {
      onChange({ experience: [createEmptyExperience()] });
      return;
    }
    onChange({ experience: data.experience.filter((e) => e.id !== id) });
  }

  function addEntry() {
    onChange({ experience: [...data.experience, createEmptyExperience()] });
  }

  return (
    <FormSection
      title="Work Experience"
      description="List roles reverse-chronologically. Use bullet-style achievements with metrics when possible."
      action={
        <Button type="button" variant="outline" size="sm" onClick={addEntry} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add role
        </Button>
      }
    >
      <div className="space-y-6">
        {data.experience.map((entry, index) => (
          <div
            key={entry.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Role {index + 1}
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
              <Field label="Job Title" htmlFor={`role-${entry.id}`} required>
                <Input
                  id={`role-${entry.id}`}
                  value={entry.role}
                  onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                  placeholder="Software Engineer"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="Company" htmlFor={`company-${entry.id}`} required>
                <Input
                  id={`company-${entry.id}`}
                  value={entry.company}
                  onChange={(e) => updateEntry(entry.id, { company: e.target.value })}
                  placeholder="Acme Inc."
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="Location" htmlFor={`loc-${entry.id}`}>
                <Input
                  id={`loc-${entry.id}`}
                  value={entry.location}
                  onChange={(e) => updateEntry(entry.id, { location: e.target.value })}
                  placeholder="Remote / New York, NY"
                  className="h-10 bg-white"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start" htmlFor={`start-${entry.id}`}>
                  <Input
                    id={`start-${entry.id}`}
                    value={entry.startDate}
                    onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })}
                    placeholder="Jan 2022"
                    className="h-10 bg-white"
                  />
                </Field>
                <Field label="End" htmlFor={`end-${entry.id}`}>
                  <Input
                    id={`end-${entry.id}`}
                    value={entry.current ? "Present" : entry.endDate}
                    onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })}
                    placeholder="Dec 2024"
                    disabled={entry.current}
                    className="h-10 bg-white"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={entry.current}
                  onChange={(e) =>
                    updateEntry(entry.id, {
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : entry.endDate,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                I currently work here
              </label>

              <Field
                label="Achievements & responsibilities"
                htmlFor={`desc-${entry.id}`}
                required
                className="sm:col-span-2"
                hint="One achievement per line. Start with action verbs (Built, Led, Improved…)."
              >
                <Textarea
                  id={`desc-${entry.id}`}
                  value={entry.description}
                  onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                  placeholder={"Built REST APIs serving 50k+ daily users\nReduced page load time by 40%\nMentored 3 junior engineers"}
                  rows={4}
                  className="min-h-24 resize-y bg-white text-sm leading-relaxed"
                />
              </Field>
            </div>

            {index < data.experience.length - 1 && (
              <Separator className="mt-5" />
            )}
          </div>
        ))}
      </div>
    </FormSection>
  );
}
