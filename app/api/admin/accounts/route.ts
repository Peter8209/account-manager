import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';

const ALLOWED_STATUSES = [
  'draft',
  'pending_verification',
  'active',
  'failed',
  'blocked',
];

function normalizeStatus(status: unknown) {
  if (typeof status !== 'string') {
    return 'draft';
  }

  return ALLOWED_STATUSES.includes(status) ? status : 'draft';
}

function normalizeText(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('managed_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      accounts: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Nepodarilo sa načítať účty.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    const email = normalizeText(body.email);
    const username = normalizeText(body.username);
    const displayName = normalizeText(body.display_name);
    const status = normalizeStatus(body.status);

    if (!email || !username) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Email a username sú povinné.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('managed_accounts')
      .insert({
        email,
        username,
        display_name: displayName || null,
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const { error: auditError } = await supabase.from('audit_logs').insert({
      action: 'managed_account_created',
      entity_type: 'managed_account',
      entity_id: data.id,
      metadata: {
        email,
        username,
        display_name: displayName || null,
        status,
      },
    });

    return NextResponse.json({
      ok: true,
      account: data,
      audit_logged: !auditError,
      audit_error: auditError?.message ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Nepodarilo sa vytvoriť účet.',
      },
      { status: 500 }
    );
  }
}