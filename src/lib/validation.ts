import { z } from "zod";

export const matchBodySchema = z.object({
  resumeText: z.string().min(1).max(50_000),
  jobDescription: z.string().min(1).max(50_000),
});

export const analyzeBodySchema = z.object({
  jobDescription: z.string().min(1).max(50_000),
});

export const coverLetterBodySchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  skills: z.string().max(5_000).optional(),
  resumeText: z.string().max(50_000).optional(),
});

export const coachBodySchema = z.object({
  question: z.string().min(1).max(5_000),
  answer: z.string().min(1).max(20_000),
});

export const checkoutBodySchema = z.object({
  planType: z.enum(["monthly", "yearly"]).default("monthly"),
});
