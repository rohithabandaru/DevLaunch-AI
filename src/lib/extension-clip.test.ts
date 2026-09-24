import { describe, it, expect } from 'vitest';
import { clipJobSchema } from './extension-clip';

describe('Chrome Extension Clip Payload Validation', () => {
  it('accepts a minimal valid payload and applies defaults', () => {
    const parsed = clipJobSchema.safeParse({ company: 'Stripe', title: 'Engineer' });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.location).toBe('Remote');
      expect(parsed.data.workplaceType).toBe('Remote');
      expect(parsed.data.url).toBe('');
    }
  });

  it('rejects payloads missing the required title', () => {
    const parsed = clipJobSchema.safeParse({ company: 'Stripe' });
    expect(parsed.success).toBe(false);
  });

  it('rejects payloads missing the required company', () => {
    const parsed = clipJobSchema.safeParse({ title: 'Engineer' });
    expect(parsed.success).toBe(false);
  });

  it('rejects overly long fields', () => {
    const parsed = clipJobSchema.safeParse({ company: 'x'.repeat(300), title: 'Engineer' });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid workplaceType values', () => {
    const parsed = clipJobSchema.safeParse({
      company: 'Stripe',
      title: 'Engineer',
      workplaceType: 'Mars',
    });
    expect(parsed.success).toBe(false);
  });
});