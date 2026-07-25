/** Portfolio template / visual theme identifiers */
export type PortfolioTemplateId =
  | "modern"
  | "minimal"
  | "developer"
  | "creative"
  | "startup"
  | "corporate"
  | "dark"
  | "glassmorphism"
  | "gradient"
  /** @deprecated use developer */
  | "bold";

export type PortfolioFontId =
  | "inter"
  | "space-grotesk"
  | "dm-sans"
  | "playfair"
  | "jetbrains";

export type SkillCategory =
  | "frontend"
  | "backend"
  | "databases"
  | "cloud"
  | "devops"
  | "languages"
  | "tools"
  | "soft"
  | "frameworks";

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
  images: string[];
  technologies: string[];
  github: string;
  liveDemo: string;
  featured: boolean;
  features: string[];
  challenges: string;
  achievements: string;
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
  /** Education extras */
  college?: string;
  university?: string;
  cgpa?: string;
  /** Experience extras */
  employmentType?: string;
  technologies?: string[];
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

export type LanguageItem = {
  id: string;
  name: string;
  proficiency: string;
};

export type HobbyItem = {
  id: string;
  name: string;
};

export type PortfolioThemeMode = "light" | "dark";

export type PortfolioSpacing = "compact" | "comfortable" | "spacious";

/** Toggleable site sections for show/hide + ordering */
export type PortfolioSectionKey =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "achievements"
  | "languages"
  | "hobbies"
  | "services"
  | "testimonials"
  | "blog"
  | "contact";

export type PortfolioSectionVisibility = Record<PortfolioSectionKey, boolean>;

export type PortfolioAnalytics = {
  views: number;
  uniqueVisitors: number;
  resumeDownloads: number;
  contactSubmissions: number;
  githubClicks: number;
  linkedinClicks: number;
};

export type PortfolioData = {
  // Meta / SEO / deploy
  id?: string;
  slug: string;
  customDomain: string;
  seoTitle: string;
  seoDescription: string;
  template: PortfolioTemplateId;
  themeMode: PortfolioThemeMode;
  accentColor: string;
  secondaryColor: string;
  fontFamily: PortfolioFontId;
  animationsEnabled: boolean;
  spacing: PortfolioSpacing;
  published: boolean;
  publishedAt: string;
  updatedAt: string;
  sectionOrder: PortfolioSectionKey[];
  sectionVisibility: PortfolioSectionVisibility;

  // Hero / personal
  fullName: string;
  title: string;
  profilePhoto: string;
  heroImage: string;
  backgroundImage: string;
  introduction: string;
  resumeUrl: string;
  heroCtaLabel: string;
  heroHeadline: string;
  tagline: string;

  // About
  biography: string;
  careerObjective: string;
  professionalSummary: string;
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
  languages: LanguageItem[];
  hobbies: HobbyItem[];
  showServices: boolean;
  showBlog: boolean;

  // Contact & social
  email: string;
  phone: string;
  location: string;
  mapsEmbedUrl: string;
  showContactForm: boolean;
  showMaps: boolean;
  linkedin: string;
  github: string;
  portfolioUrl: string;
  twitter: string;
  instagram: string;
  dribbble: string;
  youtube: string;
  medium: string;
  devto: string;
  leetcode: string;
  hackerrank: string;

  // Footer
  footerTagline: string;

  // Analytics (client cache / demo)
  analytics: PortfolioAnalytics;
};

export type PortfolioEditorSection =
  | "dashboard"
  | "personal"
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "achievements"
  | "languages"
  | "hobbies"
  | "services"
  | "testimonials"
  | "blog"
  | "contact"
  | "design"
  | "deploy"
  | "ai";

export type PortfolioAiAction =
  | "about"
  | "bio"
  | "project"
  | "skills_summary"
  | "full_portfolio"
  | "improve"
  | "rewrite"
  | "fix_grammar"
  | "seo"
  | "hero_headline"
  | "cta";

export type PortfolioCompletionBreakdown = {
  percent: number;
  filled: number;
  total: number;
  missing: string[];
  sections: { key: string; label: string; complete: boolean; weight: number }[];
};
