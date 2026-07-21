"use client";

import { CheckCircle2, Circle, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormSection from "@/components/resume/FormSection";
import { RESUME_STEPS, calculateAtsScore, isStepComplete } from "@/lib/resume";
import type { ResumeData, ResumeStepId } from "@/types/resume";
import { cn } from "@/lib/utils";

type Props = {
  data: ResumeData;
  onGoToStep: (stepId: ResumeStepId) => void;
  onPrint: () => void;
  onReset: () => void;
};

export default function ReviewStep({ data, onGoToStep, onPrint, onReset }: Props) {
  const score = calculateAtsScore(data);
  const scoreColor =
    score >= 80
      ? "text-emerald-600 bg-emerald-50 ring-emerald-200"
      : score >= 50
        ? "text-amber-600 bg-amber-50 ring-amber-200"
        : "text-rose-600 bg-rose-50 ring-rose-200";

  const checklist = RESUME_STEPS.filter((s) => s.id !== "review");

  return (
    <FormSection
      title="Review & Export"
      description="Check section completeness, then download a clean ATS-friendly PDF via print."
    >
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-2xl p-6 ring-1 sm:flex-row sm:justify-between",
          scoreColor
        )}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
            Estimated ATS readiness
          </p>
          <p className="mt-1 text-sm opacity-90">
            Based on completeness of contact info, summary, experience, education, and skills.
          </p>
        </div>
        <div className="text-4xl font-black tabular-nums">{score}%</div>
      </div>

      <ul className="space-y-2">
        {checklist.map((step) => {
          const done = isStepComplete(step.id, data);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onGoToStep(step.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="truncate text-xs text-slate-500">{step.description}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    done
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }
                >
                  {done ? "Ready" : "Incomplete"}
                </Badge>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={onPrint}
          className="h-11 flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
          size="lg"
        >
          <Printer className="h-4 w-4" />
          Download / Print PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-11 gap-2"
          size="lg"
        >
          <RotateCcw className="h-4 w-4" />
          Reset form
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400">
        Tip: In the print dialog, choose “Save as PDF” and disable headers/footers for a clean export.
      </p>
    </FormSection>
  );
}
