import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email().superRefine((val, ctx) => {
  const parts = val.split('@');
  if (parts.length !== 2) return;
  const [localPart, domain] = parts;

  if (!/^[a-zA-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter a valid email address (must start with a letter).',
    });
  }

  if (/^\d+$/.test(localPart)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email username cannot be only numbers. Please use a real email address.',
    });
  }

  if (localPart.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email username is too short.',
    });
  }

  const disposableDomains = [
    'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', 
    'yopmail.com', 'fakeinbox.com', 'sharklasers.com', 'guerrillamailblock.com', 
    'grr.la', 'dispostable.com'
  ];

  if (disposableDomains.includes(domain)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Disposable/temporary emails are not allowed.',
    });
  }
});
