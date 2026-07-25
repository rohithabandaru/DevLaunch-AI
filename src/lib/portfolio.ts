import type {
  AchievementItem,
  BlogPost,
  CertificationItem,
  HobbyItem,
  LanguageItem,
  PortfolioAnalytics,
  PortfolioCompletionBreakdown,
  PortfolioData,
  PortfolioEditorSection,
  PortfolioFontId,
  PortfolioProject,
  PortfolioSectionKey,
  PortfolioSectionVisibility,
  PortfolioSkill,
  PortfolioTemplateId,
  ServiceItem,
  SkillCategory,
  TestimonialItem,
  TimelineItem,
} from "@/types/portfolio";

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptySkill(
  category: SkillCategory = "languages"
): PortfolioSkill {
  return { id: createId(), name: "", level: 75, category };
}

export function createEmptyProject(): PortfolioProject {
  return {
    id: createId(),
    name: "",
    description: "",
    image: "",
    images: [],
    technologies: [],
    github: "",
    liveDemo: "",
    featured: false,
    features: [],
    challenges: "",
    achievements: "",
  };
}

export function createEmptyTimeline(): TimelineItem {
  return {
    id: createId(),
    title: "",
    organization: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    college: "",
    university: "",
    cgpa: "",
    employmentType: "Full-time",
    technologies: [],
  };
}

export function createEmptyCertification(): CertificationItem {
  return {
    id: createId(),
    name: "",
    issuer: "",
    date: "",
    credentialUrl: "",
  };
}

export function createEmptyAchievement(): AchievementItem {
  return { id: createId(), title: "", description: "", year: "" };
}

export function createEmptyService(): ServiceItem {
  return {
    id: createId(),
    title: "",
    description: "",
    icon: "sparkles",
  };
}

export function createEmptyTestimonial(): TestimonialItem {
  return {
    id: createId(),
    name: "",
    role: "",
    company: "",
    quote: "",
    avatar: "",
  };
}

export function createEmptyBlogPost(): BlogPost {
  return {
    id: createId(),
    title: "",
    excerpt: "",
    url: "",
    date: "",
  };
}

export function createEmptyLanguage(): LanguageItem {
  return { id: createId(), name: "", proficiency: "Fluent" };
}

export function createEmptyHobby(): HobbyItem {
  return { id: createId(), name: "" };
}

export function emptyAnalytics(): PortfolioAnalytics {
  return {
    views: 0,
    uniqueVisitors: 0,
    resumeDownloads: 0,
    contactSubmissions: 0,
    githubClicks: 0,
    linkedinClicks: 0,
  };
}

export const DEFAULT_SECTION_ORDER: PortfolioSectionKey[] = [
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "education",
  "certifications",
  "achievements",
  "languages",
  "hobbies",
  "services",
  "testimonials",
  "blog",
  "contact",
];

export const DEFAULT_SECTION_VISIBILITY: PortfolioSectionVisibility = {
  hero: true,
  about: true,
  skills: true,
  projects: true,
  experience: true,
  education: true,
  certifications: true,
  achievements: true,
  languages: true,
  hobbies: true,
  services: false,
  testimonials: true,
  blog: false,
  contact: true,
};

export const SKILL_CATEGORIES: {
  id: SkillCategory;
  label: string;
}[] = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "databases", label: "Database" },
  { id: "cloud", label: "Cloud" },
  { id: "devops", label: "DevOps" },
  { id: "languages", label: "Programming Languages" },
  { id: "tools", label: "Tools" },
  { id: "soft", label: "Soft Skills" },
  { id: "frameworks", label: "Frameworks" },
];

export const PORTFOLIO_TEMPLATES: {
  id: PortfolioTemplateId;
  name: string;
  blurb: string;
  preview: string;
}[] = [
  {
    id: "modern",
    name: "Modern",
    blurb: "Balanced SaaS layout with soft cards and progress bars.",
    preview: "from-indigo-500 to-violet-500",
  },
  {
    id: "minimal",
    name: "Minimal",
    blurb: "Clean typography, airy spacing, skill badges.",
    preview: "from-slate-400 to-slate-600",
  },
  {
    id: "developer",
    name: "Developer",
    blurb: "Code-first dark accents and technical density.",
    preview: "from-emerald-500 to-cyan-600",
  },
  {
    id: "creative",
    name: "Creative",
    blurb: "Expressive gradients and bold visual hierarchy.",
    preview: "from-fuchsia-500 to-orange-400",
  },
  {
    id: "startup",
    name: "Startup",
    blurb: "Product-launch energy with sharp CTAs.",
    preview: "from-blue-500 to-indigo-600",
  },
  {
    id: "corporate",
    name: "Corporate",
    blurb: "Polished professional layout for enterprise roles.",
    preview: "from-slate-700 to-blue-900",
  },
  {
    id: "dark",
    name: "Dark",
    blurb: "High-contrast night theme optimized for depth.",
    preview: "from-zinc-800 to-zinc-950",
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    blurb: "Frosted panels, blur, and translucent cards.",
    preview: "from-sky-400 to-purple-500",
  },
  {
    id: "gradient",
    name: "Gradient",
    blurb: "Vibrant multi-stop gradients throughout.",
    preview: "from-pink-500 via-purple-500 to-indigo-500",
  },
];

export const EDITOR_SECTIONS: {
  id: PortfolioEditorSection;
  label: string;
  description: string;
  group?: "overview" | "content" | "extras" | "system";
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Completion, analytics, publish",
    group: "overview",
  },
  {
    id: "personal",
    label: "Personal",
    description: "Name, bio, contact basics",
    group: "content",
  },
  { id: "hero", label: "Hero", description: "Headline, CTAs, imagery", group: "content" },
  { id: "about", label: "About", description: "Bio, objective, summary", group: "content" },
  { id: "education", label: "Education", description: "Degrees & academics", group: "content" },
  { id: "experience", label: "Experience", description: "Career timeline", group: "content" },
  { id: "projects", label: "Projects", description: "Featured work", group: "content" },
  { id: "skills", label: "Skills", description: "Categorized skill set", group: "content" },
  {
    id: "certifications",
    label: "Certificates",
    description: "Credentials & courses",
    group: "extras",
  },
  {
    id: "achievements",
    label: "Achievements",
    description: "Awards & highlights",
    group: "extras",
  },
  {
    id: "languages",
    label: "Languages",
    description: "Spoken languages",
    group: "extras",
  },
  { id: "hobbies", label: "Hobbies", description: "Interests", group: "extras" },
  { id: "services", label: "Services", description: "Offerings", group: "extras" },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Client & peer quotes",
    group: "extras",
  },
  { id: "blog", label: "Blog", description: "Writing links", group: "extras" },
  { id: "contact", label: "Contact", description: "Form, maps, socials", group: "content" },
  {
    id: "design",
    label: "Design",
    description: "Theme, colors, fonts",
    group: "system",
  },
  {
    id: "ai",
    label: "AI Studio",
    description: "Generate & improve copy",
    group: "system",
  },
  {
    id: "deploy",
    label: "Publish",
    description: "Export, URL, republish",
    group: "system",
  },
];

export const PORTFOLIO_FONTS: {
  id: PortfolioFontId;
  label: string;
  stack: string;
  googleUrl?: string;
}[] = [
  {
    id: "inter",
    label: "Inter",
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
    googleUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    stack: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    googleUrl:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    googleUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    stack: '"Playfair Display", Georgia, serif',
    googleUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&display=swap",
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    stack: '"JetBrains Mono", ui-monospace, monospace',
    googleUrl:
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
  },
];

export function getFontStack(fontId: PortfolioFontId | undefined): string {
  return (
    PORTFOLIO_FONTS.find((f) => f.id === fontId)?.stack ??
    PORTFOLIO_FONTS[0].stack
  );
}

export function getFontGoogleUrl(
  fontId: PortfolioFontId | undefined
): string | undefined {
  return PORTFOLIO_FONTS.find((f) => f.id === fontId)?.googleUrl;
}

export function normalizeTemplate(
  raw: string | undefined
): PortfolioTemplateId {
  const map: Record<string, PortfolioTemplateId> = {
    modern: "modern",
    minimal: "minimal",
    developer: "developer",
    creative: "creative",
    startup: "startup",
    corporate: "corporate",
    dark: "dark",
    glassmorphism: "glassmorphism",
    gradient: "gradient",
    bold: "developer",
  };
  return map[raw ?? ""] ?? "modern";
}

function normalizeProject(raw: Partial<PortfolioProject>): PortfolioProject {
  return {
    ...createEmptyProject(),
    ...raw,
    id: raw.id || createId(),
    technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
    images: Array.isArray(raw.images)
      ? raw.images
      : raw.image
        ? [raw.image]
        : [],
    features: Array.isArray(raw.features) ? raw.features : [],
    challenges: raw.challenges ?? "",
    achievements: raw.achievements ?? "",
    image: raw.image ?? "",
  };
}

function normalizeTimeline(raw: Partial<TimelineItem>): TimelineItem {
  return {
    ...createEmptyTimeline(),
    ...raw,
    id: raw.id || createId(),
    technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
    college: raw.college ?? "",
    university: raw.university ?? "",
    cgpa: raw.cgpa ?? "",
    employmentType: raw.employmentType ?? "Full-time",
  };
}

export const emptyPortfolio: PortfolioData = {
  slug: "my-portfolio",
  customDomain: "",
  seoTitle: "",
  seoDescription: "",
  template: "modern",
  themeMode: "light",
  accentColor: "#4f46e5",
  secondaryColor: "#a855f7",
  fontFamily: "inter",
  animationsEnabled: true,
  spacing: "comfortable",
  published: false,
  publishedAt: "",
  updatedAt: "",
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },

  fullName: "",
  title: "",
  profilePhoto: "",
  heroImage: "",
  backgroundImage: "",
  introduction: "",
  resumeUrl: "",
  heroCtaLabel: "Get in touch",
  heroHeadline: "",
  tagline: "",

  biography: "",
  careerObjective: "",
  professionalSummary: "",
  yearsExperience: "",

  skills: [],
  skillsSummary: "",

  projects: [createEmptyProject()],
  experience: [createEmptyTimeline()],
  education: [createEmptyTimeline()],
  certifications: [],
  achievements: [],
  services: [],
  testimonials: [],
  blogPosts: [],
  languages: [],
  hobbies: [],
  showServices: false,
  showBlog: false,

  email: "",
  phone: "",
  location: "",
  mapsEmbedUrl: "",
  showContactForm: true,
  showMaps: false,
  linkedin: "",
  github: "",
  portfolioUrl: "",
  twitter: "",
  instagram: "",
  dribbble: "",
  youtube: "",
  medium: "",
  devto: "",
  leetcode: "",
  hackerrank: "",

  footerTagline: "Built with DevLaunch AI",
  analytics: emptyAnalytics(),
};

/** Seeded demo content for first-run preview. */
export function createSamplePortfolio(): PortfolioData {
  return {
    ...emptyPortfolio,
    slug: "alex-chen",
    seoTitle: "Alex Chen — Full Stack Engineer",
    seoDescription:
      "Portfolio of Alex Chen, a full stack engineer building scalable web products with React, Node.js, and cloud-native systems.",
    fullName: "Alex Chen",
    title: "Full Stack Engineer",
    heroHeadline: "I build products people love to use.",
    tagline: "Full-stack craftsmanship for ambitious startups.",
    profilePhoto: "",
    introduction:
      "I design and ship polished product experiences — from pixel-perfect interfaces to reliable APIs and infrastructure.",
    resumeUrl: "#",
    heroCtaLabel: "Let's talk",
    biography:
      "I'm a full stack engineer with a passion for developer experience and clean product design. Over the last several years I've worked across startups and product teams, shipping features used by thousands of users.",
    careerObjective:
      "Join a product-focused engineering team where I can own features end-to-end and mentor junior developers.",
    professionalSummary:
      "Product-minded engineer specializing in React, TypeScript, and cloud backends. Known for shipping polished UX with measurable performance gains.",
    yearsExperience: "5+",
    skillsSummary:
      "Strong across the JavaScript ecosystem with production experience in React, TypeScript, Node.js, PostgreSQL, and AWS.",
    skills: [
      { id: createId(), name: "TypeScript", level: 92, category: "languages" },
      { id: createId(), name: "Python", level: 70, category: "languages" },
      { id: createId(), name: "React", level: 95, category: "frontend" },
      { id: createId(), name: "Next.js", level: 90, category: "frontend" },
      { id: createId(), name: "Tailwind CSS", level: 88, category: "frontend" },
      { id: createId(), name: "Node.js", level: 90, category: "backend" },
      { id: createId(), name: "PostgreSQL", level: 82, category: "databases" },
      { id: createId(), name: "Supabase", level: 80, category: "databases" },
      { id: createId(), name: "Express", level: 85, category: "frameworks" },
      { id: createId(), name: "AWS", level: 75, category: "cloud" },
      { id: createId(), name: "Docker", level: 78, category: "devops" },
      { id: createId(), name: "Git", level: 90, category: "tools" },
      { id: createId(), name: "Communication", level: 88, category: "soft" },
      { id: createId(), name: "Mentorship", level: 80, category: "soft" },
    ],
    projects: [
      {
        id: createId(),
        name: "LaunchBoard",
        description:
          "A kanban-style job application tracker with analytics, AI resume matching, and interview scheduling.",
        image: "",
        images: [],
        technologies: ["Next.js", "TypeScript", "Supabase", "Stripe"],
        github: "https://github.com",
        liveDemo: "https://example.com",
        featured: true,
        features: [
          "Kanban pipeline",
          "AI resume match",
          "Interview calendar",
        ],
        challenges:
          "Syncing multi-tenant state and keeping analytics queries fast under load.",
        achievements: "Reduced application tracking time by 40% for beta users.",
      },
      {
        id: createId(),
        name: "PulseMetrics",
        description:
          "Real-time dashboard for product metrics with role-based access and exportable reports.",
        image: "",
        images: [],
        technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
        github: "https://github.com",
        liveDemo: "https://example.com",
        featured: true,
        features: ["Live charts", "RBAC", "CSV export"],
        challenges: "Streaming high-cardinality metrics without UI jank.",
        achievements: "Powered weekly exec reviews for a 50-person team.",
      },
      {
        id: createId(),
        name: "DevDocs AI",
        description:
          "Internal documentation assistant that answers engineering questions from a private knowledge base.",
        image: "",
        images: [],
        technologies: ["Python", "OpenAI", "FastAPI"],
        github: "https://github.com",
        liveDemo: "",
        featured: false,
        features: ["RAG search", "Source citations"],
        challenges: "Grounding answers with private docs safely.",
        achievements: "Cut onboarding questions by half.",
      },
    ],
    experience: [
      {
        id: createId(),
        title: "Senior Full Stack Engineer",
        organization: "Nimbus Labs",
        location: "Remote",
        startDate: "2022",
        endDate: "",
        current: true,
        description:
          "Lead product engineering for the core SaaS platform. Shipped multi-tenant features, improved Core Web Vitals by 35%, and mentored 3 engineers.",
        employmentType: "Full-time",
        technologies: ["Next.js", "TypeScript", "AWS", "PostgreSQL"],
      },
      {
        id: createId(),
        title: "Software Engineer",
        organization: "BrightPath",
        location: "San Francisco, CA",
        startDate: "2019",
        endDate: "2022",
        current: false,
        description:
          "Built customer-facing dashboards and billing integrations. Owned CI/CD improvements that cut deploy time by 50%.",
        employmentType: "Full-time",
        technologies: ["React", "Node.js", "Stripe"],
      },
    ],
    education: [
      {
        id: createId(),
        title: "B.S. Computer Science",
        organization: "University of California",
        college: "College of Engineering",
        university: "University of California",
        cgpa: "3.8",
        location: "Berkeley, CA",
        startDate: "2015",
        endDate: "2019",
        current: false,
        description: "Focus on systems, HCI, and software engineering.",
      },
    ],
    certifications: [
      {
        id: createId(),
        name: "AWS Certified Developer – Associate",
        issuer: "Amazon Web Services",
        date: "2023",
        credentialUrl: "",
      },
    ],
    achievements: [
      {
        id: createId(),
        title: "Hackathon Winner",
        description:
          "1st place at CityTech Hack for an accessibility tooling project.",
        year: "2021",
      },
      {
        id: createId(),
        title: "Open Source Contributor",
        description:
          "Maintainer of a popular React form utility with 2k+ GitHub stars.",
        year: "2024",
      },
    ],
    services: [
      {
        id: createId(),
        title: "Web Application Development",
        description:
          "End-to-end product builds with modern React and Node stacks.",
        icon: "code",
      },
      {
        id: createId(),
        title: "Performance Audits",
        description:
          "Identify bottlenecks and ship measurable speed improvements.",
        icon: "zap",
      },
    ],
    testimonials: [
      {
        id: createId(),
        name: "Priya Sharma",
        role: "Product Manager",
        company: "Nimbus Labs",
        quote:
          "Alex consistently delivers polished features on time and elevates the whole team's engineering quality.",
        avatar: "",
      },
    ],
    blogPosts: [
      {
        id: createId(),
        title: "Designing resilient React data layers",
        excerpt:
          "Patterns for caching, optimistic UI, and graceful failure states.",
        url: "https://example.com/blog",
        date: "2024",
      },
    ],
    languages: [
      { id: createId(), name: "English", proficiency: "Native" },
      { id: createId(), name: "Mandarin", proficiency: "Conversational" },
    ],
    hobbies: [
      { id: createId(), name: "Open source" },
      { id: createId(), name: "Photography" },
      { id: createId(), name: "Trail running" },
    ],
    showServices: true,
    showBlog: true,
    sectionVisibility: {
      ...DEFAULT_SECTION_VISIBILITY,
      services: true,
      blog: true,
      languages: true,
      hobbies: true,
    },
    email: "alex@example.com",
    phone: "+1 (555) 010-2040",
    location: "San Francisco, CA",
    mapsEmbedUrl: "",
    showContactForm: true,
    showMaps: false,
    linkedin: "https://linkedin.com/in/",
    github: "https://github.com/",
    portfolioUrl: "https://alexchen.dev",
    twitter: "https://x.com/",
    instagram: "",
    dribbble: "",
    youtube: "",
    medium: "",
    devto: "",
    leetcode: "",
    hackerrank: "",
    footerTagline: "Designed for impact. Built with care.",
    template: "modern",
    themeMode: "light",
    accentColor: "#4f46e5",
    secondaryColor: "#a855f7",
    fontFamily: "inter",
    animationsEnabled: true,
    spacing: "comfortable",
    analytics: {
      views: 1284,
      uniqueVisitors: 892,
      resumeDownloads: 146,
      contactSubmissions: 38,
      githubClicks: 210,
      linkedinClicks: 175,
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Merge stored drafts safely with defaults (handles older localStorage shapes). */
export function normalizePortfolio(
  raw: Partial<PortfolioData> | null | undefined
): PortfolioData {
  const base = emptyPortfolio;
  if (!raw || typeof raw !== "object") {
    return {
      ...base,
      projects: [createEmptyProject()],
      experience: [createEmptyTimeline()],
      education: [createEmptyTimeline()],
    };
  }

  const visibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(raw.sectionVisibility ?? {}),
    services: raw.sectionVisibility?.services ?? raw.showServices ?? false,
    blog: raw.sectionVisibility?.blog ?? raw.showBlog ?? false,
  };

  let sectionOrder = Array.isArray(raw.sectionOrder)
    ? (raw.sectionOrder as PortfolioSectionKey[])
    : [...DEFAULT_SECTION_ORDER];
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!sectionOrder.includes(key)) sectionOrder.push(key);
  }

  return {
    ...base,
    ...raw,
    template: normalizeTemplate(raw.template as string),
    secondaryColor: raw.secondaryColor ?? base.secondaryColor,
    spacing: raw.spacing ?? "comfortable",
    publishedAt: raw.publishedAt ?? "",
    updatedAt: raw.updatedAt ?? "",
    heroHeadline: raw.heroHeadline ?? "",
    tagline: raw.tagline ?? raw.introduction ?? "",
    heroImage: raw.heroImage ?? "",
    backgroundImage: raw.backgroundImage ?? "",
    professionalSummary: raw.professionalSummary ?? "",
    sectionOrder,
    sectionVisibility: visibility,
    skills: Array.isArray(raw.skills) ? raw.skills : base.skills,
    projects:
      Array.isArray(raw.projects) && raw.projects.length
        ? raw.projects.map((p) => normalizeProject(p))
        : [createEmptyProject()],
    experience:
      Array.isArray(raw.experience) && raw.experience.length
        ? raw.experience.map((e) => normalizeTimeline(e))
        : [createEmptyTimeline()],
    education:
      Array.isArray(raw.education) && raw.education.length
        ? raw.education.map((e) => normalizeTimeline(e))
        : [createEmptyTimeline()],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    services: Array.isArray(raw.services) ? raw.services : [],
    testimonials: Array.isArray(raw.testimonials) ? raw.testimonials : [],
    blogPosts: Array.isArray(raw.blogPosts) ? raw.blogPosts : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    hobbies: Array.isArray(raw.hobbies) ? raw.hobbies : [],
    fontFamily: raw.fontFamily ?? "inter",
    animationsEnabled: raw.animationsEnabled ?? true,
    showContactForm: raw.showContactForm ?? true,
    showMaps: raw.showMaps ?? false,
    mapsEmbedUrl: raw.mapsEmbedUrl ?? "",
    instagram: raw.instagram ?? "",
    dribbble: raw.dribbble ?? "",
    youtube: raw.youtube ?? "",
    medium: raw.medium ?? "",
    devto: raw.devto ?? "",
    leetcode: raw.leetcode ?? "",
    hackerrank: raw.hackerrank ?? "",
    showServices: visibility.services,
    showBlog: visibility.blog,
    analytics: {
      ...emptyAnalytics(),
      ...(raw.analytics ?? {}),
    },
  };
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "portfolio"
  );
}

export function parseTechInput(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getSeoTitle(data: PortfolioData): string {
  if (data.seoTitle.trim()) return data.seoTitle.trim();
  if (data.fullName.trim() && data.title.trim()) {
    return `${data.fullName.trim()} — ${data.title.trim()}`;
  }
  return data.fullName.trim() || "Portfolio";
}

export function getSeoDescription(data: PortfolioData): string {
  if (data.seoDescription.trim()) return data.seoDescription.trim();
  return (
    data.introduction.trim() ||
    data.tagline.trim() ||
    data.biography.trim().slice(0, 160) ||
    "Professional portfolio built with DevLaunch AI."
  );
}

export function getPublicPortfolioPath(slug: string): string {
  return `/p/${slugify(slug) || "portfolio"}`;
}

export function getPublicPortfolioUrl(slug: string, origin?: string): string {
  const path = getPublicPortfolioPath(slug);
  if (origin) return `${origin.replace(/\/$/, "")}${path}`;
  if (typeof window !== "undefined") return `${window.location.origin}${path}`;
  return `https://devlaunch.ai${path}`;
}

/** Weighted completion score for the dashboard. */
export function getPortfolioCompletion(
  data: PortfolioData
): PortfolioCompletionBreakdown {
  const checks: {
    key: string;
    label: string;
    weight: number;
    complete: boolean;
  }[] = [
    {
      key: "personal",
      label: "Personal info",
      weight: 12,
      complete: Boolean(data.fullName.trim() && data.title.trim() && data.email.trim()),
    },
    {
      key: "hero",
      label: "Hero & tagline",
      weight: 10,
      complete: Boolean(
        (data.introduction.trim() || data.tagline.trim()) && data.heroCtaLabel.trim()
      ),
    },
    {
      key: "about",
      label: "About me",
      weight: 12,
      complete: Boolean(data.biography.trim().length > 40),
    },
    {
      key: "experience",
      label: "Experience",
      weight: 12,
      complete: data.experience.some(
        (e) => e.title.trim() && e.organization.trim()
      ),
    },
    {
      key: "education",
      label: "Education",
      weight: 8,
      complete: data.education.some(
        (e) => e.title.trim() || e.organization.trim()
      ),
    },
    {
      key: "projects",
      label: "Projects",
      weight: 14,
      complete: data.projects.some(
        (p) => p.name.trim() && p.description.trim().length > 20
      ),
    },
    {
      key: "skills",
      label: "Skills",
      weight: 10,
      complete: data.skills.filter((s) => s.name.trim()).length >= 4,
    },
    {
      key: "social",
      label: "Social links",
      weight: 8,
      complete: Boolean(data.github.trim() || data.linkedin.trim()),
    },
    {
      key: "seo",
      label: "SEO",
      weight: 6,
      complete: Boolean(data.seoTitle.trim() || data.seoDescription.trim()),
    },
    {
      key: "design",
      label: "Theme chosen",
      weight: 4,
      complete: Boolean(data.template && data.accentColor),
    },
    {
      key: "extras",
      label: "Extras (certs / achievements)",
      weight: 4,
      complete:
        data.certifications.some((c) => c.name.trim()) ||
        data.achievements.some((a) => a.title.trim()),
    },
  ];

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const filled = checks.reduce((s, c) => s + (c.complete ? c.weight : 0), 0);
  const percent = Math.round((filled / total) * 100);
  const missing = checks.filter((c) => !c.complete).map((c) => c.label);

  return {
    percent,
    filled,
    total,
    missing,
    sections: checks,
  };
}

/** Lightweight AI suggestion prompts based on incomplete content. */
export function getAiSuggestions(data: PortfolioData): string[] {
  const suggestions: string[] = [];
  const completion = getPortfolioCompletion(data);

  if (!data.biography.trim() || data.biography.trim().length < 80) {
    suggestions.push("Generate a professional About Me biography");
  }
  if (!data.heroHeadline.trim() && !data.tagline.trim()) {
    suggestions.push("Generate a punchy hero headline and tagline");
  }
  if (!data.skillsSummary.trim() && data.skills.some((s) => s.name.trim())) {
    suggestions.push("Write a skills summary from your stack");
  }
  if (
    data.projects.some(
      (p) => p.name.trim() && (!p.description.trim() || p.description.length < 40)
    )
  ) {
    suggestions.push("Polish project descriptions with AI");
  }
  if (!data.seoDescription.trim()) {
    suggestions.push("Generate an SEO meta description");
  }
  if (!data.heroCtaLabel.trim() || data.heroCtaLabel === "Get in touch") {
    suggestions.push("Generate a stronger call-to-action");
  }
  if (completion.percent < 70) {
    suggestions.push("Run the full AI Portfolio Generator to fill gaps");
  }
  if (data.biography.trim().length > 40) {
    suggestions.push("Improve or rewrite existing portfolio copy");
  }

  return suggestions.slice(0, 6);
}

export const STORAGE_KEY = "devlaunch-portfolio-draft";
export const PUBLISHED_STORAGE_KEY = "devlaunch-portfolio-published";
export const ANALYTICS_STORAGE_KEY = "devlaunch-portfolio-analytics";
