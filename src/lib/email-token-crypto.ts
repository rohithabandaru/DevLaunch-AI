import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

/**
 * Authenticated encryption for mailbox OAuth tokens at rest.
 *
 * Format: `v1.<iv>.<authTag>.<ciphertext>` (each field base64url).
 * Algorithm: AES-256-GCM — confidentiality *and* integrity, so a tampered
 * ciphertext fails to decrypt instead of yielding a garbage bearer token.
 *
 * The key comes from `EMAIL_ENCRYPTION_KEY`. A 32-byte value can be supplied
 * either as 64 hex chars or as base64; anything else is stretched with scrypt
 * so that a human-chosen passphrase is still usable in development. Prefer a
 * random 32-byte value in production:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;
const VERSION = 'v1';
const KDF_SALT = 'devlaunch-ai:email-token:v1';

export class TokenEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenEncryptionError';
  }
}

function resolveKey(): Buffer {
  const raw = process.env.EMAIL_ENCRYPTION_KEY;
  if (!raw || !raw.trim()) {
    throw new TokenEncryptionError('EMAIL_ENCRYPTION_KEY is not configured.');
  }
  const trimmed = raw.trim();

  if (/^[0-9a-f]{64}$/i.test(trimmed)) return Buffer.from(trimmed, 'hex');

  // Buffer.from(..., 'base64') is lenient, so only accept the decode if it
  // really is 32 bytes; otherwise fall through to scrypt.
  const asBase64 = Buffer.from(trimmed, 'base64');
  if (asBase64.length === KEY_BYTES) return asBase64;

  return scryptSync(trimmed, KDF_SALT, KEY_BYTES);
}

/** Encrypts a token into a storable, self-describing envelope string. */
export function encryptToken(plaintext: string): string {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new TokenEncryptionError('Refusing to encrypt an empty token.');
  }
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, resolveKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

/**
 * Decrypts an envelope produced by {@link encryptToken}.
 * Returns null when the payload is missing, malformed, or fails authentication
 * (e.g. the key was rotated) so callers can treat the connection as
 * disconnected instead of crashing the request.
 */
export function decryptToken(envelope: string | null | undefined): string | null {
  if (!envelope || typeof envelope !== 'string') return null;

  const parts = envelope.split('.');
  if (parts.length !== 4) return null;

  const [version, ivPart, tagPart, dataPart] = parts;
  if (version !== VERSION) return null;

  try {
    const iv = Buffer.from(ivPart, 'base64url');
    const authTag = Buffer.from(tagPart, 'base64url');
    const ciphertext = Buffer.from(dataPart, 'base64url');
    if (iv.length !== IV_BYTES || authTag.length !== 16 || ciphertext.length === 0) return null;

    const decipher = createDecipheriv(ALGORITHM, resolveKey(), iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  } catch {
    return null;
  }
}

/** True when a value looks like an envelope this module produced. */
export function isEncryptedToken(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(`${VERSION}.`) && value.split('.').length === 4;
}
