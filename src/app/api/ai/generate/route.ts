import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth-server';
import { checkRateLimit } from '@/lib/rate-limit';
import { jsonError, readJsonBody, MAX_BODY_BYTES } from '@/lib/http';

let serverOpenAI: OpenAI | null = null;

/**
 * Server-only OpenAI client. The key lives exclusively in server environment
 * configuration and is never sent to the browser.
 */
function getServerOpenAI(): OpenAI | null {
  if (serverOpenAI) return serverOpenAI;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your-openai-api-key') || apiKey.startsWith('your-')) {
    return null;
  }

  // Never touch a real key in this process when we are bundling for the browser.
  if (typeof window !== 'undefined') return null;

  try {
    serverOpenAI = new OpenAI({ apiKey });
    return serverOpenAI;
  } catch {
    serverOpenAI = null;
    return null;
  }
}

const generateSchema = z.object({
  action: z.enum(['generateSummary', 'generateCoverLetter']),
  payload: z
    .object({
      fullName: z.string().max(200).optional(),
      role: z.string().max(200).optional(),
      skills: z.array(z.string().max(100)).max(30).optional(),
      jobTitle: z.string().max(200).optional(),
      company: z.string().max(200).optional(),
      description: z.string().max(6000).optional(),
      tone: z.string().max(100).optional(),
      length: z.string().max(100).optional(),
      candidateName: z.string().max(200).optional(),
    })
    .optional()
    .default({}),
});

const AI_RATE_LIMIT = 20;
const AI_RATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Authentication required.');
  }

  const rateLimitResult = checkRateLimit(`ai:${user.id}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS);
  if (rateLimitResult) {
    return jsonError(429, 'Too many requests. Please try again later.');
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonError(400, 'Invalid request body.');
  }
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return jsonError(413, 'Request body is too large.');
  }

  const parsedBody = await readJsonBody(rawBody);
  if (!parsedBody.ok) {
    return jsonError(parsedBody.status, parsedBody.message);
  }

  const validation = generateSchema.safeParse(parsedBody.data);
  if (!validation.success) {
    return jsonError(400, 'Invalid request payload.');
  }

  const { action, payload } = validation.data;
  const client = getServerOpenAI();

  if (!client) {
    // Fail safely: no fake success, no secret exposure.
    return jsonError(503, 'AI service is not configured on the server.');
  }

  try {
    let result: string | null = null;

    if (action === 'generateSummary') {
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an executive resume writer. Return a 2-3 sentence summary.' },
          { role: 'user', content: `Name: ${payload.fullName || ''}\nRole: ${payload.role || ''}\nSkills: ${(payload.skills || []).join(', ')}` },
        ],
        max_tokens: 150,
      });
      result = response.choices[0]?.message?.content?.trim() || null;
    } else if (action === 'generateCoverLetter') {
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Executive cover letter coach. Tone: ${payload.tone || 'Professional'}, Length: ${payload.length || 'Medium'}` },
          { role: 'user', content: `Candidate: ${payload.candidateName || ''}\nJob: ${payload.jobTitle || ''} at ${payload.company || ''}\nContext: ${payload.description || ''}` },
        ],
        max_tokens: payload.length === 'Comprehensive' ? 450 : 250,
      });
      result = response.choices[0]?.message?.content?.trim() || null;
    }

    if (!result) {
      return jsonError(502, 'AI service returned an empty response.');
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    // Log details server-side only; return a generic message to the client.
     
    console.error('[ai/generate] OpenAI request failed:', err);
    return jsonError(502, 'AI service is temporarily unavailable.');
  }
}