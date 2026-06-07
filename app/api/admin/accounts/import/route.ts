import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateSafeBio } from '@/lib/accounts/generateSafeBio';
import { makeUsername, requireAdminApiKey } from '@/lib/accounts/accountUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ImportRow = {
  email?: string;
  username?: string;
  display_name?: string;
  displayName?: string;
  bio?: string;
  language?: string;
  notes?: string;
};

function normalizeRow(row: ImportRow) {
  const email = String(row.email || '').trim().toLowerCase();

  if (!email || !email.includes('@')) return null;

  const language = String(row.language || 'sk').trim() || 'sk';
  const username = String(row.username || '').trim() || makeUsername(email);
  const displayName =
    String(row.display_name || row.displayName || '').trim() || username;

  return {
    email,
    username,
    display_name: displayName,
    bio: String(row.bio || '').trim() || generateSafeBio({ language }),
    language,
    status: 'pending',
    source: 'import',
    notes: String(row.notes || '').trim() || null,
    created_by: 'admin-import',
    updated_at: new Date().toISOString(),
  };
}

async function parseFile(file: File): Promise<ImportRow[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
    });

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ImportRow>(firstSheet, {
      defval: '',
    });

    return rows;
  }

  const csv = buffer.toString('utf-8');

  const parsed = Papa.parse<ImportRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}

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

  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Chýba importovaný súbor.',
      },
      { status: 400 },
    );
  }

  const rows = await parseFile(file);
  const payload = rows.map(normalizeRow).filter(Boolean);

  if (!payload.length) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Súbor neobsahuje žiadne platné účty.',
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('managed_accounts')
    .upsert(payload, {
      onConflict: 'email',
      ignoreDuplicates: false,
    })
    .select('*');

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
    imported: data?.length || 0,
    items: data || [],
  });
}