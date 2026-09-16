import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";

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
    <AppShell maxContentWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE6DC]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#19241C]">Settings & Database Connection</h1>
            <p className="text-xs text-[#5B6B60] mt-0.5">
              Status konektivitas infrastruktur backend Supabase dan environment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#19241C]">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {isConnected ? (
            <div className="space-y-4">
              <div className="bg-[#EBF4EE] border border-[#CBE0D1] rounded-2xl p-4 text-[#1E3B2B] flex items-start gap-3">
                <span className="text-base">✓</span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">Koneksi Supabase Berhasil!</p>
                  <p className="text-xs text-[#58655B] mt-0.5">
                    Aplikasi Next.js berhasil terhubung dan berkomunikasi dengan proyek Supabase Anda.
                  </p>
                </div>
              </div>

              <div className="bg-[#F6F8F5] border border-[#DFE6DC] rounded-2xl p-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#DFE6DC]">
                  <span className="text-[#8A978E]">Project Endpoint:</span>
                  <span className="text-[#19241C] font-semibold">{supabaseUrl}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#DFE6DC]">
                  <span className="text-[#8A978E]">Auth Status:</span>
                  <span className="text-emerald-700 font-bold">{authStatus}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A978E]">Response Latency:</span>
                  <span className="text-[#19241C]">{responseTimeMs} ms</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-2xl p-4 text-[#991B1B] flex items-start gap-3">
                <span className="text-base">⚠️</span>
                <div>
                  <p className="font-bold text-xs sm:text-sm">Koneksi Belum Berhasil</p>
                  <p className="text-xs text-[#991B1B]/90 mt-1 whitespace-pre-wrap">{errorMessage}</p>
                </div>
              </div>

              <div className="bg-[#F6F8F5] border border-[#DFE6DC] rounded-2xl p-4 space-y-2 text-xs text-[#5B6B60]">
                <p className="font-bold text-[#19241C]">Langkah Perbaikan:</p>
                <ol className="list-decimal list-inside space-y-1 text-[#5B6B60]">
                  <li>Buka file <code className="text-[#162B20] font-bold">.env.local</code> di root proyek.</li>
                  <li>Ganti <code className="text-[#162B20] font-bold">NEXT_PUBLIC_SUPABASE_URL</code> dengan URL proyek Supabase Anda.</li>
                  <li>Ganti <code className="text-[#162B20] font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dengan Anon Key Supabase Anda.</li>
                  <li>Muat ulang (refresh) halaman ini.</li>
                </ol>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-between items-center text-xs text-[#8A978E] border-t border-[#EFF3ED]">
            <Link href="/" className="hover:text-[#19241C] underline transition-colors">
              ← Kembali ke Dashboard
            </Link>
            <span>Next.js App Router & Supabase SSR</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
