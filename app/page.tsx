import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mb-6 inline-flex w-fit rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300">
          Supabase API Panel + Bumble official connector
        </div>

        <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
          Bezpečný MVP admin panel pre správu účtov
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
          Systém pre internú správu účtov, CSV import, audit logy, používateľské
          roly a pripravený integračný modul Bumble official connector.
        </p>

        <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-950/30 p-5 text-yellow-100">
          <p className="font-bold">Dôležité bezpečnostné obmedzenie</p>
          <p className="mt-2 text-sm leading-6">
            Bumble modul je navrhnutý iba ako legálny konektor pre oficiálne
            schválené API alebo partnerský prístup. Projekt neobsahuje reverse
            engineering, scraping, obchádzanie detekcie, automatické vytváranie
            Bumble účtov ani neoficiálne API volania.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/admin/accounts"
            className="rounded-xl bg-white px-6 py-4 text-center font-black text-black hover:bg-zinc-200"
          >
            Otvoriť správu účtov
          </Link>

          <Link
            href="/integrations/bumble"
            className="rounded-xl border border-white/20 px-6 py-4 text-center font-black text-white hover:bg-white/10"
          >
            Bumble official connector
          </Link>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-xl font-black">Správa účtov</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Evidencia interných alebo spravovaných účtov so stavmi draft,
              pending verification, active, failed a blocked.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-xl font-black">CSV import</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Pripravený formát pre import účtov cez CSV: email, username,
              display_name a status.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-xl font-black">Audit logy a roly</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Role super_admin, admin, manager, operator a viewer s dôrazom na
              auditovateľnosť a bezpečnosť.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}