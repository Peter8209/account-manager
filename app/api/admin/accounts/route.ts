import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('managed_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    accounts: data ?? [],
  });
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();

  const { email, username, display_name, status } = body;

  if (!email || !username) {
    return NextResponse.json(
      { ok: false, error: 'Email a username sú povinné.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('managed_accounts')
    .insert({
      email,
      username,
      display_name,
      status: status ?? 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  await supabase.from('audit_logs').insert({
    action: 'managed_account_created',
    entity_type: 'managed_account',
    entity_id: data.id,
    metadata: {
      email,
      username,
      status: status ?? 'draft',
    },
  });

  return NextResponse.json({
    ok: true,
    account: data,
  });
}