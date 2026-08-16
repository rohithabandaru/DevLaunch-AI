import { describe, it, expect } from 'vitest';
import { escapeIcsText } from './ics';

describe('RFC 5545 ICS Escaping Utility', () => {
  it('escapes special characters correctly', () => {
    expect(escapeIcsText('Senior Engineer, Full-Time')).toBe('Senior Engineer\\, Full-Time');
    expect(escapeIcsText('React; Next.js')).toBe('React\\; Next.js');
    expect(escapeIcsText('Path\\To\\Folder')).toBe('Path\\\\To\\\\Folder');
    expect(escapeIcsText('Line 1\nLine 2')).toBe('Line 1\\nLine 2');
  });

  it('handles empty strings gracefully', () => {
    expect(escapeIcsText('')).toBe('');
  });
});
