'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { getMeetings, deleteMeeting, type MeetingListItem } from '@/lib/meetings/actions';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'this_week'>('all');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMeetings(filter);
      setMeetings(data);
    } catch (err) {
      console.error('Gagal memuat daftar meeting:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus catatan meeting "${title}"?`)) return;

    setMeetings((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMeeting(id);
    } catch (err) {
      alert(`Gagal menghapus meeting: ${err instanceof Error ? err.message : 'Error'}`);
      await loadData();
    }
  };

  const filteredMeetings = useMemo(() => {
    if (!search.trim()) return meetings;
    const q = search.toLowerCase();
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.agenda?.toLowerCase().includes(q) ||
        m.conclusion?.toLowerCase().includes(q) ||
        m.attendees.some((a) => a.name.toLowerCase().includes(q)) ||
        m.project_name?.toLowerCase().includes(q) ||
        m.area_name?.toLowerCase().includes(q)
    );
  }, [meetings, search]);

  return (
    <AppShell maxContentWidth="max-w-5xl">
      <div className="space-y-6">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE6DC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗓️</span>
              <h1 className="text-xl font-bold tracking-tight text-[#19241C]">Meeting Notes</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#162B20] text-white">
                {meetings.length}
              </span>
            </div>
            <p className="text-xs text-[#5B6B60] mt-1">
              Catatan diskusi, agenda otomatis dari pertanyaan peserta, dan output item pekerjaan langsung tanpa lewat Inbox.
            </p>
          </div>

          <Link
            href="/meetings/new"
            className="px-4 py-2.5 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>+</span>
            <span>Catat Meeting Baru</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border border-[#DFE6DC] rounded-3xl space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#EFF3ED] rounded-xl border border-[#DFE6DC]">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-white text-[#19241C] shadow-xs'
                    : 'text-[#5B6B60] hover:text-[#19241C]'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'today'
                    ? 'bg-white text-[#19241C] shadow-xs'
                    : 'text-[#5B6B60] hover:text-[#19241C]'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setFilter('this_week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'this_week'
                    ? 'bg-white text-[#19241C] shadow-xs'
                    : 'text-[#5B6B60] hover:text-[#19241C]'
                }`}
              >
                Minggu Ini
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <span className="absolute left-3 top-2.5 text-xs text-[#8A978E]">🔍</span>
              <input
                type="text"
                placeholder="Cari judul, peserta, kesimpulan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] placeholder-[#9CA3AF] text-xs focus:outline-none focus:border-[#162B20]"
              />
            </div>
          </div>
        </div>

        {/* Meeting Cards List */}
        {loading ? (
          <div className="text-center py-16 bg-white border border-[#DFE6DC] rounded-3xl text-[#5B6B60] text-xs shadow-sm">
            Memuat catatan meeting...
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#DFE6DC] rounded-3xl space-y-3 shadow-sm p-6">
            <span className="text-3xl">📝</span>
            <div className="font-bold text-sm text-[#19241C]">Belum ada catatan meeting</div>
            <p className="text-xs text-[#5B6B60] max-w-sm mx-auto">
              Mulai catat meeting pertama Anda untuk menghubungkan pertanyaan peserta dan langsung menelurkan aksi nyata.
            </p>
            <Link
              href="/meetings/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162B20] text-white font-bold text-xs hover:bg-[#1E3B2B] transition-colors"
            >
              <span>+</span>
              <span>Buat Catatan Meeting</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMeetings.map((m) => {
              const meetingDateObj = new Date(m.meeting_date);
              const isToday = new Date().toISOString().split('T')[0] === m.meeting_date;

              return (
                <div
                  key={m.id}
                  className="p-5 bg-white border border-[#DFE6DC] rounded-3xl hover:border-[#CBD5C8] transition-all shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold font-mono ${
                            isToday
                              ? 'bg-[#162B20] text-white'
                              : 'bg-[#EFF3ED] text-[#5B6B60] border border-[#DFE6DC]'
                          }`}
                        >
                          📅 {meetingDateObj.toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>

                        {m.project_name ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#EFF3ED] text-[#162B20] border border-[#DFE6DC] font-semibold">
                            🎯 {m.project_name}
                          </span>
                        ) : m.area_name ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#EFF3ED] text-[#162B20] border border-[#DFE6DC] font-semibold">
                            📁 {m.area_name}
                          </span>
                        ) : null}

                        {/* Attendees Count */}
                        {m.attendees.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-[#F6F8F5] text-[#58655B] border border-[#DFE6DC] flex items-center gap-1 font-mono">
                            <span>👥</span>
                            <span>{m.attendees.length} Peserta</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <Link
                        href={`/meetings/${m.id}`}
                        className="text-base font-bold text-[#19241C] hover:text-[#2A5C43] transition-colors block"
                      >
                        {m.title}
                      </Link>

                      {/* Attendees Chips */}
                      {m.attendees.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {m.attendees.map((att) => (
                            <span
                              key={att.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#EFF3ED] text-[#19241C] text-[10px] font-medium border border-[#DFE6DC]"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2A5C43]" />
                              <span>{att.name}</span>
                              {att.role && <span className="text-[#8A978E]">({att.role})</span>}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Conclusion Preview */}
                      {m.conclusion && (
                        <p className="text-xs text-[#5B6B60] line-clamp-2 italic pt-1">
                          &ldquo;{m.conclusion}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Right Side: Output items badge & action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFF3ED]">
                      {/* Derived items badge */}
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {m.itemCounts.total > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#EBF4EE] text-[#1E3B2B] font-bold border border-[#CBE0D1]">
                              ⚡ {m.itemCounts.total} Output
                            </span>
                            {m.itemCounts.action > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#EFF3ED] text-[#19241C] font-mono text-[9px]">
                                {m.itemCounts.action}A
                              </span>
                            )}
                            {m.itemCounts.waiting > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-mono text-[9px]">
                                {m.itemCounts.waiting}W
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#8A978E]">Belum ada output</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/meetings/${m.id}`}
                          className="px-3 py-1.5 rounded-xl bg-[#EFF3ED] hover:bg-[#E2E8E3] text-[#19241C] font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <span>Buka Detail</span>
                          <span>→</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(m.id, m.title)}
                          className="p-1.5 rounded-lg text-[#8A978E] hover:text-red-600 hover:bg-red-50 transition-colors text-xs"
                          title="Hapus meeting"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
