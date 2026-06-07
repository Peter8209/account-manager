import { z } from 'zod';

export const createAccountSchema = z.object({
  email: z.string().email('Zadajte platný e-mail.'),
  username: z.string().min(3).max(60).optional(),
  display_name: z.string().max(120).optional(),
  bio: z.string().max(600).optional(),
  language: z.string().max(10).optional(),
  status: z
    .enum(['pending', 'active', 'paused', 'blocked', 'archived'])
    .optional(),
  source: z.string().max(40).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export function cleanText(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function makeUsername(email: string) {
  const base = email
    .split('@')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();

  return `${base || 'user'}_${Math.floor(1000 + Math.random() * 9000)}`;
}

export function jsonError(message: string, status = 400) {
  return Response.json(
    {
      ok: false,
      error: message,
    },
    { status },
  );
}

export function requireAdminApiKey(req: Request) {
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    return {
      ok: false,
      error: 'Chýba ADMIN_API_KEY v .env.local.',
    };
  }

  const provided =
    req.headers.get('x-admin-api-key') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (provided !== expected) {
    return {
      ok: false,
      error: 'Neplatný admin API kľúč.',
    };
  }

  return {
    ok: true,
  };
}