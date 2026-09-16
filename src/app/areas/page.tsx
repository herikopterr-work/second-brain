'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
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
    <AppShell maxContentWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE6DC]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#19241C]">Kelola Areas</h1>
            <p className="text-xs text-[#5B6B60] mt-0.5">
              Struktur PARA tingkat 1: Lingkup tanggung jawab utama tanpa garis akhir.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[#5B6B60] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded bg-white border-[#DFE6DC] text-[#162B20] focus:ring-[#162B20]"
              />
              <span>Tampilkan Arsip</span>
            </label>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>+ Tambah Area</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#5B6B60]">Memuat data Areas...</div>
        ) : displayedAreas.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#5B6B60] bg-white border border-[#DFE6DC] rounded-3xl p-8 shadow-sm">
            Belum ada Area yang terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayedAreas.map((area) => (
              <div
                key={area.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                  area.archived_at
                    ? 'bg-white/50 border-[#DFE6DC]/60 opacity-60'
                    : 'bg-white border-[#DFE6DC] hover:border-[#CBD5E1] shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📁</span>
                      <h3 className="font-bold text-sm text-[#19241C]">{area.name}</h3>
                    </div>
                    {area.is_default && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF4EE] text-[#1E3B2B] border border-[#CBE0D1] shrink-0">
                        Default
                      </span>
                    )}
                    {area.archived_at && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF3ED] text-[#5B6B60] border border-[#DFE6DC] shrink-0">
                        Diarsip
                      </span>
                    )}
                  </div>

                  {/* Statistik Counts */}
                  <div className="flex items-center gap-4 text-xs text-[#5B6B60] pt-2 border-t border-[#DFE6DC] font-mono">
                    <div>
                      <span className="text-[#19241C] font-bold">{area.project_count}</span> Project
                    </div>
                    <div>
                      <span className="text-[#19241C] font-bold">{area.item_count}</span> Item
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#DFE6DC] text-xs">
                  <button
                    onClick={() => handleOpenEdit(area)}
                    className="px-2.5 py-1 rounded-lg text-[#5B6B60] hover:text-[#19241C] hover:bg-[#EFF3ED] transition-colors font-medium"
                  >
                    Edit
                  </button>

                  {!area.is_default && (
                    <>
                      <button
                        onClick={() => handleToggleArchive(area)}
                        className="px-2.5 py-1 rounded-lg text-[#5B6B60] hover:text-[#19241C] hover:bg-[#EFF3ED] transition-colors font-medium"
                      >
                        {area.archived_at ? 'Buka Arsip' : 'Arsipkan'}
                      </button>
                      <button
                        onClick={() => handleDelete(area)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-medium"
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
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-[#19241C]">
                {editingArea ? 'Edit Nama Area' : 'Tambah Area Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Nama Area</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Operasional, Finansial, Pribadi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#DFE6DC] hover:bg-[#EFF3ED] text-[#5B6B60] text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || saving}
                    className="flex-1 py-2.5 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white text-xs font-semibold disabled:opacity-50 shadow-sm"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
