'use client';

import { useEffect, useState } from 'react';

type BumbleStatus = {
  configured: boolean;
  mode: string;
  appStoreUrl: string;
  message: string;
};

export default function BumbleIntegrationPage() {
  const [status, setStatus] = useState<BumbleStatus | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  async function loadStatus() {
    const response = await fetch('/api/integrations/bumble/status');
    const result = await response.json();

    if (result.ok) {
      setStatus(result.integration);
    }
  }

  async function testOfficialApi() {
    setTestResult('Testujem oficiálne API...');

    const response = await fetch('/api/integrations/bumble/test-official-api');
    const result = await response.json();

    setTestResult(result.message);
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-black">
          Bumble official connector
        </h1>

        <p className="mb-8 text-zinc-300">
          Tento modul slúži iba na legálne použitie cez oficiálne schválené API
          alebo partnerský prístup.
        </p>

        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
          {!status ? (
            <p className="text-zinc-400">Načítavam stav integrácie...</p>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-zinc-400">Stav</p>
                <p className="text-xl font-black">
                  {status.mode}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-zinc-400">Správa</p>
                <p>{status.message}</p>
              </div>

              <div className="mb-6">
                <a
                  href={status.appStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-400 underline"
                >
                  Otvoriť Bumble v App Store
                </a>
              </div>

              <button
                onClick={testOfficialApi}
                className="rounded-xl bg-white px-5 py-3 font-black text-black hover:bg-zinc-200"
              >
                Otestovať oficiálne API
              </button>

              {testResult && (
                <p className="mt-4 rounded-xl bg-black p-4 text-zinc-200">
                  {testResult}
                </p>
              )}
            </>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-950/30 p-6">
          <h2 className="mb-3 text-xl font-black text-red-200">
            Bezpečnostné obmedzenie
          </h2>

          <p className="text-red-100">
            Modul nevytvára Bumble účty, neprihlasuje sa do aplikácie,
            nescrapuje profily, nepoužíva reverse engineering a neobchádza
            ochrany služby.
          </p>
        </div>
      </div>
    </main>
  );
}