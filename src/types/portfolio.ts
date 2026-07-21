export type PortfolioTemplateId = "modern" | "minimal" | "bold";

export type SkillCategory =
  | "languages"
  | "frontend"
  | "backend"
  | "databases"
  | "frameworks"
  | "cloud"
  | "tools";

export type PortfolioSkill = {
  id: string;
  name: string;
  level: number; // 0–100
  category: SkillCategory;
};

export type PortfolioProject = {
  id: string;
  name: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  liveDemo: string;
  featured: boolean;
};

export type TimelineItem = {
  id: string;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl: string;
};

export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  year: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
};

export type PortfolioThemeMode = "light" | "dark";

export type PortfolioData = {
  // Meta / SEO / deploy
  slug: string;
  customDomain: string;
  seoTitle: string;
  seoDescription: string;
  template: PortfolioTemplateId;
  themeMode: PortfolioThemeMode;
  accentColor: string;
  published: boolean;

  // Hero
  fullName: string;
  title: string;
  profilePhoto: string;
  introduction: string;
  resumeUrl: string;
  heroCtaLabel: string;

  // About
  biography: string;
  careerObjective: string;
  yearsExperience: string;

  // Skills
  skills: PortfolioSkill[];
  skillsSummary: string;

  // Projects
  projects: PortfolioProject[];

  // Experience & Education
  experience: TimelineItem[];
  education: TimelineItem[];

  // Extras
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  blogPosts: BlogPost[];
  showServices: boolean;
  showBlog: boolean;

  // Contact
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolioUrl: string;
  twitter: string;

  // Footer
  footerTagline: string;
};

export type PortfolioEditorSection =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "achievements"
  | "services"
  | "testimonials"
  | "blog"
  | "contact"
  | "design"
  | "deploy";

export type PortfolioAiAction =
  | "about"
  | "project"
  | "skills_summary";
