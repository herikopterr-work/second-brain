'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import {
  getAreas,
  createArea,
  updateArea,
  deleteArea,
  toggleArchiveArea,
  type AreaWithCounts,
} from '@/lib/crud/actions';

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Modal Tambah / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaWithCounts | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAreas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAreas();
      setAreas(data);
    } catch (err) {
      console.error('Gagal memuat areas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const handleOpenAdd = () => {
    setEditingArea(null);
    setName('');
    setShowModal(true);
  };

  const handleOpenEdit = (area: AreaWithCounts) => {
    setEditingArea(area);
    setName(area.name);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    try {
      if (editingArea) {
        await updateArea(editingArea.id, name);
      } else {
        await createArea(name);
      }
      setShowModal(false);
      setName('');
      setEditingArea(null);
      await loadAreas();
    } catch (err) {
      alert(`Gagal menyimpan Area: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (area: AreaWithCounts) => {
    if (area.is_default) {
      alert('Area default "Uncategorized" tidak dapat dihapus.');
      return;
    }

    if (area.project_count > 0) {
      alert(`Tidak dapat menghapus Area ini karena masih memuat ${area.project_count} project. Pindahkan atau hapus project terlebih dahulu.`);
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus Area "${area.name}"?`)) return;

    try {
      await deleteArea(area.id);
      await loadAreas();
    } catch (err) {
      alert(`Gagal menghapus Area: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const handleToggleArchive = async (area: AreaWithCounts) => {
    try {
      await toggleArchiveArea(area.id, !area.archived_at);
      await loadAreas();
    } catch (err) {
      alert(`Gagal mengubah arsip: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const displayedAreas = areas.filter((a) => (showArchived ? true : !a.archived_at));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kelola Areas</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Struktur PARA tingkat 1: Lingkup tanggung jawab utama tanpa garis akhir.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Tampilkan Arsip</span>
            </label>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950"
            >
              <span>+ Tambah Area</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-400">Memuat data Areas...</div>
        ) : displayedAreas.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
            Belum ada Area yang terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayedAreas.map((area) => (
              <div
                key={area.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  area.archived_at
                    ? 'bg-neutral-900/40 border-neutral-800/40 opacity-60'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-xl'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📁</span>
                      <h3 className="font-bold text-sm text-neutral-100">{area.name}</h3>
                    </div>
                    {area.is_default && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        Default
                      </span>
                    )}
                    {area.archived_at && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700 shrink-0">
                        Diarsip
                      </span>
                    )}
                  </div>

                  {/* Statistik Counts */}
                  <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2 border-t border-neutral-800/60 font-mono">
                    <div>
                      <span className="text-neutral-100 font-semibold">{area.project_count}</span> Project
                    </div>
                    <div>
                      <span className="text-neutral-100 font-semibold">{area.item_count}</span> Item
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-800/60 text-xs">
                  <button
                    onClick={() => handleOpenEdit(area)}
                    className="px-2.5 py-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                  >
                    Edit
                  </button>

                  {!area.is_default && (
                    <>
                      <button
                        onClick={() => handleToggleArchive(area)}
                        className="px-2.5 py-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                      >
                        {area.archived_at ? 'Buka Arsip' : 'Arsipkan'}
                      </button>
                      <button
                        onClick={() => handleDelete(area)}
                        className="px-2.5 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tambah / Edit Area */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-neutral-100">
                {editingArea ? 'Edit Nama Area' : 'Tambah Area Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Nama Area</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Operasional, Finansial, Pribadi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || saving}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
