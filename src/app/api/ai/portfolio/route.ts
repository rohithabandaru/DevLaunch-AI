import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAiAccess, jsonError } from "@/lib/api-auth";
import { getOpenAI } from "@/lib/openai";
import {
  generateFullPortfolioLocal,
  runLocalAiAction,
} from "@/lib/portfolio-ai";
import { createId } from "@/lib/portfolio";
import type { PortfolioAiAction, PortfolioData } from "@/types/portfolio";

const AI_ACTIONS = [
  "about",
  "bio",
  "project",
  "skills_summary",
  "full_portfolio",
  "improve",
  "rewrite",
  "fix_grammar",
  "seo",
  "hero_headline",
  "cta",
] as const;

const bodySchema = z.object({
  action: z.enum(AI_ACTIONS),
  portfolio: z.record(z.string(), z.unknown()).optional(),
  projectId: z.string().optional(),
  text: z.string().optional(),
  field: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAiAccess();
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid request", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { action, projectId, text } = parsed.data;
    const portfolio = (parsed.data.portfolio ?? {}) as unknown as PortfolioData;
    const openai = auth.ok ? getOpenAI() : null;

    if (!openai) {
      return NextResponse.json(
        runLocalAiAction(action as PortfolioAiAction, portfolio, {
          projectId,
          text,
        })
      );
    }

    if (action === "about") {
      const prompt = `Write portfolio copy for:
Name: ${portfolio.fullName || "Professional"}
Title: ${portfolio.title || "Developer"}
Years: ${portfolio.yearsExperience || "several"}
Skills: ${(portfolio.skills || []).map((s) => s.name).filter(Boolean).join(", ") || "general software"}

Return JSON with fields: introduction (1-2 sentences), biography (2 short paragraphs), careerObjective (1-2 sentences), professionalSummary (2-3 sentences).`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({
        introduction: result.introduction,
        biography: result.biography,
        careerObjective: result.careerObjective,
        professionalSummary: result.professionalSummary,
      });
    }

    if (action === "bio") {
      const prompt = `Write a concise professional bio (2-3 sentences) for a portfolio.
Name: ${portfolio.fullName || "Professional"}
Title: ${portfolio.title || "Developer"}
Skills: ${(portfolio.skills || []).map((s) => s.name).filter(Boolean).join(", ")}
Return JSON: { "bio": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({ bio: result.bio });
    }

    if (action === "skills_summary") {
      const prompt = `Write a concise skills summary (2-3 sentences) for a portfolio.
Title: ${portfolio.title || "Engineer"}
Skills: ${JSON.stringify(portfolio.skills || [])}
Return JSON: { "skillsSummary": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({ skillsSummary: result.skillsSummary });
    }

    if (action === "project") {
      const project = (portfolio.projects || []).find((p) => p.id === projectId);
      if (!project) return jsonError("Project not found", 400);
      const prompt = `Write a polished project description (2-3 sentences) for a portfolio card.
Project name: ${project.name || "Untitled"}
Technologies: ${(project.technologies || []).join(", ") || "web technologies"}
Features: ${(project.features || []).join(", ") || "none"}
Existing notes: ${project.description || "none"}
Return JSON: { "description": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({ description: result.description });
    }

    if (action === "hero_headline") {
      const prompt = `Write a hero headline, short tagline, and intro for a portfolio.
Name: ${portfolio.fullName || "Professional"}
Title: ${portfolio.title || "Developer"}
Return JSON: { "heroHeadline": "...", "tagline": "...", "introduction": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({
        heroHeadline: result.heroHeadline,
        tagline: result.tagline,
        introduction: result.introduction,
      });
    }

    if (action === "cta") {
      const prompt = `Suggest a short primary CTA button label (2-5 words) for a portfolio hero.
Title: ${portfolio.title || "Developer"}
Return JSON: { "heroCtaLabel": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({ heroCtaLabel: result.heroCtaLabel });
    }

    if (action === "seo") {
      const prompt = `Write SEO title (under 60 chars) and meta description (under 155 chars) for a portfolio.
Name: ${portfolio.fullName || "Professional"}
Title: ${portfolio.title || "Developer"}
Location: ${portfolio.location || ""}
Skills: ${(portfolio.skills || []).map((s) => s.name).filter(Boolean).slice(0, 6).join(", ")}
Return JSON: { "seoTitle": "...", "seoDescription": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
      });
    }

    if (
      action === "improve" ||
      action === "rewrite" ||
      action === "fix_grammar"
    ) {
      const source =
        text ||
        portfolio.biography ||
        portfolio.introduction ||
        portfolio.professionalSummary ||
        "";
      if (!source.trim()) {
        return jsonError("No text provided to improve", 400);
      }
      const verbs: Record<string, string> = {
        improve: "Improve clarity, impact, and professionalism of this portfolio copy while preserving meaning",
        rewrite: "Rewrite this portfolio copy in a fresh, polished voice",
        fix_grammar: "Fix grammar, spelling, and punctuation only — keep meaning identical",
      };
      const prompt = `${verbs[action]}:
"""
${source}
"""
Return JSON: { "text": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({ text: result.text });
    }

    if (action === "full_portfolio") {
      const prompt = `Generate starter portfolio content as JSON for:
Name: ${portfolio.fullName || "Alex Rivera"}
Title: ${portfolio.title || "Full Stack Developer"}
Years: ${portfolio.yearsExperience || "4+"}
Location: ${portfolio.location || "Remote"}
Email: ${portfolio.email || ""}
GitHub: ${portfolio.github || ""}
LinkedIn: ${portfolio.linkedin || ""}

Return JSON with:
introduction, biography, careerObjective, professionalSummary, skillsSummary, heroHeadline, tagline, heroCtaLabel, seoTitle, seoDescription,
skills: array of {name, level 0-100, category one of languages|frontend|backend|databases|frameworks|cloud|devops|tools|soft},
projects: array of {name, description, technologies:string[], featured:boolean, features:string[]},
experience: array of {title, organization, location, startDate, endDate, current:boolean, description, employmentType, technologies:string[]},
education: array of {title, organization, college, university, cgpa, location, startDate, endDate, description},
certifications: array of {name, issuer, date},
services: array of {title, description},
testimonials: array of {name, role, company, quote},
languages: array of {name, proficiency},
hobbies: array of {name}.
Keep content realistic and professional.`;

      const result = await chatJson(openai, prompt);
      const local = generateFullPortfolioLocal(portfolio);
      return NextResponse.json({
        portfolio: mergeAiPortfolio(local, result),
        demo: false,
      });
    }

    return jsonError("Unknown action", 400);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Portfolio AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate portfolio content", details: message },
      { status: 500 }
    );
  }
}

async function chatJson(
  openai: NonNullable<ReturnType<typeof getOpenAI>>,
  prompt: string
): Promise<Record<string, unknown>> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You output ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });
  const text = response.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as Record<string, unknown>;
}

function mergeAiPortfolio(
  base: PortfolioData,
  ai: Record<string, unknown>
): PortfolioData {
  const next = { ...base };

  const str = (k: string) =>
    typeof ai[k] === "string" ? (ai[k] as string) : undefined;

  if (str("introduction")) next.introduction = str("introduction")!;
  if (str("biography")) next.biography = str("biography")!;
  if (str("careerObjective")) next.careerObjective = str("careerObjective")!;
  if (str("professionalSummary"))
    next.professionalSummary = str("professionalSummary")!;
  if (str("skillsSummary")) next.skillsSummary = str("skillsSummary")!;
  if (str("heroHeadline")) next.heroHeadline = str("heroHeadline")!;
  if (str("tagline")) next.tagline = str("tagline")!;
  if (str("heroCtaLabel")) next.heroCtaLabel = str("heroCtaLabel")!;
  if (str("seoTitle")) next.seoTitle = str("seoTitle")!;
  if (str("seoDescription")) next.seoDescription = str("seoDescription")!;

  const categories = [
    "languages",
    "frontend",
    "backend",
    "databases",
    "frameworks",
    "cloud",
    "devops",
    "tools",
    "soft",
  ];

  if (Array.isArray(ai.skills) && ai.skills.length) {
    next.skills = ai.skills.map((s: Record<string, unknown>) => ({
      id: createId(),
      name: String(s.name ?? ""),
      level: Math.min(100, Math.max(0, Number(s.level) || 75)),
      category: (categories.includes(String(s.category))
        ? s.category
        : "tools") as PortfolioData["skills"][0]["category"],
    }));
  }

  if (Array.isArray(ai.projects) && ai.projects.length) {
    next.projects = ai.projects.map((p: Record<string, unknown>) => ({
      id: createId(),
      name: String(p.name ?? ""),
      description: String(p.description ?? ""),
      image: "",
      images: [],
      technologies: Array.isArray(p.technologies)
        ? p.technologies.map(String)
        : [],
      github: base.github || "",
      liveDemo: "",
      featured: Boolean(p.featured),
      features: Array.isArray(p.features) ? p.features.map(String) : [],
      challenges: String(p.challenges ?? ""),
      achievements: String(p.achievements ?? ""),
    }));
  }

  const mapTimeline = (items: unknown) => {
    if (!Array.isArray(items) || !items.length) return null;
    return items.map((i: Record<string, unknown>) => ({
      id: createId(),
      title: String(i.title ?? ""),
      organization: String(i.organization ?? ""),
      location: String(i.location ?? ""),
      startDate: String(i.startDate ?? ""),
      endDate: String(i.endDate ?? ""),
      current: Boolean(i.current),
      description: String(i.description ?? ""),
      college: String(i.college ?? ""),
      university: String(i.university ?? ""),
      cgpa: String(i.cgpa ?? ""),
      employmentType: String(i.employmentType ?? "Full-time"),
      technologies: Array.isArray(i.technologies)
        ? i.technologies.map(String)
        : [],
    }));
  };

  const exp = mapTimeline(ai.experience);
  if (exp) next.experience = exp;
  const edu = mapTimeline(ai.education);
  if (edu) next.education = edu;

  if (Array.isArray(ai.certifications) && ai.certifications.length) {
    next.certifications = ai.certifications.map((c: Record<string, unknown>) => ({
      id: createId(),
      name: String(c.name ?? ""),
      issuer: String(c.issuer ?? ""),
      date: String(c.date ?? ""),
      credentialUrl: "",
    }));
  }

  if (Array.isArray(ai.services) && ai.services.length) {
    next.services = ai.services.map((s: Record<string, unknown>) => ({
      id: createId(),
      title: String(s.title ?? ""),
      description: String(s.description ?? ""),
      icon: "sparkles",
    }));
    next.showServices = true;
    next.sectionVisibility = {
      ...next.sectionVisibility,
      services: true,
    };
  }

  if (Array.isArray(ai.testimonials) && ai.testimonials.length) {
    next.testimonials = ai.testimonials.map((t: Record<string, unknown>) => ({
      id: createId(),
      name: String(t.name ?? ""),
      role: String(t.role ?? ""),
      company: String(t.company ?? ""),
      quote: String(t.quote ?? ""),
      avatar: "",
    }));
  }

  if (Array.isArray(ai.languages) && ai.languages.length) {
    next.languages = ai.languages.map((l: Record<string, unknown>) => ({
      id: createId(),
      name: String(l.name ?? ""),
      proficiency: String(l.proficiency ?? "Fluent"),
    }));
  }

  if (Array.isArray(ai.hobbies) && ai.hobbies.length) {
    next.hobbies = ai.hobbies.map((h: Record<string, unknown>) => ({
      id: createId(),
      name: String(typeof h === "string" ? h : (h.name ?? "")),
    }));
  }

  return next;
}
