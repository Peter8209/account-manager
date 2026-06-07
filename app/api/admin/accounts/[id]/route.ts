import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  requireAdminApiKey,
  updateAccountSchema,
} from '@/lib/accounts/accountUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('managed_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    item: data,
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  const body = await req.json().catch(() => null);

  const parsed = updateAccountSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || 'Neplatné údaje.',
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  const updatePayload: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  if (typeof updatePayload.email === 'string') {
    updatePayload.email = updatePayload.email.toLowerCase().trim();
  }

  const { data, error } = await supabase
    .from('managed_accounts')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 },
    );
  }

  await supabase.from('account_activity_logs').insert({
    account_id: id,
    action: 'account_updated',
    detail: updatePayload,
    created_by: 'admin-api',
  });

  return NextResponse.json({
    ok: true,
    item: data,
  });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  await supabase.from('account_activity_logs').insert({
    account_id: id,
    action: 'account_deleted',
    detail: {
      id,
    },
    created_by: 'admin-api',
  });

  const { error } = await supabase
    .from('managed_accounts')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    deletedId: id,
  });
}