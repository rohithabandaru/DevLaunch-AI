"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/resume/StepIndicator";
import ResumePreview from "@/components/resume/ResumePreview";
import PersonalStep from "@/components/resume/steps/PersonalStep";
import SummaryStep from "@/components/resume/steps/SummaryStep";
import ExperienceStep from "@/components/resume/steps/ExperienceStep";
import EducationStep from "@/components/resume/steps/EducationStep";
import SkillsStep from "@/components/resume/steps/SkillsStep";
import ProjectsStep from "@/components/resume/steps/ProjectsStep";
import AdditionalStep from "@/components/resume/steps/AdditionalStep";
import ReviewStep from "@/components/resume/steps/ReviewStep";
import { emptyResume, RESUME_STEPS } from "@/lib/resume";
import type { ResumeData, ResumeStepId } from "@/types/resume";

const STORAGE_KEY = "devlaunch-resume-draft";

export default function ResumeBuilder() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ResumeData;
        setData({ ...emptyResume, ...parsed });
      }
    } catch {
      // ignore corrupt drafts
    }
    setHydrated(true);
  }, []);

  // Autosave draft
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 400);
    return () => clearTimeout(timer);
  }, [data, hydrated]);

  const patchData = useCallback((patch: Partial<ResumeData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const currentStep = RESUME_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === RESUME_STEPS.length - 1;

  function goNext() {
    if (!isLast) setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (!isFirst) setStepIndex((i) => i - 1);
  }

  function goToStep(index: number) {
    if (index >= 0 && index < RESUME_STEPS.length) setStepIndex(index);
  }

  function goToStepId(id: ResumeStepId) {
    const idx = RESUME_STEPS.findIndex((s) => s.id === id);
    if (idx >= 0) setStepIndex(idx);
  }

  function handlePrint() {
    window.print();
  }

  function handleReset() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear all resume data? This cannot be undone.")
    ) {
      return;
    }
    setData(emptyResume);
    setStepIndex(0);
    localStorage.removeItem(STORAGE_KEY);
  }

  function handleManualSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  return (
    <div className="space-y-8">
      <StepIndicator
        currentStep={stepIndex}
        data={data}
        onStepClick={goToStep}
      />

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Form column */}
        <div className="print:hidden lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Step {stepIndex + 1} · {currentStep.title}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {currentStep.description}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleManualSave}
                className="h-8 shrink-0 gap-1.5 text-slate-500"
              >
                <Save className="h-3.5 w-3.5" />
                {savedFlash ? "Saved" : "Save"}
              </Button>
            </div>

            {currentStep.id === "personal" && (
              <PersonalStep data={data} onChange={patchData} />
            )}
            {currentStep.id === "summary" && (
              <SummaryStep data={data} onChange={patchData} />
            )}
            {currentStep.id === "experience" && (
              <ExperienceStep data={data} onChange={patchData} />
            )}
            {currentStep.id === "education" && (
              <EducationStep data={data} onChange={patchData} />
            )}
            {currentStep.id === "skills" && (
              <SkillsStep data={data} onChange={patchData} />
            )}
            {currentStep.id === "projects" && (
              <ProjectsStep data={data} onChange={patchData} />
            )}
            {currentStep.id === "additional" && (
              <AdditionalStep data={data} onChange={patchData} />
            )}
            {currentStep.id === "review" && (
              <ReviewStep
                data={data}
                onGoToStep={goToStepId}
                onPrint={handlePrint}
                onReset={handleReset}
              />
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={isFirst}
                className="h-10 gap-1.5 px-4"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {!isLast ? (
                <Button
                  type="button"
                  onClick={goNext}
                  className="h-10 gap-1.5 bg-indigo-600 px-5 hover:bg-indigo-700"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handlePrint}
                  className="h-10 gap-1.5 bg-indigo-600 px-5 hover:bg-indigo-700"
                >
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Preview column */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  );
}
