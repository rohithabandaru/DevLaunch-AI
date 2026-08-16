import { z } from 'zod';

const STORAGE_PREFIX = 'devlaunch-ai:';

export function readStorage<T>(key: string, fallback: T, schema?: z.ZodSchema<T>): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    
    const parsed = JSON.parse(raw);
    if (schema) {
      const result = schema.safeParse(parsed);
      return result.success ? result.data : fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage for key: ${key}`, err);
  }
}

export function removeStorage(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_PREFIX + key);
}
