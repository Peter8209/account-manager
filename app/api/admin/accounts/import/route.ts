import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { createSupabaseAdminClient } from '../../../../../lib/supabase/admin';

export const runtime = 'nodejs';

const ALLOWED_STATUSES = [
  'draft',
  'pending_verification',
  'active',
  'failed',
  'blocked',
] as const;

type ManagedAccountStatus = (typeof ALLOWED_STATUSES)[number];

type ImportRow = {
  email?: string;
  username?: string;
  display_name?: string;
  displayName?: string;
  bio?: string;
  language?: string;
  status?: string;
  notes?: string;
};

type ManagedAccountPayload = {
  email: string;
  username: string;
  display_name: string;
  bio: string;
  language: string;
  status: ManagedAccountStatus;
  source: string;
  notes: string | null;
  created_by: string;
  updated_at: string;
};

function cleanText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeStatus(value: unknown): ManagedAccountStatus {
  const status = cleanText(value);

  if (ALLOWED_STATUSES.includes(status as ManagedAccountStatus)) {
    return status as ManagedAccountStatus;
  }

  return 'draft';
}

function normalizeLanguage(value: unknown): string {
  const language = cleanText(value).toLowerCase();

  if (language === 'cz') {
    return 'cs';
  }

  return language || 'sk';
}

function createSafeBio(
  displayName: string,
  username: string,
  language: string
): string {
  const name = displayName || username;

  if (language === 'en') {
    return `${name} is a managed internal account created through the Account Manager panel.`;
  }

  if (language === 'cs') {
    return `${name} je spravovaný interní účet vytvořený přes Account Manager panel.`;
  }

  return `${name} je spravovaný interný účet vytvorený cez Account Manager panel.`;
}

function isValidPayload(
  item: ManagedAccountPayload | null
): item is ManagedAccountPayload {
  return item !== null;
}

function rowToPayload(
  row: ImportRow,
  createdBy: string
): ManagedAccountPayload | null {
  const email = cleanText(row.email).toLowerCase();
  const username = cleanText(row.username);
  const displayName =
    cleanText(row.display_name) || cleanText(row.displayName);
  const language = normalizeLanguage(row.language);
  const status = normalizeStatus(row.status);
  const notes = cleanText(row.notes);
  const bioFromCsv = cleanText(row.bio);

  if (!email || !username) {
    return null;
  }

  const finalDisplayName = displayName || username;

  return {
    email,
    username,
    display_name: finalDisplayName,
    bio: bioFromCsv || createSafeBio(finalDisplayName, username, language),
    language,
    status,
    source: 'csv_import',
    notes: notes || null,
    created_by: createdBy,
    updated_at: new Date().toISOString(),
  };
}

async function parseCsvFile(file: File): Promise<ImportRow[]> {
  const text = await file.text();

  const result = Papa.parse<ImportRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(
      result.errors[0]?.message || 'CSV súbor sa nepodarilo spracovať.'
    );
  }

  return result.data;
}

async function parseExcelFile(file: File): Promise<ImportRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('Excel súbor neobsahuje žiadny hárok.');
  }

  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error('Nepodarilo sa načítať prvý hárok Excel súboru.');
  }

  return XLSX.utils.sheet_to_json<ImportRow>(worksheet, {
    defval: '',
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const formData = await request.formData();

    const file = formData.get('file');
    const createdBy = cleanText(formData.get('created_by')) || 'system';

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Chýba súbor na import.',
        },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();

    let rows: ImportRow[] = [];

    if (fileName.endsWith('.csv')) {
      rows = await parseCsvFile(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      rows = await parseExcelFile(file);
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: 'Podporované sú iba súbory CSV, XLS alebo XLSX.',
        },
        { status: 400 }
      );
    }

    const payload = rows
      .map((row) => rowToPayload(row, createdBy))
      .filter(isValidPayload);

    if (payload.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Import neobsahuje žiadne platné riadky. Povinné polia sú email a username.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('managed_accounts')
      .upsert(payload, {
        onConflict: 'email',
        ignoreDuplicates: false,
      })
      .select();

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
      action: 'managed_accounts_imported',
      entity_type: 'managed_account',
      entity_id: null,
      metadata: {
        file_name: file.name,
        imported_count: data?.length ?? payload.length,
        source: 'csv_excel_import',
        created_by: createdBy,
      },
    });

    return NextResponse.json({
      ok: true,
      imported: data?.length ?? payload.length,
      accounts: data ?? [],
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
            : 'Import účtov zlyhal.',
      },
      { status: 500 }
    );
  }
}