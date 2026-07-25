import {
  createEmptyCertification,
  createEmptyProject,
  createEmptyService,
  createEmptySkill,
  createEmptyTestimonial,
  createEmptyTimeline,
  createId,
  slugify,
} from "@/lib/portfolio";
import type {
  PortfolioAiAction,
  PortfolioData,
  PortfolioProject,
} from "@/types/portfolio";

/** Local fallback generators when AI API is unavailable. */
export function generateAboutLocal(data: PortfolioData): {
  biography: string;
  careerObjective: string;
  introduction: string;
  professionalSummary: string;
} {
  const name = data.fullName.trim() || "I";
  const title = data.title.trim() || "software professional";
  const years = data.yearsExperience.trim() || "several";
  const topSkills = data.skills
    .slice(0, 5)
    .map((s) => s.name)
    .filter(Boolean)
    .join(", ");

  const skillPhrase = topSkills
    ? ` specializing in ${topSkills}`
    : " focused on building reliable, user-centered products";

  return {
    introduction: `${name === "I" ? "I'm" : `I'm ${name},`} a ${title}${skillPhrase}. I care about craft, clarity, and shipping work that lasts.`,
    biography: `${name === "I" ? "I am" : `${name} is`} a ${title} with ${years} years of hands-on experience building digital products end to end. My work spans product UI, APIs, and collaboration with design and product partners to turn ambiguous problems into polished releases.

I enjoy translating complex requirements into simple interfaces and maintainable systems. Outside of delivery, I invest in mentoring, documentation, and continuous learning so teams can move faster with confidence.`,
    careerObjective: `Seeking a ${title} role where I can own impactful product features, collaborate with cross-functional partners, and continue growing as a technical leader.`,
    professionalSummary: `Results-driven ${title} with ${years} years of experience delivering production software. Strong communicator who balances product intuition with solid engineering fundamentals.`,
  };
}

export function generateBioLocal(data: PortfolioData): string {
  return generateAboutLocal(data).professionalSummary;
}

export function generateProjectDescriptionLocal(
  project: Pick<PortfolioProject, "name" | "technologies" | "features">
): string {
  const name = project.name.trim() || "This project";
  const tech =
    project.technologies.filter(Boolean).join(", ") ||
    "modern web technologies";
  const features =
    project.features?.filter(Boolean).slice(0, 3).join(", ") ||
    "clean UX and reliable architecture";

  return `${name} is a production-ready application built with ${tech}. It focuses on ${features}, solid architecture, and measurable outcomes — from responsive UI to reliable data flows and deployment automation.`;
}

export function generateSkillsSummaryLocal(data: PortfolioData): string {
  const byCategory = new Map<string, string[]>();
  for (const skill of data.skills) {
    if (!skill.name.trim()) continue;
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill.name.trim());
    byCategory.set(skill.category, list);
  }

  const parts: string[] = [];
  if (byCategory.get("languages")?.length) {
    parts.push(
      `languages (${byCategory.get("languages")!.slice(0, 4).join(", ")})`
    );
  }
  if (byCategory.get("frontend")?.length) {
    parts.push(
      `frontend (${byCategory.get("frontend")!.slice(0, 3).join(", ")})`
    );
  }
  if (byCategory.get("backend")?.length) {
    parts.push(
      `backend (${byCategory.get("backend")!.slice(0, 3).join(", ")})`
    );
  }
  if (byCategory.get("cloud")?.length) {
    parts.push(`cloud (${byCategory.get("cloud")!.slice(0, 2).join(", ")})`);
  }
  if (byCategory.get("devops")?.length) {
    parts.push(`DevOps (${byCategory.get("devops")!.slice(0, 2).join(", ")})`);
  }

  const title = data.title.trim() || "engineer";
  if (parts.length === 0) {
    return `Versatile ${title} with a broad toolkit across the full product stack and a bias for practical, production-ready solutions.`;
  }

  return `As a ${title}, I work confidently across ${parts.join("; ")}. I balance speed with code quality and prefer tools that help teams ship maintainable software.`;
}

export function generateHeroHeadlineLocal(data: PortfolioData): {
  heroHeadline: string;
  tagline: string;
  introduction: string;
} {
  const title = data.title.trim() || "Full Stack Developer";
  const name = data.fullName.trim().split(/\s+/)[0] || "I";
  return {
    heroHeadline: `Building software that feels effortless.`,
    tagline: `${title} crafting reliable products with modern web tech.`,
    introduction: `${name === "I" ? "I" : name} design and ship polished digital experiences — from interfaces users love to systems that scale.`,
  };
}

export function generateCtaLocal(data: PortfolioData): string {
  const title = data.title.trim().toLowerCase();
  if (title.includes("design")) return "Start a project";
  if (title.includes("data") || title.includes("ml")) return "Let's collaborate";
  if (title.includes("manager") || title.includes("lead"))
    return "Book a conversation";
  return "Let's build something great";
}

export function generateSeoLocal(data: PortfolioData): {
  seoTitle: string;
  seoDescription: string;
} {
  const name = data.fullName.trim() || "Professional";
  const title = data.title.trim() || "Engineer";
  const loc = data.location.trim();
  const skills = data.skills
    .map((s) => s.name)
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");

  return {
    seoTitle: `${name} — ${title}${loc ? ` | ${loc}` : ""}`,
    seoDescription: `${name} is a ${title}${loc ? ` based in ${loc}` : ""}${
      skills ? ` specializing in ${skills}` : ""
    }. Explore projects, experience, and ways to collaborate.`.slice(0, 160),
  };
}

export function improveContentLocal(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return sentences.join(" ");
}

export function rewriteContentLocal(text: string): string {
  const base = improveContentLocal(text);
  if (!base) return base;
  return `${base}${base.endsWith(".") ? "" : "."} Crafted for clarity, impact, and a professional portfolio voice.`;
}

export function fixGrammarLocal(text: string): string {
  return text
    .replace(/\bi\b/g, "I")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/([.!?])([A-Za-z])/g, "$1 $2")
    .trim();
}

/**
 * Generate a complete starter portfolio from minimal seed fields.
 * Used by AI Portfolio Generator (local fallback).
 */
export function generateFullPortfolioLocal(
  seed: Partial<PortfolioData> & { fullName?: string; title?: string }
): PortfolioData {
  const fullName = seed.fullName?.trim() || "Alex Rivera";
  const title = seed.title?.trim() || "Full Stack Developer";
  const years = seed.yearsExperience?.trim() || "4+";
  const firstName = fullName.split(/\s+/)[0] || "Alex";
  const slug = slugify(fullName);

  const about = generateAboutLocal({
    ...(seed as PortfolioData),
    fullName,
    title,
    yearsExperience: years,
    skills: seed.skills?.length
      ? seed.skills
      : [
          {
            id: createId(),
            name: "TypeScript",
            level: 90,
            category: "languages",
          },
          { id: createId(), name: "React", level: 92, category: "frontend" },
          { id: createId(), name: "Next.js", level: 88, category: "frontend" },
          { id: createId(), name: "Node.js", level: 85, category: "backend" },
        ],
  } as PortfolioData);

  const hero = generateHeroHeadlineLocal({
    fullName,
    title,
  } as PortfolioData);
  const seo = generateSeoLocal({
    fullName,
    title,
    location: seed.location || "Remote",
    skills: seed.skills || [],
  } as PortfolioData);

  const skills = seed.skills?.length
    ? seed.skills
    : [
        {
          id: createId(),
          name: "TypeScript",
          level: 90,
          category: "languages" as const,
        },
        {
          id: createId(),
          name: "Python",
          level: 72,
          category: "languages" as const,
        },
        {
          id: createId(),
          name: "React",
          level: 94,
          category: "frontend" as const,
        },
        {
          id: createId(),
          name: "Next.js",
          level: 90,
          category: "frontend" as const,
        },
        {
          id: createId(),
          name: "Tailwind CSS",
          level: 88,
          category: "frontend" as const,
        },
        {
          id: createId(),
          name: "Node.js",
          level: 86,
          category: "backend" as const,
        },
        {
          id: createId(),
          name: "PostgreSQL",
          level: 80,
          category: "databases" as const,
        },
        {
          id: createId(),
          name: "Supabase",
          level: 78,
          category: "databases" as const,
        },
        { id: createId(), name: "AWS", level: 70, category: "cloud" as const },
        {
          id: createId(),
          name: "Docker",
          level: 74,
          category: "devops" as const,
        },
        { id: createId(), name: "Git", level: 92, category: "tools" as const },
        {
          id: createId(),
          name: "Leadership",
          level: 80,
          category: "soft" as const,
        },
      ];

  const projects = [
    {
      ...createEmptyProject(),
      name: `${firstName}Board`,
      description: generateProjectDescriptionLocal({
        name: `${firstName}Board`,
        technologies: ["Next.js", "TypeScript", "Supabase"],
        features: ["Kanban", "Analytics"],
      }),
      technologies: ["Next.js", "TypeScript", "Supabase", "Stripe"],
      github: seed.github || "https://github.com",
      liveDemo: "https://example.com",
      featured: true,
      features: ["Kanban pipeline", "AI insights", "Team sharing"],
    },
    {
      ...createEmptyProject(),
      name: "Pulse Analytics",
      description: generateProjectDescriptionLocal({
        name: "Pulse Analytics",
        technologies: ["React", "Node.js", "PostgreSQL"],
        features: ["Realtime dashboards"],
      }),
      technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
      github: seed.github || "https://github.com",
      liveDemo: "https://example.com",
      featured: true,
      features: ["Live metrics", "Role-based access"],
    },
    {
      ...createEmptyProject(),
      name: "ShipKit CLI",
      description: generateProjectDescriptionLocal({
        name: "ShipKit CLI",
        technologies: ["TypeScript", "Node.js"],
        features: ["Scaffolding", "AI helpers"],
      }),
      technologies: ["TypeScript", "Node.js", "OpenAI"],
      github: seed.github || "https://github.com",
      liveDemo: "",
      featured: false,
      features: ["Project scaffolding", "AI codegen"],
    },
  ];

  return {
    ...(seed as PortfolioData),
    slug,
    customDomain: seed.customDomain || "",
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,
    template: seed.template || "modern",
    themeMode: seed.themeMode || "light",
    accentColor: seed.accentColor || "#4f46e5",
    secondaryColor: seed.secondaryColor || "#a855f7",
    fontFamily: seed.fontFamily || "inter",
    animationsEnabled: seed.animationsEnabled ?? true,
    spacing: seed.spacing || "comfortable",
    published: false,
    publishedAt: "",
    updatedAt: new Date().toISOString(),
    sectionOrder: seed.sectionOrder,
    sectionVisibility: seed.sectionVisibility,

    fullName,
    title,
    profilePhoto: seed.profilePhoto || "",
    heroImage: seed.heroImage || "",
    backgroundImage: seed.backgroundImage || "",
    introduction: about.introduction,
    resumeUrl: seed.resumeUrl || "#",
    heroCtaLabel: seed.heroCtaLabel || generateCtaLocal({ title } as PortfolioData),
    heroHeadline: hero.heroHeadline,
    tagline: hero.tagline,

    biography: about.biography,
    careerObjective: about.careerObjective,
    professionalSummary: about.professionalSummary,
    yearsExperience: years,

    skills,
    skillsSummary: generateSkillsSummaryLocal({
      title,
      skills,
    } as PortfolioData),

    projects,
    experience: [
      {
        ...createEmptyTimeline(),
        title: `Senior ${title}`,
        organization: "Nimbus Labs",
        location: "Remote",
        startDate: "2022",
        endDate: "",
        current: true,
        description:
          "Lead product engineering initiatives, ship multi-tenant features, and mentor teammates while improving performance and DX.",
        employmentType: "Full-time",
        technologies: ["Next.js", "TypeScript", "AWS"],
      },
      {
        ...createEmptyTimeline(),
        title: title,
        organization: "BrightPath",
        location: seed.location || "San Francisco, CA",
        startDate: "2019",
        endDate: "2022",
        current: false,
        description:
          "Built customer-facing dashboards, APIs, and billing integrations. Improved CI/CD and release reliability.",
        employmentType: "Full-time",
        technologies: ["React", "Node.js"],
      },
    ],
    education: [
      {
        ...createEmptyTimeline(),
        title: "B.S. Computer Science",
        organization: "State University",
        college: "College of Engineering",
        university: "State University",
        cgpa: "3.7",
        location: seed.location || "",
        startDate: "2015",
        endDate: "2019",
        current: false,
        description:
          "Focus on software engineering, systems, and human-computer interaction.",
      },
    ],
    certifications: [
      {
        ...createEmptyCertification(),
        name: "AWS Certified Developer – Associate",
        issuer: "Amazon Web Services",
        date: "2023",
      },
    ],
    achievements: [
      {
        id: createId(),
        title: "Hackathon Winner",
        description: "1st place for an accessibility-focused product prototype.",
        year: "2021",
      },
      {
        id: createId(),
        title: "Open Source Contributor",
        description: "Maintainer of a popular React utility library.",
        year: "2024",
      },
    ],
    services: [
      {
        ...createEmptyService(),
        title: "Web Application Development",
        description:
          "End-to-end product builds with modern React and Node stacks.",
        icon: "code",
      },
      {
        ...createEmptyService(),
        title: "Performance Audits",
        description:
          "Identify bottlenecks and ship measurable speed improvements.",
        icon: "zap",
      },
    ],
    testimonials: [
      {
        ...createEmptyTestimonial(),
        name: "Priya Sharma",
        role: "Product Manager",
        company: "Nimbus Labs",
        quote: `${firstName} consistently delivers polished features on time and elevates the whole team's engineering quality.`,
      },
    ],
    blogPosts: seed.blogPosts || [],
    languages: seed.languages?.length
      ? seed.languages
      : [
          { id: createId(), name: "English", proficiency: "Native" },
        ],
    hobbies: seed.hobbies?.length
      ? seed.hobbies
      : [
          { id: createId(), name: "Open source" },
          { id: createId(), name: "Hiking" },
        ],
    showServices: true,
    showBlog: false,

    email: seed.email || `${slug}@example.com`,
    phone: seed.phone || "",
    location: seed.location || "Remote",
    mapsEmbedUrl: seed.mapsEmbedUrl || "",
    showContactForm: seed.showContactForm ?? true,
    showMaps: seed.showMaps ?? false,
    linkedin: seed.linkedin || "https://linkedin.com/in/",
    github: seed.github || "https://github.com/",
    portfolioUrl: seed.portfolioUrl || "",
    twitter: seed.twitter || "",
    instagram: seed.instagram || "",
    dribbble: seed.dribbble || "",
    youtube: seed.youtube || "",
    medium: seed.medium || "",
    devto: seed.devto || "",
    leetcode: seed.leetcode || "",
    hackerrank: seed.hackerrank || "",

    footerTagline: seed.footerTagline || "Designed for impact. Built with care.",
    analytics: seed.analytics || {
      views: 0,
      uniqueVisitors: 0,
      resumeDownloads: 0,
      contactSubmissions: 0,
      githubClicks: 0,
      linkedinClicks: 0,
    },
  } as PortfolioData;
}

export function runLocalAiAction(
  action: PortfolioAiAction,
  portfolio: PortfolioData,
  options?: { projectId?: string; text?: string }
): Record<string, unknown> {
  switch (action) {
    case "about":
      return { ...generateAboutLocal(portfolio), demo: true };
    case "bio":
      return { bio: generateBioLocal(portfolio), demo: true };
    case "skills_summary":
      return {
        skillsSummary: generateSkillsSummaryLocal(portfolio),
        demo: true,
      };
    case "project": {
      const project = (portfolio.projects || []).find(
        (p) => p.id === options?.projectId
      );
      return {
        description: generateProjectDescriptionLocal(
          project ?? { name: "", technologies: [], features: [] }
        ),
        demo: true,
      };
    }
    case "full_portfolio":
      return { portfolio: generateFullPortfolioLocal(portfolio), demo: true };
    case "hero_headline":
      return { ...generateHeroHeadlineLocal(portfolio), demo: true };
    case "cta":
      return { heroCtaLabel: generateCtaLocal(portfolio), demo: true };
    case "seo":
      return { ...generateSeoLocal(portfolio), demo: true };
    case "improve":
      return {
        text: improveContentLocal(options?.text || portfolio.biography),
        demo: true,
      };
    case "rewrite":
      return {
        text: rewriteContentLocal(options?.text || portfolio.biography),
        demo: true,
      };
    case "fix_grammar":
      return {
        text: fixGrammarLocal(options?.text || portfolio.biography),
        demo: true,
      };
    default:
      return { error: "Unknown action", demo: true };
  }
}
