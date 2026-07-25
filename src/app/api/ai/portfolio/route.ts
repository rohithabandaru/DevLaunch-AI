import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAiAccess, jsonError } from "@/lib/api-auth";
import { getOpenAI } from "@/lib/openai";
import {
  generateAboutLocal,
  generateFullPortfolioLocal,
  generateProjectDescriptionLocal,
  generateSkillsSummaryLocal,
} from "@/lib/portfolio-ai";
import type { PortfolioData } from "@/types/portfolio";

const bodySchema = z.object({
  action: z.enum(["about", "project", "skills_summary", "full_portfolio"]),
  portfolio: z.record(z.string(), z.unknown()).optional(),
  projectId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAiAccess();
    // Allow unauthenticated local-style responses so the builder always works
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid request", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { action, projectId } = parsed.data;
    const portfolio = (parsed.data.portfolio ?? {}) as unknown as PortfolioData;
    const openai = auth.ok ? getOpenAI() : null;

    if (!openai) {
      return NextResponse.json(localResponse(action, portfolio, projectId, true));
    }

    if (action === "about") {
      const prompt = `Write portfolio copy for:
Name: ${portfolio.fullName || "Professional"}
Title: ${portfolio.title || "Developer"}
Years: ${portfolio.yearsExperience || "several"}
Skills: ${(portfolio.skills || []).map((s) => s.name).filter(Boolean).join(", ") || "general software"}

Return JSON with fields: introduction (1-2 sentences), biography (2 short paragraphs), careerObjective (1-2 sentences).`;

      const result = await chatJson(openai, prompt);
      return NextResponse.json({
        introduction: result.introduction,
        biography: result.biography,
        careerObjective: result.careerObjective,
      });
    }

    if (action === "skills_summary") {
      const prompt = `Write a concise skills summary (2-3 sentences) for a portfolio.
Title: ${portfolio.title || "Engineer"}
Skills: ${JSON.stringify(portfolio.skills || [])}
Return JSON: { "skillsSummary": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({
        skillsSummary: result.skillsSummary,
      });
    }

    if (action === "project") {
      const project = (portfolio.projects || []).find((p) => p.id === projectId);
      if (!project) return jsonError("Project not found", 400);
      const prompt = `Write a polished project description (2-3 sentences) for a portfolio card.
Project name: ${project.name || "Untitled"}
Technologies: ${(project.technologies || []).join(", ") || "web technologies"}
Existing notes: ${project.description || "none"}
Return JSON: { "description": "..." }`;
      const result = await chatJson(openai, prompt);
      return NextResponse.json({ description: result.description });
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
introduction, biography, careerObjective, skillsSummary,
skills: array of {name, level 0-100, category one of languages|frontend|backend|databases|frameworks|cloud|tools},
projects: array of {name, description, technologies:string[], featured:boolean},
experience: array of {title, organization, location, startDate, endDate, current:boolean, description},
education: array of same shape as experience,
certifications: array of {name, issuer, date},
services: array of {title, description},
testimonials: array of {name, role, company, quote}.
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

function localResponse(
  action: string,
  portfolio: PortfolioData,
  projectId?: string,
  demo = true
) {
  if (action === "about") {
    return { ...generateAboutLocal(portfolio), demo };
  }
  if (action === "skills_summary") {
    return { skillsSummary: generateSkillsSummaryLocal(portfolio), demo };
  }
  if (action === "project") {
    const project = (portfolio.projects || []).find((p) => p.id === projectId);
    return {
      description: generateProjectDescriptionLocal(
        project ?? { name: "", technologies: [] }
      ),
      demo,
    };
  }
  if (action === "full_portfolio") {
    return { portfolio: generateFullPortfolioLocal(portfolio), demo };
  }
  return { error: "Unknown action", demo };
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

  if (typeof ai.introduction === "string") next.introduction = ai.introduction;
  if (typeof ai.biography === "string") next.biography = ai.biography;
  if (typeof ai.careerObjective === "string")
    next.careerObjective = ai.careerObjective;
  if (typeof ai.skillsSummary === "string")
    next.skillsSummary = ai.skillsSummary;

  if (Array.isArray(ai.skills) && ai.skills.length) {
    next.skills = ai.skills.map((s: Record<string, unknown>) => ({
      id: crypto.randomUUID(),
      name: String(s.name ?? ""),
      level: Math.min(100, Math.max(0, Number(s.level) || 75)),
      category: (["languages", "frontend", "backend", "databases", "frameworks", "cloud", "tools"].includes(
        String(s.category)
      )
        ? s.category
        : "tools") as PortfolioData["skills"][0]["category"],
    }));
  }

  if (Array.isArray(ai.projects) && ai.projects.length) {
    next.projects = ai.projects.map((p: Record<string, unknown>) => ({
      id: crypto.randomUUID(),
      name: String(p.name ?? ""),
      description: String(p.description ?? ""),
      image: "",
      technologies: Array.isArray(p.technologies)
        ? p.technologies.map(String)
        : [],
      github: base.github || "",
      liveDemo: "",
      featured: Boolean(p.featured),
    }));
  }

  const mapTimeline = (items: unknown) => {
    if (!Array.isArray(items) || !items.length) return null;
    return items.map((i: Record<string, unknown>) => ({
      id: crypto.randomUUID(),
      title: String(i.title ?? ""),
      organization: String(i.organization ?? ""),
      location: String(i.location ?? ""),
      startDate: String(i.startDate ?? ""),
      endDate: String(i.endDate ?? ""),
      current: Boolean(i.current),
      description: String(i.description ?? ""),
    }));
  };

  const exp = mapTimeline(ai.experience);
  if (exp) next.experience = exp;
  const edu = mapTimeline(ai.education);
  if (edu) next.education = edu;

  if (Array.isArray(ai.certifications) && ai.certifications.length) {
    next.certifications = ai.certifications.map((c: Record<string, unknown>) => ({
      id: crypto.randomUUID(),
      name: String(c.name ?? ""),
      issuer: String(c.issuer ?? ""),
      date: String(c.date ?? ""),
      credentialUrl: "",
    }));
  }

  if (Array.isArray(ai.services) && ai.services.length) {
    next.services = ai.services.map((s: Record<string, unknown>) => ({
      id: crypto.randomUUID(),
      title: String(s.title ?? ""),
      description: String(s.description ?? ""),
      icon: "sparkles",
    }));
    next.showServices = true;
  }

  if (Array.isArray(ai.testimonials) && ai.testimonials.length) {
    next.testimonials = ai.testimonials.map((t: Record<string, unknown>) => ({
      id: crypto.randomUUID(),
      name: String(t.name ?? ""),
      role: String(t.role ?? ""),
      company: String(t.company ?? ""),
      quote: String(t.quote ?? ""),
      avatar: "",
    }));
  }

  return next;
}
