'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Open Items</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Seluruh pekerjaan aktif yang siap dieksekusi atau sedang berjalan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/capture"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950"
            >
              <span>⚡ Capture</span>
            </Link>
            <Link
              href="/inbox"
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors border border-neutral-700/60"
            >
              <span>📥 Inbox</span>
            </Link>
          </div>
        </div>

        {/* Banner Peringatan: Area Uncategorized > 10 */}
        {uncategorizedCount > 10 && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3 shadow-xl">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="space-y-1">
              <p className="font-bold text-sm">Peringatan: Area "Uncategorized" menumpuk ({uncategorizedCount} item)!</p>
              <p className="text-amber-400/90 leading-relaxed">
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
                ? 'bg-neutral-900 border-neutral-600 text-neutral-100 ring-1 ring-neutral-500 shadow-md'
                : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-neutral-400">Total Aktif</div>
            <div className="text-xl font-bold text-neutral-100 font-mono mt-0.5">{stats.total}</div>
          </button>

          <button
            onClick={() => setTypeFilter('action')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              typeFilter === 'action'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500 shadow-md'
                : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-emerald-400">ACTION</div>
            <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">{stats.action}</div>
          </button>

          <button
            onClick={() => setTypeFilter('waiting')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              typeFilter === 'waiting'
                ? 'bg-amber-950/60 border-amber-500 text-amber-300 ring-1 ring-amber-500 shadow-md'
                : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-amber-400">WAITING</div>
            <div className="text-xl font-bold text-amber-300 font-mono mt-0.5">{stats.waiting}</div>
          </button>

          <button
            onClick={() => setTypeFilter('resource')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              typeFilter === 'resource'
                ? 'bg-blue-950/60 border-blue-500 text-blue-300 ring-1 ring-blue-500 shadow-md'
                : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-blue-400">RESOURCE</div>
            <div className="text-xl font-bold text-blue-300 font-mono mt-0.5">{stats.resource}</div>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-xl">
          {/* Search Text */}
          <input
            type="text"
            placeholder="Cari judul, catatan, atau nama orang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Filter Area / Project */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Filter Area / Project
              </label>
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
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
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Filter Orang (Person)
              </label>
              <select
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
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
          <div className="py-20 text-center text-xs text-neutral-400">Memuat daftar Open Items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 space-y-3">
            <p className="text-sm font-semibold text-neutral-300">Tidak ada item yang cocok dengan filter.</p>
            <p className="text-neutral-500">
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
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
                    isOverdueWaiting || isOverdueQuestion
                      ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-2.5 flex-1">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Tipe Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.type === 'action'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.type === 'waiting'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {item.type}
                      </span>

                      {/* Subtipe */}
                      {item.subtype && (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-medium capitalize">
                          {item.subtype.replace('_', ' ')}
                        </span>
                      )}

                      {/* Area / Project */}
                      {item.project_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono">
                          🎯 {item.project_name}
                        </span>
                      ) : item.area_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono">
                          📁 {item.area_name}
                        </span>
                      ) : null}

                      {/* Person */}
                      {item.person_name && (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 flex items-center gap-1 font-mono">
                          <span>👤</span>
                          <span>{item.person_name}</span>
                        </span>
                      )}

                      {/* Warning Overdue / Sodokan Tag (PRD 5.5) */}
                      {isOverdueWaiting && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                          ⚡ Perlu ditagih ({daysWaiting} hari)
                        </span>
                      )}
                      {isOverdueQuestion && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                          ⚡ Belum terjawab ({daysCreated} hari)
                        </span>
                      )}
                    </div>

                    {/* Judul & Body */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-neutral-100 leading-snug">{item.title}</h3>
                      {item.body && (
                        <p className="text-xs text-neutral-400 line-clamp-2">{item.body}</p>
                      )}
                    </div>

                    {/* Timestamp info */}
                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
                      <span>Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                      {item.waiting_since && (
                        <span>Menunggu sejak: {item.waiting_since}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Tandai Selesai) */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800/80">
                    <button
                      onClick={() => handleDone(item.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950 active:scale-95"
                    >
                      <span>✓ Selesai</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors text-xs"
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
      </main>
    </div>
  );
}
