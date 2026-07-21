export type ExperienceEntry = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  link: string;
  technologies: string;
  description: string;
};

export type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

export type ResumeData = {
  // Personal
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  // Summary
  summary: string;
  // Structured sections
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages: string;
  interests: string;
};

export type ResumeStepId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "additional"
  | "review";

export type ResumeStep = {
  id: ResumeStepId;
  title: string;
  description: string;
};
