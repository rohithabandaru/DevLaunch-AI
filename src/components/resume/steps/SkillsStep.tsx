"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Field from "@/components/resume/Field";
import FormSection from "@/components/resume/FormSection";
import { parseSkillsInput } from "@/lib/resume";
import type { ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
};

const SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "AWS",
  "Docker",
  "Git",
  "REST APIs",
  "System Design",
  "Agile",
  "Communication",
];

export default function SkillsStep({ data, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function addSkills(raw: string) {
    const incoming = parseSkillsInput(raw);
    if (incoming.length === 0) return;
    const existing = new Set(data.skills.map((s) => s.toLowerCase()));
    const merged = [...data.skills];
    for (const skill of incoming) {
      if (!existing.has(skill.toLowerCase())) {
        merged.push(skill);
        existing.add(skill.toLowerCase());
      }
    }
    onChange({ skills: merged });
    setDraft("");
  }

  function removeSkill(skill: string) {
    onChange({ skills: data.skills.filter((s) => s !== skill) });
  }

  function toggleSuggestion(skill: string) {
    const exists = data.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (exists) {
      onChange({
        skills: data.skills.filter((s) => s.toLowerCase() !== skill.toLowerCase()),
      });
    } else {
      onChange({ skills: [...data.skills, skill] });
    }
  }

  return (
    <FormSection
      title="Skills"
      description="Add keywords that match job descriptions. ATS systems match skills by exact text — prefer common industry terms."
    >
      <Field
        label="Add skills"
        htmlFor="skills-input"
        hint="Press Enter or comma to add. Paste a comma-separated list at once."
      >
        <div className="flex gap-2">
          <Input
            id="skills-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSkills(draft.replace(/,$/, ""));
              }
              if (e.key === "Backspace" && !draft && data.skills.length > 0) {
                removeSkill(data.skills[data.skills.length - 1]);
              }
            }}
            placeholder="e.g. TypeScript, React, Node.js"
            className="h-10 bg-white"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addSkills(draft)}
            className="h-10 shrink-0 px-4"
          >
            Add
          </Button>
        </div>
      </Field>

      {data.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="gap-1 bg-indigo-50 px-2.5 py-1 text-indigo-700 hover:bg-indigo-100"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-200/60"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          Quick add
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((skill) => {
            const selected = data.skills.some(
              (s) => s.toLowerCase() === skill.toLowerCase()
            );
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSuggestion(skill)}
                className={
                  selected
                    ? "rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                }
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </FormSection>
  );
}
