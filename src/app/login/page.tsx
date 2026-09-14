'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Tautan masuk (Magic Link) telah dikirim ke email Anda! Silakan periksa kotak masuk atau spam.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengirim Magic Link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF3ED] text-[#19241C] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#DFE6DC] rounded-3xl p-8 shadow-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EBF4EE] text-[#1E3B2B] border border-[#CBE0D1] mb-2 text-xl">
            🧠
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#19241C]">Second Brain</h1>
          <p className="text-sm text-[#5B6B60]">
            Masuk dengan satu ketukan menggunakan Magic Link
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-start gap-3 border ${
              message.type === 'success'
                ? 'bg-[#EBF4EE] border-[#CBE0D1] text-[#1E3B2B]'
                : 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]'
            }`}
          >
            <span className="text-base leading-none mt-0.5">
              {message.type === 'success' ? '✉️' : '⚠️'}
            </span>
            <p className="flex-1 font-semibold">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B60] mb-2">
              Alamat Email Pemilik
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#162B20] focus:ring-1 focus:ring-[#162B20] transition-colors text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Mengirim...</span>
              </>
            ) : (
              'Kirim Magic Link ➔'
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#DFE6DC] text-center text-xs text-[#5B6B60] font-medium">
          Sistem Single-User Personal Knowledge Management
        </div>
      </div>
    </div>
  );
}
