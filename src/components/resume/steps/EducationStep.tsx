"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Field from "@/components/resume/Field";
import FormSection from "@/components/resume/FormSection";
import { createEmptyEducation } from "@/lib/resume";
import type { EducationEntry, ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
};

export default function EducationStep({ data, onChange }: Props) {
  function updateEntry(id: string, patch: Partial<EducationEntry>) {
    onChange({
      education: data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  }

  function removeEntry(id: string) {
    if (data.education.length <= 1) {
      onChange({ education: [createEmptyEducation()] });
      return;
    }
    onChange({ education: data.education.filter((e) => e.id !== id) });
  }

  function addEntry() {
    onChange({ education: [...data.education, createEmptyEducation()] });
  }

  return (
    <FormSection
      title="Education"
      description="Include degrees, bootcamps, or relevant coursework. GPA is optional."
      action={
        <Button type="button" variant="outline" size="sm" onClick={addEntry} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add education
        </Button>
      }
    >
      <div className="space-y-6">
        {data.education.map((entry, index) => (
          <div
            key={entry.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Education {index + 1}
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
              <Field label="School / University" htmlFor={`school-${entry.id}`} required className="sm:col-span-2">
                <Input
                  id={`school-${entry.id}`}
                  value={entry.school}
                  onChange={(e) => updateEntry(entry.id, { school: e.target.value })}
                  placeholder="Stanford University"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="Degree" htmlFor={`degree-${entry.id}`} required>
                <Input
                  id={`degree-${entry.id}`}
                  value={entry.degree}
                  onChange={(e) => updateEntry(entry.id, { degree: e.target.value })}
                  placeholder="B.S. / M.S. / Bootcamp"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="Field of Study" htmlFor={`field-${entry.id}`}>
                <Input
                  id={`field-${entry.id}`}
                  value={entry.field}
                  onChange={(e) => updateEntry(entry.id, { field: e.target.value })}
                  placeholder="Computer Science"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="Location" htmlFor={`edu-loc-${entry.id}`}>
                <Input
                  id={`edu-loc-${entry.id}`}
                  value={entry.location}
                  onChange={(e) => updateEntry(entry.id, { location: e.target.value })}
                  placeholder="Stanford, CA"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="GPA" htmlFor={`gpa-${entry.id}`}>
                <Input
                  id={`gpa-${entry.id}`}
                  value={entry.gpa}
                  onChange={(e) => updateEntry(entry.id, { gpa: e.target.value })}
                  placeholder="3.8 / 4.0"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="Start" htmlFor={`edu-start-${entry.id}`}>
                <Input
                  id={`edu-start-${entry.id}`}
                  value={entry.startDate}
                  onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })}
                  placeholder="2018"
                  className="h-10 bg-white"
                />
              </Field>

              <Field label="End / Graduation" htmlFor={`edu-end-${entry.id}`}>
                <Input
                  id={`edu-end-${entry.id}`}
                  value={entry.endDate}
                  onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })}
                  placeholder="2022"
                  className="h-10 bg-white"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
