"use client";

import { Input } from "@/components/ui/input";
import Field from "@/components/resume/Field";
import FormSection from "@/components/resume/FormSection";
import type { ResumeData } from "@/types/resume";

type Props = {
  data: ResumeData;
  onChange: (patch: Partial<ResumeData>) => void;
};

export default function PersonalStep({ data, onChange }: Props) {
  return (
    <FormSection
      title="Personal Information"
      description="Use a professional email and phone number recruiters can reach you on. Keep links clean for ATS parsers."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="fullName" required className="sm:col-span-2">
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Jane Doe"
            className="h-10 bg-white"
          />
        </Field>

        <Field label="Professional Title" htmlFor="title" required className="sm:col-span-2">
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Full Stack Developer"
            className="h-10 bg-white"
          />
        </Field>

        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="jane@email.com"
            className="h-10 bg-white"
          />
        </Field>

        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="h-10 bg-white"
          />
        </Field>

        <Field label="Location" htmlFor="location" className="sm:col-span-2">
          <Input
            id="location"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="San Francisco, CA"
            className="h-10 bg-white"
          />
        </Field>

        <Field label="LinkedIn" htmlFor="linkedin">
          <Input
            id="linkedin"
            type="url"
            value={data.linkedin}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/janedoe"
            className="h-10 bg-white"
          />
        </Field>

        <Field label="GitHub" htmlFor="github">
          <Input
            id="github"
            type="url"
            value={data.github}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="https://github.com/janedoe"
            className="h-10 bg-white"
          />
        </Field>

        <Field label="Portfolio / Website" htmlFor="portfolio" className="sm:col-span-2">
          <Input
            id="portfolio"
            type="url"
            value={data.portfolio}
            onChange={(e) => onChange({ portfolio: e.target.value })}
            placeholder="https://janedoe.dev"
            className="h-10 bg-white"
          />
        </Field>
      </div>
    </FormSection>
  );
}
