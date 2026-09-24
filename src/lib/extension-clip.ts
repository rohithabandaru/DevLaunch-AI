import { z } from 'zod';

export const clipJobSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(200),
  title: z.string().trim().min(1, 'Title is required').max(200),
  location: z.string().trim().max(200).optional().default('Remote'),
  workplaceType: z.enum(['Remote', 'Hybrid', 'Onsite']).optional().default('Remote'),
  url: z.string().trim().max(2000).optional().default(''),
  salary: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().max(6000).optional().default(''),
});

export type ClipJobInput = z.infer<typeof clipJobSchema>;

export const CLIP_RATE_LIMIT = 30;
export const CLIP_RATE_WINDOW_MS = 60 * 1000;