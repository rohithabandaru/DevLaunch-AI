import { NextResponse } from "next/server";
import { requireAiAccess, jsonError } from "@/lib/api-auth";
import { getOpenAI } from "@/lib/openai";
import { coachBodySchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const auth = await requireAiAccess();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const parsed = coachBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Question and answer are required", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { question, answer } = parsed.data;
    const openai = getOpenAI();

    if (!openai) {
      return NextResponse.json({
        score: 8,
        feedback:
          "Good response. You structured your answer well, but you could provide more specific metrics in the 'Result' phase of your STAR format.",
        strengths: ["Clear situation setup", "Action steps were detailed"],
        improvements: [
          "Add concrete metrics (e.g. 'improved performance by 20%')",
          "Keep the context slightly shorter",
        ],
        demo: true,
      });
    }

    const prompt = `
You are an expert interview coach evaluating a candidate's response to an interview question using the STAR (Situation, Task, Action, Result) method.
Provide a JSON response with:
- "score": A score out of 10 for the candidate's answer.
- "feedback": A 2-3 sentence overall evaluation.
- "strengths": Array of string positive points.
- "improvements": Array of string areas to improve.

Question:
${question}

Candidate's Answer:
${answer}
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
    console.error("Coach API Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: message },
      { status: 500 }
    );
  }
}
