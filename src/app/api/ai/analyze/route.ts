import { NextResponse } from "next/server";
import { requireAiAccess, jsonError } from "@/lib/api-auth";
import { getOpenAI } from "@/lib/openai";
import { analyzeBodySchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const auth = await requireAiAccess();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const parsed = analyzeBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Job Description is required", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { jobDescription } = parsed.data;
    const openai = getOpenAI();

    if (!openai) {
      return NextResponse.json({
        summary:
          "This is a standard Software Engineering role focused on frontend development.",
        keyRequirements: ["React", "TypeScript", "3+ years experience"],
        redFlags: [
          "Fast-paced environment (potential burnout)",
          "Wear many hats (lack of clear role boundaries)",
        ],
        culture: "Startup culture with potential for high impact.",
        demo: true,
      });
    }

    const prompt = `
You are an expert career advisor analyzing a job description.
Read the following job description and provide a JSON response with:
- "summary": A brief 1-2 sentence summary of the role.
- "keyRequirements": Array of string key skills/qualifications.
- "redFlags": Array of string potential red flags or warnings (e.g., "fast-paced" often means overwork).
- "culture": A brief assessment of the company culture based on the JD.

Job Description:
${jobDescription}
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
    console.error("Analyze API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job description", details: message },
      { status: 500 }
    );
  }
}
