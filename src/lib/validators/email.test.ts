import { describe, it, expect } from 'vitest';
import { emailSchema } from './email';

describe('Email Domain & Format Validator', () => {
  it('validates correct email addresses', () => {
    const result = emailSchema.safeParse('alex.morgan@devlaunch.ai');
    expect(result.success).toBe(true);
  });

  it('rejects disposable email domains', () => {
    const result = emailSchema.safeParse('testuser@tempmail.com');
    expect(result.success).toBe(false);
  });

  it('rejects emails starting with numbers', () => {
    const result = emailSchema.safeParse('123456@gmail.com');
    expect(result.success).toBe(false);
  });

  it('rejects invalid email formats', () => {
    const result = emailSchema.safeParse('invalid-email-string');
    expect(result.success).toBe(false);
  });
});
