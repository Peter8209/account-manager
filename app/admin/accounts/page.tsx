'use client';

import { useEffect, useState } from 'react';

type ManagedAccount = {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  status: string;
  created_at: string;
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAccounts() {
    setLoading(true);

    const response = await fetch('/api/admin/accounts');
    const result = await response.json();

    if (result.ok) {
      setAccounts(result.accounts);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-black">
          Správa účtov
        </h1>

        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
          {loading ? (
            <p className="text-zinc-400">Načítavam účty...</p>
          ) : accounts.length === 0 ? (
            <p className="text-zinc-400">Zatiaľ nie sú vytvorené žiadne účty.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-300">
                    <th className="p-3">Email</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Meno</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Vytvorené</th>
                  </tr>
                </thead>

                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b border-white/5">
                      <td className="p-3">{account.email}</td>
                      <td className="p-3">{account.username}</td>
                      <td className="p-3">{account.display_name ?? '-'}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                          {account.status}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-400">
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
    </main>
  );
}