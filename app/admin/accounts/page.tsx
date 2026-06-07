'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type ManagedAccount = {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  status: string;
  created_at: string;
};

const allowedStatuses = [
  'draft',
  'pending_verification',
  'active',
  'failed',
  'blocked',
];

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return {
      email: row.email,
      username: row.username,
      display_name: row.display_name,
      status: allowedStatuses.includes(row.status) ? row.status : 'draft',
    };
  });
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  const stats = useMemo(() => {
    return {
      total: accounts.length,
      active: accounts.filter((a) => a.status === 'active').length,
      draft: accounts.filter((a) => a.status === 'draft').length,
      blocked: accounts.filter((a) => a.status === 'blocked').length,
    };
  }, [accounts]);

  async function loadAccounts() {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/accounts', {
        cache: 'no-store',
      });

      const result = await response.json();

      if (result.ok) {
        setAccounts(result.accounts ?? []);
      } else {
        setMessage(result.error ?? 'Nepodarilo sa načítať účty.');
      }
    } catch {
      setMessage('API /api/admin/accounts nie je dostupné.');
    }

    setLoading(false);
  }

  async function importCsvFile(file: File) {
    setImporting(true);
    setMessage('');

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      setMessage('CSV súbor je prázdny alebo nemá správny formát.');
      setImporting(false);
      return;
    }

    let created = 0;
    let failed = 0;

    for (const row of rows) {
      if (!row.email || !row.username) {
        failed += 1;
        continue;
      }

      try {
        const response = await fetch('/api/admin/accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(row),
        });

        const result = await response.json();

        if (result.ok) {
          created += 1;
        } else {
          failed += 1;
        }
      } catch {
        failed += 1;
      }
    }

    setMessage(`Import dokončený. Vytvorené: ${created}. Neúspešné: ${failed}.`);
    await loadAccounts();
    setImporting(false);
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              Account Manager
            </p>
            <h1 className="text-3xl font-black text-white">
              Správa účtov
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAccounts}
              className="rounded-xl border border-white/15 px-4 py-3 text-sm font-black text-white hover:bg-white/10"
            >
              Obnoviť údaje
            </button>

            <Link
              href="/"
              className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black hover:bg-zinc-200"
            >
              Späť na menu
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black text-white">
            Admin panel účtov
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Tu môžeš spravovať interné alebo spravované účty, importovať CSV súbory
            a sledovať stav účtov. Bumble integrácia zostáva bezpečne oddelená ako
            oficiálny konektor.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Spolu účtov</p>
            <p className="mt-2 text-4xl font-black text-white">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Aktívne</p>
            <p className="mt-2 text-4xl font-black text-emerald-300">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Draft</p>
            <p className="mt-2 text-4xl font-black text-amber-300">
              {stats.draft}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Blocked</p>
            <p className="mt-2 text-4xl font-black text-red-300">
              {stats.blocked}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-xl font-black text-white">
              Import CSV
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Nahraj CSV súbor vo formáte:
            </p>

            <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black p-4 text-xs text-zinc-300">
{`email,username,display_name,status
jan@example.com,jan.novak,Ján Novák,active
maria@example.com,maria,Mária Horáková,draft`}
            </pre>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-black text-zinc-300">
                Vybrať CSV súbor
              </span>

              <input
                type="file"
                accept=".csv,text/csv"
                disabled={importing}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    importCsvFile(file);
                  }
                }}
                className="block w-full rounded-2xl border border-white/10 bg-black p-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-black file:text-black"
              />
            </label>

            {importing && (
              <p className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-sm font-black text-cyan-200">
                Importujem CSV...
              </p>
            )}

            {message && (
              <p className="mt-4 rounded-xl border border-white/10 bg-white/10 p-3 text-sm font-bold text-white">
                {message}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  Zoznam účtov
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Dáta sú načítané z API endpointu /api/admin/accounts.
                </p>
              </div>

              <button
                onClick={loadAccounts}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200"
              >
                Obnoviť
              </button>
            </div>

            {loading ? (
              <p className="rounded-2xl border border-white/10 bg-black p-5 text-zinc-400">
                Načítavam účty...
              </p>
            ) : accounts.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black p-5 text-zinc-400">
                Zatiaľ nie sú vytvorené žiadne účty. Nahraj CSV súbor alebo vytvor účet cez API.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-black text-zinc-300">
                    <tr>
                      <th className="p-4">Email</th>
                      <th className="p-4">Username</th>
                      <th className="p-4">Meno</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Vytvorené</th>
                    </tr>
                  </thead>

                  <tbody>
                    {accounts.map((account) => (
                      <tr
                        key={account.id}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="p-4 font-bold text-white">
                          {account.email}
                        </td>
                        <td className="p-4 text-zinc-300">
                          {account.username}
                        </td>
                        <td className="p-4 text-zinc-300">
                          {account.display_name ?? '-'}
                        </td>
                        <td className="p-4">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                            {account.status}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400">
                          {new Date(account.created_at).toLocaleString('sk-SK')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}