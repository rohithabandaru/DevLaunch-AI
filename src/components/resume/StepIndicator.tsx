"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESUME_STEPS, isStepComplete } from "@/lib/resume";
import type { ResumeData, ResumeStepId } from "@/types/resume";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

type StepIndicatorProps = {
  currentStep: number;
  data: ResumeData;
  onStepClick: (index: number) => void;
};

export default function StepIndicator({
  currentStep,
  data,
  onStepClick,
}: StepIndicatorProps) {
  const progressValue = Math.round(((currentStep + 1) / RESUME_STEPS.length) * 100);
  const completedCount = RESUME_STEPS.filter((s) => isStepComplete(s.id, data)).length;

  return (
    <div className="space-y-5">
      <Progress value={progressValue} className="w-full">
        <ProgressLabel>Resume progress</ProgressLabel>
        <ProgressValue>
          {(_formatted, value) =>
            `${value ?? 0}% · ${completedCount}/${RESUME_STEPS.length} sections`
          }
        </ProgressValue>
      </Progress>

      {/* Desktop stepper */}
      <nav aria-label="Resume form steps" className="hidden lg:block">
        <ol className="grid grid-cols-4 gap-2 xl:grid-cols-8">
          {RESUME_STEPS.map((step, index) => {
            const complete = isStepComplete(step.id as ResumeStepId, data);
            const active = index === currentStep;
            const reachable = index <= currentStep || complete;

            return (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={!reachable && index > currentStep}
                  onClick={() => onStepClick(index)}
                  className={cn(
                    "group flex w-full flex-col items-center gap-2 rounded-xl p-2 text-center transition-all",
                    active && "bg-indigo-50",
                    reachable ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 transition-all",
                      active &&
                        "bg-indigo-600 text-white ring-indigo-600 shadow-md shadow-indigo-200",
                      !active &&
                        complete &&
                        "bg-emerald-500 text-white ring-emerald-500",
                      !active &&
                        !complete &&
                        "bg-white text-slate-500 ring-slate-200 group-hover:ring-slate-300"
                    )}
                  >
                    {complete && !active ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold leading-tight",
                      active ? "text-indigo-700" : complete ? "text-emerald-700" : "text-slate-500"
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile current step label */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Step {currentStep + 1} of {RESUME_STEPS.length}
          </p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {RESUME_STEPS[currentStep].title}
          </p>
        </div>
        <div className="flex gap-1">
          {RESUME_STEPS.map((step, index) => (
            <span
              key={step.id}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                index === currentStep
                  ? "w-4 bg-indigo-600"
                  : index < currentStep
                    ? "bg-emerald-500"
                    : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
