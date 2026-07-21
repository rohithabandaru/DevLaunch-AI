import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeData,
  ResumeStep,
} from "@/types/resume";

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyExperience(): ExperienceEntry {
  return {
    id: createId(),
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

export function createEmptyEducation(): EducationEntry {
  return {
    id: createId(),
    school: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
  };
}

export function createEmptyProject(): ProjectEntry {
  return {
    id: createId(),
    name: "",
    link: "",
    technologies: "",
    description: "",
  };
}

export function createEmptyCertification(): CertificationEntry {
  return {
    id: createId(),
    name: "",
    issuer: "",
    date: "",
  };
}

export const emptyResume: ResumeData = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
  skills: [],
  projects: [createEmptyProject()],
  certifications: [],
  languages: "",
  interests: "",
};

export const RESUME_STEPS: ResumeStep[] = [
  {
    id: "personal",
    title: "Personal Info",
    description: "Contact details and professional links",
  },
  {
    id: "summary",
    title: "Summary",
    description: "A concise professional overview",
  },
  {
    id: "experience",
    title: "Experience",
    description: "Work history and achievements",
  },
  {
    id: "education",
    title: "Education",
    description: "Degrees and academic background",
  },
  {
    id: "skills",
    title: "Skills",
    description: "Technical and soft skills for ATS",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Notable work and side projects",
  },
  {
    id: "additional",
    title: "Additional",
    description: "Certifications, languages, interests",
  },
  {
    id: "review",
    title: "Review",
    description: "Preview and export your resume",
  },
];

/** Soft validation for step completion indicators (not hard blocks). */
export function isStepComplete(stepId: ResumeStep["id"], data: ResumeData): boolean {
  switch (stepId) {
    case "personal":
      return Boolean(data.fullName.trim() && data.email.trim() && data.title.trim());
    case "summary":
      return data.summary.trim().length >= 40;
    case "experience":
      return data.experience.some(
        (e) => e.company.trim() && e.role.trim() && e.description.trim()
      );
    case "education":
      return data.education.some((e) => e.school.trim() && e.degree.trim());
    case "skills":
      return data.skills.filter((s) => s.trim()).length >= 3;
    case "projects":
      return data.projects.some((p) => p.name.trim() && p.description.trim());
    case "additional":
      return (
        data.certifications.some((c) => c.name.trim()) ||
        Boolean(data.languages.trim()) ||
        Boolean(data.interests.trim())
      );
    case "review":
      return isStepComplete("personal", data) && isStepComplete("skills", data);
    default:
      return false;
  }
}

export function calculateAtsScore(data: ResumeData): number {
  let score = 0;
  const max = 100;

  if (data.fullName.trim()) score += 8;
  if (data.email.trim()) score += 8;
  if (data.phone.trim()) score += 5;
  if (data.title.trim()) score += 7;
  if (data.location.trim()) score += 4;
  if (data.linkedin.trim() || data.github.trim() || data.portfolio.trim()) score += 6;

  if (data.summary.trim().length >= 40) score += 12;
  else if (data.summary.trim()) score += 6;

  const filledExp = data.experience.filter(
    (e) => e.company.trim() && e.role.trim() && e.description.trim()
  );
  if (filledExp.length >= 2) score += 18;
  else if (filledExp.length === 1) score += 12;

  const filledEdu = data.education.filter((e) => e.school.trim() && e.degree.trim());
  if (filledEdu.length >= 1) score += 10;

  const skillCount = data.skills.filter((s) => s.trim()).length;
  if (skillCount >= 8) score += 12;
  else if (skillCount >= 3) score += 8;
  else if (skillCount >= 1) score += 4;

  const filledProjects = data.projects.filter((p) => p.name.trim() && p.description.trim());
  if (filledProjects.length >= 1) score += 6;

  if (data.certifications.some((c) => c.name.trim()) || data.languages.trim()) score += 4;

  return Math.min(max, score);
}

export function formatDateRange(
  start: string,
  end: string,
  current?: boolean
): string {
  const startLabel = start.trim() || "Start";
  if (current) return `${startLabel} – Present`;
  const endLabel = end.trim() || "End";
  if (!start.trim() && !end.trim()) return "";
  return `${startLabel} – ${endLabel}`;
}

export function parseSkillsInput(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
