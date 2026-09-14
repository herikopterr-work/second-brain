import Link from "next/link";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8">
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

            {/* Tombol Aksi Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/capture"
                className="flex items-center justify-between p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-xl shadow-emerald-950 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                  <div>
                    <div className="text-base font-bold">Quick Capture</div>
                    <div className="text-xs text-emerald-100 font-normal">Tulis ide instan offline/online</div>
                  </div>
                </div>
                <span className="text-lg group-hover:translate-x-1 transition-transform">➔</span>
              </Link>

              <Link
                href="/inbox"
                className="flex items-center justify-between p-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-all border border-neutral-700/60 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📥</span>
                  <div>
                    <div className="text-base font-bold">Inbox & Clarify</div>
                    <div className="text-xs text-neutral-400 font-normal">Fokus 1 kartu per giliran</div>
                  </div>
                </div>
                <span className="text-lg group-hover:translate-x-1 transition-transform">➔</span>
              </Link>
            </div>

            {/* Master Data Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link
                href="/areas"
                className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all space-y-1 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-neutral-200">📁 Areas</span>
                  <span className="text-neutral-500 group-hover:translate-x-0.5 transition-transform text-xs">➔</span>
                </div>
                <div className="text-[11px] text-neutral-400">Lingkup tanggung jawab utama</div>
              </Link>

              <Link
                href="/projects"
                className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all space-y-1 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-neutral-200">🎯 Projects</span>
                  <span className="text-neutral-500 group-hover:translate-x-0.5 transition-transform text-xs">➔</span>
                </div>
                <div className="text-[11px] text-neutral-400">Dikelompokkan di bawah Area</div>
              </Link>

              <Link
                href="/people"
                className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all space-y-1 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-neutral-200">👤 People</span>
                  <span className="text-neutral-500 group-hover:translate-x-0.5 transition-transform text-xs">➔</span>
                </div>
                <div className="text-[11px] text-neutral-400">Questions & Waitings per orang</div>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
            <span>Versi 1.0 · Single-User</span>
            <span>Next.js App Router + Supabase</span>
          </div>
        </div>
      </main>
    </div>
  );
}
