import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Second Brain</h1>
              <p className="text-xs text-neutral-400">Personal Knowledge & GTD System</p>
            </div>
          </div>

          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700/60"
            >
              Keluar (Logout)
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-5 text-neutral-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Sesi Terautentikasi
              </p>
            </div>
            <p className="text-sm font-medium">
              Selamat datang kembali, <span className="text-emerald-300 font-mono">{user?.email ?? "Owner"}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/test-connection"
              className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all space-y-1 block"
            >
              <div className="font-semibold text-xs text-neutral-200">⚡ Status Koneksi Database</div>
              <div className="text-[11px] text-neutral-400">Periksa latensi dan endpoint Supabase aktif</div>
            </Link>

            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-neutral-400 space-y-1">
              <div className="font-semibold text-xs text-neutral-300">📱 Status PWA</div>
              <div className="text-[11px] text-neutral-500">Siap dipasang di Home Screen HP</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
          <span>Versi 1.0 · Single-User</span>
          <span>Next.js App Router + Supabase</span>
        </div>
      </main>
    </div>
  );
}
