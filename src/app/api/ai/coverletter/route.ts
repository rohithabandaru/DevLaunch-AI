import { NextResponse } from "next/server";
import { requireAiAccess, jsonError } from "@/lib/api-auth";
import { getOpenAI } from "@/lib/openai";
import { coverLetterBodySchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const auth = await requireAiAccess();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const parsed = coverLetterBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Company and role are required", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { company, role, skills, resumeText } = parsed.data;
    const openai = getOpenAI();

    if (!openai) {
      return NextResponse.json({
        coverLetter: `Dear Hiring Manager at ${company},\n\nI am writing to express my strong interest in the ${role} position. With my background and skills in ${skills || "software development"}, I am confident in my ability to contribute effectively to your team.\n\nMy previous experiences have prepared me to tackle the challenges of this role and deliver high-quality results. I would welcome the opportunity to discuss how my qualifications align with your needs.\n\nSincerely,\n[Your Name]`,
        demo: true,
      });
    }

    const prompt = `
You are an expert career coach writing a professional, engaging cover letter.
Write a cover letter for the following position:
- Company: ${company}
- Role: ${role}
- Skills to highlight: ${skills || "None provided"}
- Resume Context (optional): ${resumeText || "None provided"}

Return a JSON object with a single field "coverLetter" containing the formatted text of the cover letter.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You output ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const resultText = response.choices[0].message.content;
    const result = JSON.parse(resultText || "{}");

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cover Letter API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter", details: message },
      { status: 500 }
    );
  }
}
