import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestConnectionPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const isPlaceholder =
    supabaseUrl.includes("your-project-id") ||
    supabaseAnonKey.includes("your-anon-key");

  let isConnected = false;
  let errorMessage: string | null = null;
  let responseTimeMs = 0;
  let authStatus = "Unknown";

  if (!supabaseUrl || !supabaseAnonKey) {
    errorMessage = "Variabel NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local.";
  } else if (isPlaceholder) {
    errorMessage = "Nilai di .env.local masih berupa placeholder bawaan. Silakan masukkan URL & Anon Key Supabase asli Anda.";
  } else {
    const startTime = Date.now();
    try {
      const supabase = await createClient();
      const { error: authError } = await supabase.auth.getSession();
      responseTimeMs = Date.now() - startTime;

      if (authError) {
        errorMessage = `Koneksi Auth error: ${authError.message}`;
      } else {
        isConnected = true;
        authStatus = "Auth Service OK (HTTP 200)";
      }
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui saat menghubungi Supabase.";
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Uji Koneksi Supabase</h1>
            <p className="text-xs text-neutral-400 mt-0.5">Second Brain PKM System</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-3 w-3 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              {isConnected ? "Connected" : "Not Connected"}
            </span>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 text-emerald-300 flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Koneksi Berhasil!</p>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  Aplikasi Next.js berhasil terhubung dan berkomunikasi dengan proyek Supabase Anda.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Project Endpoint:</span>
                <span className="text-neutral-200">{supabaseUrl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">Auth Status:</span>
                <span className="text-emerald-400">{authStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Response Latency:</span>
                <span className="text-neutral-200">{responseTimeMs} ms</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-rose-300 flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Koneksi Belum Berhasil</p>
                <p className="text-xs text-rose-400/90 mt-1 whitespace-pre-wrap">{errorMessage}</p>
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 space-y-2 text-xs text-neutral-300">
              <p className="font-semibold text-neutral-200">Langkah Perbaikan:</p>
              <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                <li>Buka file <code className="text-amber-300">.env.local</code> di root proyek.</li>
                <li>Ganti <code className="text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code> dengan URL proyek Supabase Anda.</li>
                <li>Ganti <code className="text-amber-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dengan Anon Key Supabase Anda.</li>
                <li>Muat ulang (refresh) halaman ini.</li>
              </ol>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-between items-center text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-200 underline transition-colors">
            ← Kembali ke Beranda
          </Link>
          <span>Next.js App Router & Supabase SSR</span>
        </div>
      </div>
    </div>
  );
}
