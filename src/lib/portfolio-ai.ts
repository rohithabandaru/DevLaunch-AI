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
