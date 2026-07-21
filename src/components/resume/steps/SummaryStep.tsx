"use client";

import { Textarea } from "@/components/ui/textarea";
import Field from "@/components/resume/Field";
import FormSection from "@/components/resume/FormSection";
import type { ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
};

export default function SummaryStep({ data, onChange }: Props) {
  const length = data.summary.trim().length;

  return (
    <FormSection
      title="Professional Summary"
      description="2–4 sentences highlighting your strengths, years of experience, and target role. ATS systems scan this first."
    >
      <Field
        label="Summary"
        htmlFor="summary"
        required
        hint="Aim for 40–300 characters. Lead with impact and keywords from the job description."
      >
        <Textarea
          id="summary"
          value={data.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="Results-driven Full Stack Developer with 4+ years building scalable web apps. Skilled in React, Node.js, and cloud infrastructure. Seeking to contribute to high-impact product teams."
          rows={6}
          className="min-h-32 resize-y bg-white text-sm leading-relaxed"
        />
      </Field>

      <div className="flex items-center justify-between text-xs">
        <span
          className={
            length >= 40 && length <= 400
              ? "font-medium text-emerald-600"
              : length > 0
                ? "font-medium text-amber-600"
                : "text-slate-400"
          }
        >
          {length === 0
            ? "Start writing your summary"
            : length < 40
              ? "A bit short — add more detail"
              : length > 400
                ? "Consider trimming for scannability"
                : "Good length for ATS"}
        </span>
        <span className="tabular-nums text-slate-400">{length} chars</span>
      </div>
    </FormSection>
  );
}
