'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import {
  getOpenItemsData,
  markItemDone,
  deleteItem,
  type DetailedItem,
} from '@/lib/items/actions';

export default function OpenItemsPage() {
  const [items, setItems] = useState<DetailedItem[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; area_id: string }[]>([]);
  const [people, setPeople] = useState<{ id: string; name: string; role: string | null }[]>([]);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'action' | 'waiting' | 'resource'>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all'); // 'all', 'area:ID', 'proj:ID'
  const [personFilter, setPersonFilter] = useState<string>('all'); // 'all' or personId

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOpenItemsData();
      setItems(data.items);
      setAreas(data.areas);
      setProjects(data.projects);
      setPeople(data.people);
      setUncategorizedCount(data.uncategorizedCount);
    } catch (err) {
      console.error('Gagal memuat open items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Mark Done
  const handleDone = async (id: string) => {
    // Optimistic UI update
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await markItemDone(id);
    } catch (err) {
      alert(`Gagal menandai selesai: ${err instanceof Error ? err.message : 'Error'}`);
      await loadData();
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus item "${title}"?`)) return;

    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteItem(id);
    } catch (err) {
      alert(`Gagal menghapus: ${err instanceof Error ? err.message : 'Error'}`);
      await loadData();
    }
  };

  // Filter Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Text Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesBody = item.body?.toLowerCase().includes(query) || false;
        const matchesPerson = item.person_name?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesBody && !matchesPerson) return false;
      }

      // 2. Type Filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // 3. Area / Project Filter
      if (targetFilter !== 'all') {
        if (targetFilter.startsWith('area:') && item.area_id !== targetFilter.replace('area:', '')) {
          return false;
        }
        if (targetFilter.startsWith('proj:') && item.project_id !== targetFilter.replace('proj:', '')) {
          return false;
        }
      }

      // 4. Person Filter
      if (personFilter !== 'all' && item.person_id !== personFilter) {
        return false;
      }

      return true;
    });
  }, [items, search, typeFilter, targetFilter, personFilter]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    let action = 0;
    let waiting = 0;
    let resource = 0;
    items.forEach((i) => {
      if (i.type === 'action') action++;
      else if (i.type === 'waiting') waiting++;
      else if (i.type === 'resource') resource++;
    });
    return { total: items.length, action, waiting, resource };
  }, [items]);

  // Fungsi penghitung umur hari
  const getDaysDiff = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <AppShell maxContentWidth="max-w-5xl">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE6DC]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#19241C]">Open Items</h1>
            <p className="text-xs text-[#5B6B60] mt-0.5">
              Seluruh pekerjaan aktif yang siap dieksekusi atau sedang berjalan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/capture"
              className="px-3.5 py-2 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>⚡ Capture</span>
            </Link>
            <Link
              href="/inbox"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EFF3ED] text-[#19241C] font-semibold text-xs transition-colors border border-[#DFE6DC]"
            >
              <span>📥 Inbox</span>
            </Link>
          </div>
        </div>

        {/* Banner Peringatan: Area Uncategorized > 10 */}
        {uncategorizedCount > 10 && (
          <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs flex items-start gap-3 shadow-sm">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="space-y-1">
              <p className="font-bold text-sm">Peringatan: Area "Uncategorized" menumpuk ({uncategorizedCount} item)!</p>
              <p className="text-[#92400E]/90 leading-relaxed">
                Anda memiliki lebih dari 10 item yang belum dipetakan ke Area/Project spesifik. Segera pindahkan ke Project atau Area terkait agar tidak kehilangan konteks pekerjaan.
              </p>
            </div>
          </div>
        )}

        {/* Metrics Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setTypeFilter('all')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              typeFilter === 'all'
                ? 'bg-[#162B20] border-[#162B20] text-white shadow-sm ring-2 ring-[#162B20]/30'
                : 'bg-white border-[#DFE6DC] text-[#5B6B60] hover:border-[#CBD5E1]'
            }`}
          >
            <div className={`text-[10px] uppercase font-bold ${typeFilter === 'all' ? 'text-neutral-300' : 'text-[#5B6B60]'}`}>
              Total Aktif
            </div>
            <div className={`text-xl font-bold font-mono mt-0.5 ${typeFilter === 'all' ? 'text-white' : 'text-[#19241C]'}`}>
              {stats.total}
            </div>
          </button>

          <button
            onClick={() => setTypeFilter('action')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              typeFilter === 'action'
                ? 'bg-[#EBF4EE] border-emerald-600 text-[#1E3B2B] ring-2 ring-emerald-500/30 shadow-sm'
                : 'bg-white border-[#DFE6DC] text-[#5B6B60] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-emerald-700">ACTION</div>
            <div className="text-xl font-bold text-[#1E3B2B] font-mono mt-0.5">{stats.action}</div>
          </button>

          <button
            onClick={() => setTypeFilter('waiting')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              typeFilter === 'waiting'
                ? 'bg-[#FEF3C7] border-amber-600 text-[#92400E] ring-2 ring-amber-500/30 shadow-sm'
                : 'bg-white border-[#DFE6DC] text-[#5B6B60] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-amber-700">WAITING</div>
            <div className="text-xl font-bold text-[#92400E] font-mono mt-0.5">{stats.waiting}</div>
          </button>

          <button
            onClick={() => setTypeFilter('resource')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              typeFilter === 'resource'
                ? 'bg-[#E0F2FE] border-blue-600 text-[#0369A1] ring-2 ring-blue-500/30 shadow-sm'
                : 'bg-white border-[#DFE6DC] text-[#5B6B60] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-blue-700">RESOURCE</div>
            <div className="text-xl font-bold text-[#0369A1] font-mono mt-0.5">{stats.resource}</div>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-white border border-[#DFE6DC] rounded-3xl space-y-3 shadow-sm">
          {/* Search Text */}
          <input
            type="text"
            placeholder="Cari judul, catatan, atau nama orang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] placeholder-[#9CA3AF] text-xs focus:outline-none focus:border-[#162B20] focus:ring-1 focus:ring-[#162B20]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Filter Area / Project */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#5B6B60] mb-1">
                Filter Area / Project
              </label>
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
              >
                <option value="all">-- Semua Area & Project --</option>
                <optgroup label="── Area ──">
                  {areas.map((a) => (
                    <option key={`area:${a.id}`} value={`area:${a.id}`}>
                      📁 {a.name}
                    </option>
                  ))}
                </optgroup>
                {projects.length > 0 && (
                  <optgroup label="── Projects ──">
                    {projects.map((p) => (
                      <option key={`proj:${p.id}`} value={`proj:${p.id}`}>
                        🎯 {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Filter Person */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#5B6B60] mb-1">
                Filter Orang (Person)
              </label>
              <select
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
              >
                <option value="all">-- Semua Kontak --</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    👤 {p.name} {p.role ? `(${p.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Item List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#5B6B60]">Memuat daftar Open Items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#5B6B60] bg-white border border-[#DFE6DC] rounded-3xl p-8 space-y-3 shadow-sm">
            <p className="text-sm font-bold text-[#19241C]">Tidak ada item yang cocok dengan filter.</p>
            <p className="text-[#5B6B60]">
              Coba ubah kata kunci pencarian atau reset filter di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isWaiting = item.type === 'waiting';
              const isQuestion = item.subtype === 'question';
              const daysWaiting = item.waiting_since ? getDaysDiff(item.waiting_since) : 0;
              const daysCreated = getDaysDiff(item.created_at);

              // Sodokan threshold (PRD 5.5): Waiting > 3 hari, Question > 7 hari
              const isOverdueWaiting = isWaiting && daysWaiting > 3;
              const isOverdueQuestion = isQuestion && daysCreated > 7;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                    isOverdueWaiting || isOverdueQuestion
                      ? 'bg-[#FEF3C7]/40 border-amber-300 ring-1 ring-amber-300/60'
                      : 'bg-white border-[#DFE6DC] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="space-y-2.5 flex-1">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Tipe Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.type === 'action'
                            ? 'bg-[#EBF4EE] text-[#1E3B2B] border border-[#CBE0D1]'
                            : item.type === 'waiting'
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            : 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
                        }`}
                      >
                        {item.type}
                      </span>

                      {/* Subtipe */}
                      {item.subtype && (
                        <span className="px-2 py-0.5 rounded-md bg-[#EFF3ED] text-[#19241C] border border-[#DFE6DC] font-semibold capitalize">
                          {item.subtype.replace('_', ' ')}
                        </span>
                      )}

                      {/* Area / Project */}
                      {item.project_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#EFF3ED] text-[#5B6B60] border border-[#DFE6DC] font-mono">
                          🎯 {item.project_name}
                        </span>
                      ) : item.area_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#EFF3ED] text-[#5B6B60] border border-[#DFE6DC] font-mono">
                          📁 {item.area_name}
                        </span>
                      ) : null}

                      {/* Person */}
                      {item.person_name && (
                        <span className="px-2 py-0.5 rounded-md bg-[#EFF3ED] text-[#5B6B60] border border-[#DFE6DC] flex items-center gap-1 font-mono">
                          <span>👤</span>
                          <span>{item.person_name}</span>
                        </span>
                      )}

                      {/* Warning Overdue / Sodokan Tag (PRD 5.5) */}
                      {isOverdueWaiting && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] font-bold">
                          ⚡ Perlu ditagih ({daysWaiting} hari)
                        </span>
                      )}
                      {isOverdueQuestion && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] font-bold">
                          ⚡ Belum terjawab ({daysCreated} hari)
                        </span>
                      )}
                    </div>

                    {/* Judul & Body */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-[#19241C] leading-snug">{item.title}</h3>
                      {item.body && (
                        <p className="text-xs text-[#5B6B60] line-clamp-2">{item.body}</p>
                      )}
                    </div>

                    {/* Timestamp info */}
                    <div className="flex items-center gap-3 text-[10px] text-[#5B6B60] font-mono">
                      <span>Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                      {item.waiting_since && (
                        <span>Menunggu sejak: {item.waiting_since}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Tandai Selesai) */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#DFE6DC]">
                    <button
                      onClick={() => handleDone(item.id)}
                      className="px-4 py-2 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>✓ Selesai</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl text-[#5B6B60] hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs"
                      title="Hapus"
                    >
                      🗑️
                    </button>
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
