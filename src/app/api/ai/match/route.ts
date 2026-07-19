import { NextResponse } from "next/server";
import { requireAiAccess, jsonError } from "@/lib/api-auth";
import { getOpenAI } from "@/lib/openai";
import { matchBodySchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const auth = await requireAiAccess();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const parsed = matchBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Resume text and Job Description are required", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { resumeText, jobDescription } = parsed.data;
    const openai = getOpenAI();

    if (!openai) {
      return NextResponse.json({
        score: 75,
        matchedKeywords: ["React", "TypeScript", "Node.js"],
        missingKeywords: ["GraphQL", "AWS", "Docker"],
        suggestions: [
          "Highlight your experience with cloud technologies.",
          "Add more details about your backend API design skills.",
        ],
        demo: true,
      });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) optimizer. 
Compare the following resume to the job description.
Return a JSON object with:
- "score": A number from 0 to 100 representing how well the resume matches the JD.
- "matchedKeywords": Array of string keywords found in both.
- "missingKeywords": Array of string keywords from the JD missing in the resume.
- "suggestions": Array of string actionable tips to improve the resume for this job.

Resume:
${resumeText}

Job Description:
${jobDescription}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an ATS Match API that outputs ONLY valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const resultText = response.choices[0].message.content;
    const result = JSON.parse(resultText || "{}");

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Match API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate match score", details: message },
      { status: 500 }
    );
  }
}
