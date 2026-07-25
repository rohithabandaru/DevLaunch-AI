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
import type { PortfolioData, PortfolioProject } from "@/types/portfolio";

/** Local fallback generators when AI API is unavailable. */
export function generateAboutLocal(data: PortfolioData): {
  biography: string;
  careerObjective: string;
  introduction: string;
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
  };
}

export function generateProjectDescriptionLocal(
  project: Pick<PortfolioProject, "name" | "technologies">
): string {
  const name = project.name.trim() || "This project";
  const tech =
    project.technologies.filter(Boolean).join(", ") ||
    "modern web technologies";

  return `${name} is a production-ready application built with ${tech}. It focuses on a clean user experience, solid architecture, and measurable outcomes — from responsive UI to reliable data flows and deployment automation.`;
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
    parts.push(`languages (${byCategory.get("languages")!.slice(0, 4).join(", ")})`);
  }
  if (byCategory.get("frontend")?.length) {
    parts.push(`frontend (${byCategory.get("frontend")!.slice(0, 3).join(", ")})`);
  }
  if (byCategory.get("backend")?.length) {
    parts.push(`backend (${byCategory.get("backend")!.slice(0, 3).join(", ")})`);
  }
  if (byCategory.get("cloud")?.length) {
    parts.push(`cloud (${byCategory.get("cloud")!.slice(0, 2).join(", ")})`);
  }

  const title = data.title.trim() || "engineer";
  if (parts.length === 0) {
    return `Versatile ${title} with a broad toolkit across the full product stack and a bias for practical, production-ready solutions.`;
  }

  return `As a ${title}, I work confidently across ${parts.join("; ")}. I balance speed with code quality and prefer tools that help teams ship maintainable software.`;
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
          { id: createId(), name: "TypeScript", level: 90, category: "languages" },
          { id: createId(), name: "React", level: 92, category: "frontend" },
          { id: createId(), name: "Next.js", level: 88, category: "frontend" },
          { id: createId(), name: "Node.js", level: 85, category: "backend" },
        ],
  } as PortfolioData);

  const skills = seed.skills?.length
    ? seed.skills
    : [
        { id: createId(), name: "TypeScript", level: 90, category: "languages" as const },
        { id: createId(), name: "Python", level: 72, category: "languages" as const },
        { id: createId(), name: "React", level: 94, category: "frontend" as const },
        { id: createId(), name: "Next.js", level: 90, category: "frontend" as const },
        { id: createId(), name: "Tailwind CSS", level: 88, category: "frontend" as const },
        { id: createId(), name: "Node.js", level: 86, category: "backend" as const },
        { id: createId(), name: "PostgreSQL", level: 80, category: "databases" as const },
        { id: createId(), name: "Supabase", level: 78, category: "databases" as const },
        { id: createId(), name: "AWS", level: 70, category: "cloud" as const },
        { id: createId(), name: "Docker", level: 74, category: "cloud" as const },
        { id: createId(), name: "Git", level: 92, category: "tools" as const },
        { id: createId(), name: "Figma", level: 68, category: "tools" as const },
      ];

  const projects = [
    {
      ...createEmptyProject(),
      name: `${firstName}Board`,
      description: generateProjectDescriptionLocal({
        name: `${firstName}Board`,
        technologies: ["Next.js", "TypeScript", "Supabase"],
      }),
      technologies: ["Next.js", "TypeScript", "Supabase", "Stripe"],
      github: seed.github || "https://github.com",
      liveDemo: "https://example.com",
      featured: true,
    },
    {
      ...createEmptyProject(),
      name: "Pulse Analytics",
      description: generateProjectDescriptionLocal({
        name: "Pulse Analytics",
        technologies: ["React", "Node.js", "PostgreSQL"],
      }),
      technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
      github: seed.github || "https://github.com",
      liveDemo: "https://example.com",
      featured: true,
    },
    {
      ...createEmptyProject(),
      name: "ShipKit CLI",
      description: generateProjectDescriptionLocal({
        name: "ShipKit CLI",
        technologies: ["TypeScript", "Node.js"],
      }),
      technologies: ["TypeScript", "Node.js", "OpenAI"],
      github: seed.github || "https://github.com",
      liveDemo: "",
      featured: false,
    },
  ];

  return {
    slug,
    customDomain: seed.customDomain || "",
    seoTitle: `${fullName} — ${title}`,
    seoDescription: about.introduction.slice(0, 160),
    template: seed.template || "modern",
    themeMode: seed.themeMode || "light",
    accentColor: seed.accentColor || "#4f46e5",
    fontFamily: seed.fontFamily || "inter",
    animationsEnabled: seed.animationsEnabled ?? true,
    published: false,

    fullName,
    title,
    profilePhoto: seed.profilePhoto || "",
    introduction: about.introduction,
    resumeUrl: seed.resumeUrl || "#",
    heroCtaLabel: seed.heroCtaLabel || "Let's talk",

    biography: about.biography,
    careerObjective: about.careerObjective,
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
      },
    ],
    education: [
      {
        ...createEmptyTimeline(),
        title: "B.S. Computer Science",
        organization: "State University",
        location: seed.location || "",
        startDate: "2015",
        endDate: "2019",
        current: false,
        description: "Focus on software engineering, systems, and human-computer interaction.",
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
        description: "End-to-end product builds with modern React and Node stacks.",
        icon: "code",
      },
      {
        ...createEmptyService(),
        title: "Performance Audits",
        description: "Identify bottlenecks and ship measurable speed improvements.",
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
    blogPosts: [],
    showServices: true,
    showBlog: false,

    email: seed.email || `${slug}@example.com`,
    phone: seed.phone || "",
    location: seed.location || "Remote",
    linkedin: seed.linkedin || "https://linkedin.com/in/",
    github: seed.github || "https://github.com/",
    portfolioUrl: seed.portfolioUrl || "",
    twitter: seed.twitter || "",
    dribbble: seed.dribbble || "",
    youtube: seed.youtube || "",
    medium: seed.medium || "",

    footerTagline: seed.footerTagline || "Designed for impact. Built with care.",
  };
}
