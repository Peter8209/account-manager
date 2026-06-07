import { NextRequest, NextResponse } from 'next/server';
import { generateSafeBio } from '@/lib/accounts/generateSafeBio';
import { requireAdminApiKey } from '@/lib/accounts/accountUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = requireAdminApiKey(req);

  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: auth.error,
      },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);

  const bio = generateSafeBio({
    language: body?.language || 'sk',
    field: body?.field || '',
    tone: body?.tone || 'neutral',
  });

  return NextResponse.json({
    ok: true,
    bio,
  });
}