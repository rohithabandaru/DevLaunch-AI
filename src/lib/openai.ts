import OpenAI from "openai";

let client: OpenAI | null | undefined;

export function getOpenAI(): OpenAI | null {
  if (client !== undefined) return client;
  const key = process.env.OPENAI_API_KEY;
  client = key ? new OpenAI({ apiKey: key }) : null;
  return client;
}
