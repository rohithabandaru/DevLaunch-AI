import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { decryptToken, encryptToken, isEncryptedToken, TokenEncryptionError } from './email-token-crypto';

const ORIGINAL_ENV = process.env.EMAIL_ENCRYPTION_KEY;

function useKey(key: string) {
  process.env.EMAIL_ENCRYPTION_KEY = key;
}

beforeEach(() => {
  useKey(randomBytes(32).toString('base64'));
});

afterEach(() => {
  if (ORIGINAL_ENV === undefined) {
    delete process.env.EMAIL_ENCRYPTION_KEY;
  } else {
    process.env.EMAIL_ENCRYPTION_KEY = ORIGINAL_ENV;
  }
});

describe('encryptToken / decryptToken', () => {
  it('round-trips a token', () => {
    const secret = 'ya29.a0AfH6SMB-secret-access-token';
    const envelope = encryptToken(secret);
    expect(decryptToken(envelope)).toBe(secret);
  });

  it('never stores the plaintext', () => {
    const secret = 'ya29.a0AfH6SMB-secret-access-token';
    const envelope = encryptToken(secret);
    expect(envelope).not.toContain(secret);
    expect(isEncryptedToken(envelope)).toBe(true);
  });

  it('produces a different ciphertext each time (random IV)', () => {
    const secret = 'ya29.refresh-token';
    const a = encryptToken(secret);
    const b = encryptToken(secret);
    expect(a).not.toBe(b);
    expect(decryptToken(a)).toBe(secret);
    expect(decryptToken(b)).toBe(secret);
  });

  it('returns null when the key was rotated', () => {
    const envelope = encryptToken('ya29.secret');
    useKey(randomBytes(32).toString('base64'));
    expect(decryptToken(envelope)).toBeNull();
  });

  it('returns null for tampered ciphertext (authenticated encryption)', () => {
    const envelope = encryptToken('ya29.secret');
    const [version, iv, tag, data] = envelope.split('.');
    const bytes = Buffer.from(data, 'base64url');
    bytes[0] ^= 0xff;
    const tampered = [version, iv, tag, bytes.toString('base64url')].join('.');

    expect(decryptToken(tampered)).toBeNull();
  });

  it('returns null for tampered auth tags', () => {
    const envelope = encryptToken('ya29.secret');
    const [version, iv, tag, data] = envelope.split('.');
    const tagBytes = Buffer.from(tag, 'base64url');
    tagBytes[0] ^= 0xff;

    expect(decryptToken([version, iv, tagBytes.toString('base64url'), data].join('.'))).toBeNull();
  });

  it('returns null for malformed envelopes', () => {
    expect(decryptToken('')).toBeNull();
    expect(decryptToken(null)).toBeNull();
    expect(decryptToken(undefined)).toBeNull();
    expect(decryptToken('not-an-envelope')).toBeNull();
    expect(decryptToken('v1.only.two')).toBeNull();
    expect(decryptToken('v2.a.b.c')).toBeNull();
  });

  it('rejects empty plaintext', () => {
    expect(() => encryptToken('')).toThrow(TokenEncryptionError);
  });

  it('throws a clear error when the key is not configured', () => {
    delete process.env.EMAIL_ENCRYPTION_KEY;
    expect(() => encryptToken('ya29.secret')).toThrow(/EMAIL_ENCRYPTION_KEY/);
    expect(decryptToken('v1.a.b.c')).toBeNull();
  });

  it('accepts a 32-byte hex key', () => {
    useKey(randomBytes(32).toString('hex'));
    const envelope = encryptToken('ya29.secret');
    expect(decryptToken(envelope)).toBe('ya29.secret');
  });

  it('stretches a human-chosen passphrase via scrypt', () => {
    useKey('a memorable dev-only passphrase');
    const envelope = encryptToken('ya29.secret');
    expect(decryptToken(envelope)).toBe('ya29.secret');
    expect(envelope).not.toContain('ya29.secret');
  });

  it('treats different passphrases as different keys', () => {
    useKey('passphrase-one');
    const envelope = encryptToken('ya29.secret');
    useKey('passphrase-two');
    expect(decryptToken(envelope)).toBeNull();
  });
});

describe('isEncryptedToken', () => {
  it('recognises envelopes', () => {
    expect(isEncryptedToken(encryptToken('value'))).toBe(true);
  });

  it('rejects non-envelopes', () => {
    expect(isEncryptedToken('plain-token')).toBe(false);
    expect(isEncryptedToken('v1.a.b')).toBe(false);
    expect(isEncryptedToken(null)).toBe(false);
    expect(isEncryptedToken(42)).toBe(false);
  });
});
