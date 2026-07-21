import type {
  AchievementItem,
  BlogPost,
  CertificationItem,
  PortfolioData,
  PortfolioEditorSection,
  PortfolioProject,
  PortfolioSkill,
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
    technologies: [],
    github: "",
    liveDemo: "",
    featured: false,
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

export const SKILL_CATEGORIES: {
  id: SkillCategory;
  label: string;
}[] = [
  { id: "languages", label: "Programming Languages" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "databases", label: "Databases" },
  { id: "frameworks", label: "Frameworks" },
  { id: "cloud", label: "Cloud" },
  { id: "tools", label: "Tools" },
];

export const EDITOR_SECTIONS: {
  id: PortfolioEditorSection;
  label: string;
  description: string;
}[] = [
  { id: "hero", label: "Hero", description: "Name, title, photo, intro" },
  { id: "about", label: "About", description: "Bio, objective, experience" },
  { id: "skills", label: "Skills", description: "Categorized skills & levels" },
  { id: "projects", label: "Projects", description: "Featured work showcase" },
  { id: "experience", label: "Experience", description: "Career timeline" },
  { id: "education", label: "Education", description: "Academic timeline" },
  {
    id: "certifications",
    label: "Certifications",
    description: "Credentials & courses",
  },
  {
    id: "achievements",
    label: "Achievements",
    description: "Awards & highlights",
  },
  { id: "services", label: "Services", description: "Optional offerings" },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Client & peer quotes",
  },
  { id: "blog", label: "Blog", description: "Optional writing links" },
  { id: "contact", label: "Contact", description: "Links & form fields" },
  {
    id: "design",
    label: "Design",
    description: "Template, theme, SEO",
  },
  {
    id: "deploy",
    label: "Deploy",
    description: "Domain, export, publish",
  },
];

export const emptyPortfolio: PortfolioData = {
  slug: "my-portfolio",
  customDomain: "",
  seoTitle: "",
  seoDescription: "",
  template: "modern",
  themeMode: "light",
  accentColor: "#4f46e5",
  published: false,

  fullName: "",
  title: "",
  profilePhoto: "",
  introduction: "",
  resumeUrl: "",
  heroCtaLabel: "Get in touch",

  biography: "",
  careerObjective: "",
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
  showServices: false,
  showBlog: false,

  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolioUrl: "",
  twitter: "",

  footerTagline: "Built with DevLaunch AI",
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
    profilePhoto: "",
    introduction:
      "I design and ship polished product experiences — from pixel-perfect interfaces to reliable APIs and infrastructure.",
    resumeUrl: "#",
    heroCtaLabel: "Let's talk",
    biography:
      "I'm a full stack engineer with a passion for developer experience and clean product design. Over the last several years I've worked across startups and product teams, shipping features used by thousands of users.",
    careerObjective:
      "Join a product-focused engineering team where I can own features end-to-end and mentor junior developers.",
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
      { id: createId(), name: "Docker", level: 78, category: "cloud" },
      { id: createId(), name: "Git", level: 90, category: "tools" },
      { id: createId(), name: "Figma", level: 65, category: "tools" },
    ],
    projects: [
      {
        id: createId(),
        name: "LaunchBoard",
        description:
          "A kanban-style job application tracker with analytics, AI resume matching, and interview scheduling.",
        image: "",
        technologies: ["Next.js", "TypeScript", "Supabase", "Stripe"],
        github: "https://github.com",
        liveDemo: "https://example.com",
        featured: true,
      },
      {
        id: createId(),
        name: "PulseMetrics",
        description:
          "Real-time dashboard for product metrics with role-based access and exportable reports.",
        image: "",
        technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
        github: "https://github.com",
        liveDemo: "https://example.com",
        featured: true,
      },
      {
        id: createId(),
        name: "DevDocs AI",
        description:
          "Internal documentation assistant that answers engineering questions from a private knowledge base.",
        image: "",
        technologies: ["Python", "OpenAI", "FastAPI"],
        github: "https://github.com",
        liveDemo: "",
        featured: false,
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
      },
    ],
    education: [
      {
        id: createId(),
        title: "B.S. Computer Science",
        organization: "University of California",
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
        description: "1st place at CityTech Hack for an accessibility tooling project.",
        year: "2021",
      },
      {
        id: createId(),
        title: "Open Source Contributor",
        description: "Maintainer of a popular React form utility with 2k+ GitHub stars.",
        year: "2024",
      },
    ],
    services: [
      {
        id: createId(),
        title: "Web Application Development",
        description: "End-to-end product builds with modern React and Node stacks.",
        icon: "code",
      },
      {
        id: createId(),
        title: "Performance Audits",
        description: "Identify bottlenecks and ship measurable speed improvements.",
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
        excerpt: "Patterns for caching, optimistic UI, and graceful failure states.",
        url: "https://example.com/blog",
        date: "2024",
      },
    ],
    showServices: true,
    showBlog: true,
    email: "alex@example.com",
    phone: "+1 (555) 010-2040",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/",
    github: "https://github.com/",
    portfolioUrl: "https://alexchen.dev",
    twitter: "",
    footerTagline: "Designed for impact. Built with care.",
    template: "modern",
    themeMode: "light",
    accentColor: "#4f46e5",
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "portfolio";
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
    data.biography.trim().slice(0, 160) ||
    "Professional portfolio built with DevLaunch AI."
  );
}

export const STORAGE_KEY = "devlaunch-portfolio-draft";
