"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Field from "@/components/resume/Field";
import FormSection from "@/components/resume/FormSection";
import { createEmptyCertification } from "@/lib/resume";
import type { CertificationEntry, ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
};

export default function AdditionalStep({ data, onChange }: Props) {
  function updateCert(id: string, patch: Partial<CertificationEntry>) {
    onChange({
      certifications: data.certifications.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  }

  function removeCert(id: string) {
    onChange({ certifications: data.certifications.filter((c) => c.id !== id) });
  }

  function addCert() {
    onChange({
      certifications: [...data.certifications, createEmptyCertification()],
    });
  }

  return (
    <FormSection
      title="Additional Details"
      description="Optional sections that can strengthen your profile. Skip anything that doesn’t apply."
    >
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Certifications</p>
            <Button type="button" variant="outline" size="sm" onClick={addCert} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {data.certifications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
              No certifications yet. Add AWS, Google, or other credentials if relevant.
            </p>
          ) : (
            <div className="space-y-3">
              {data.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
                >
                  <Field label="Name" htmlFor={`cert-name-${cert.id}`}>
                    <Input
                      id={`cert-name-${cert.id}`}
                      value={cert.name}
                      onChange={(e) => updateCert(cert.id, { name: e.target.value })}
                      placeholder="AWS Solutions Architect"
                      className="h-10 bg-white"
                    />
                  </Field>
                  <Field label="Issuer" htmlFor={`cert-issuer-${cert.id}`}>
                    <Input
                      id={`cert-issuer-${cert.id}`}
                      value={cert.issuer}
                      onChange={(e) => updateCert(cert.id, { issuer: e.target.value })}
                      placeholder="Amazon Web Services"
                      className="h-10 bg-white"
                    />
                  </Field>
                  <Field label="Date" htmlFor={`cert-date-${cert.id}`}>
                    <Input
                      id={`cert-date-${cert.id}`}
                      value={cert.date}
                      onChange={(e) => updateCert(cert.id, { date: e.target.value })}
                      placeholder="2024"
                      className="h-10 w-full bg-white sm:w-24"
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCert(cert.id)}
                    className="h-10 w-10 text-rose-600 hover:bg-rose-50"
                    aria-label="Remove certification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Field
          label="Languages"
          htmlFor="languages"
          hint="e.g. English (Native), Spanish (Professional)"
        >
          <Input
            id="languages"
            value={data.languages}
            onChange={(e) => onChange({ languages: e.target.value })}
            placeholder="English (Native), Hindi (Fluent)"
            className="h-10 bg-white"
          />
        </Field>

        <Field
          label="Interests"
          htmlFor="interests"
          hint="Optional. Keep professional or relevant to culture fit."
        >
          <Input
            id="interests"
            value={data.interests}
            onChange={(e) => onChange({ interests: e.target.value })}
            placeholder="Open source, technical writing, hiking"
            className="h-10 bg-white"
          />
        </Field>
      </div>
    </FormSection>
  );
}
