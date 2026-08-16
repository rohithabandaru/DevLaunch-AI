import { describe, it, expect } from 'vitest';
import { readStorage, writeStorage, removeStorage } from './storage';
import { z } from 'zod';

describe('Storage Utility Layer with Zod Boundaries', () => {
  it('reads fallback value when window/localStorage is empty or missing key', () => {
    const val = readStorage('non_existent_key', 'fallback_val');
    expect(val).toBe('fallback_val');
  });

  it('validates schema correctly using safeParse boundary', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    // Valid case
    window.localStorage.setItem('devlaunch-ai:user', JSON.stringify({ name: 'Alex', age: 28 }));
    const validData = readStorage('user', { name: 'Default', age: 0 }, schema);
    expect(validData).toEqual({ name: 'Alex', age: 28 });

    // Invalid schema case - triggers fallback
    window.localStorage.setItem('devlaunch-ai:user', JSON.stringify({ name: 'Alex', age: 'invalid-string' }));
    const fallbackData = readStorage('user', { name: 'Default', age: 0 }, schema);
    expect(fallbackData).toEqual({ name: 'Default', age: 0 });
  });

  it('handles write and remove operations without throwing exceptions', () => {
    expect(() => writeStorage('testKey', { data: 'test' })).not.toThrow();
    expect(() => removeStorage('testKey')).not.toThrow();
  });
});
