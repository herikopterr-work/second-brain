'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
  type PersonWithItems,
} from '@/lib/crud/actions';

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithItems | null>(null);

  // Modal Tambah / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonWithItems | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPeople = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPeople();
      setPeople(data);
      if (selectedPerson) {
        const updated = data.find((p) => p.id === selectedPerson.id) || null;
        setSelectedPerson(updated);
      }
    } catch (err) {
      console.error('Gagal memuat people:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPerson]);

  useEffect(() => {
    loadPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingPerson(null);
    setName('');
    setRole('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: PersonWithItems, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPerson(p);
    setName(p.name);
    setRole(p.role || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    try {
      if (editingPerson) {
        await updatePerson(editingPerson.id, name, role);
      } else {
        await createPerson(name, role);
      }
      setShowModal(false);
      setName('');
      setRole('');
      setEditingPerson(null);
      await loadPeople();
    } catch (err) {
      alert(`Gagal menyimpan Person: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: PersonWithItems, e: React.MouseEvent) => {
    e.stopPropagation();
    const totalItems = p.questions.length + p.waitings.length;
    if (totalItems > 0) {
      if (!confirm(`Orang ini terhubung ke ${totalItems} item aktif (Questions/Waiting). Yakin ingin menghapus?`)) {
        return;
      }
    } else {
      if (!confirm(`Hapus "${p.name}"?`)) return;
    }

    try {
      await deletePerson(p.id);
      if (selectedPerson?.id === p.id) setSelectedPerson(null);
      await loadPeople();
    } catch (err) {
      alert(`Gagal menghapus Person: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  return (
    <AppShell maxContentWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE6DC]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#19241C]">Master Data People</h1>
            <p className="text-xs text-[#5B6B60] mt-0.5">
              Daftar orang yang terhubung dengan pertanyaan (Question) dan tindak lanjut (Waiting).
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>+ Tambah Orang</span>
          </button>
        </div>

        {/* Content Layout: Master List & Detail Panel */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#5B6B60]">Memuat data People...</div>
        ) : people.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#5B6B60] bg-white border border-[#DFE6DC] rounded-3xl p-8 space-y-3 shadow-sm">
            <p className="font-semibold text-[#19241C]">Belum ada daftar orang yang tersimpan.</p>
            <p className="text-[#5B6B60]">
              Anda bisa menambahkannya lewat tombol di atas atau langsung dari dropdown pemilih di form Inbox.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daftar People (Kolom Kiri) */}
            <div className="md:col-span-1 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B6B60] mb-2">
                Daftar Kontak ({people.length})
              </h2>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {people.map((p) => {
                  const isSelected = selectedPerson?.id === p.id;
                  const countQ = p.questions.length;
                  const countW = p.waitings.length;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPerson(p)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                          : 'bg-white/70 border-[#DFE6DC] hover:border-[#CBD5E1] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-xs text-[#19241C]">{p.name}</h3>
                          {p.role && <p className="text-[11px] text-[#5B6B60] mt-0.5">{p.role}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleOpenEdit(p, e)}
                            className="text-[#5B6B60] hover:text-[#19241C] p-1 text-[11px]"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => handleDelete(p, e)}
                            className="text-[#5B6B60] hover:text-rose-600 p-1 text-[11px]"
                            title="Hapus"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Badges Items */}
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        {countQ > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#1E3B2B] border border-[#CBE0D1] font-semibold">
                            {countQ} Question
                          </span>
                        )}
                        {countW > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold">
                            {countW} Waiting
                          </span>
                        )}
                        {countQ === 0 && countW === 0 && (
                          <span className="text-[#9CA3AF]">Tidak ada item aktif</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel Detail Item Terhubung (PRD 5.3) */}
            <div className="md:col-span-2 bg-white border border-[#DFE6DC] rounded-3xl p-6 shadow-sm space-y-6">
              {selectedPerson ? (
                <div className="space-y-6">
                  {/* Header Detail */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#DFE6DC]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        <div>
                          <h2 className="text-lg font-bold text-[#19241C]">{selectedPerson.name}</h2>
                          {selectedPerson.role && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#EFF3ED] text-[#5B6B60] border border-[#DFE6DC]">
                              {selectedPerson.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(selectedPerson)}
                      className="px-3 py-1.5 rounded-xl bg-[#EFF3ED] hover:bg-[#DFE6DC] text-[#19241C] text-xs font-semibold"
                    >
                      Edit Kontak
                    </button>
                  </div>

                  {/* Section 1: Questions terkait orang ini */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <span>❓ Question (Pertanyaan Aktif)</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#1E3B2B] text-[10px] font-bold">
                          {selectedPerson.questions.length}
                        </span>
                      </h3>
                    </div>

                    {selectedPerson.questions.length === 0 ? (
                      <p className="text-xs text-[#5B6B60] italic p-3 bg-[#EFF3ED] rounded-2xl border border-[#DFE6DC]">
                        Tidak ada pertanyaan aktif yang menunggu untuk ditanyakan kepada {selectedPerson.name}.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPerson.questions.map((q) => (
                          <div
                            key={q.id}
                            className="p-3.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-2xl space-y-1 text-xs"
                          >
                            <p className="font-bold text-[#19241C]">{q.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-[#5B6B60] font-mono">
                              <span>Dibuat: {new Date(q.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Waiting terkait orang ini */}
                  <div className="space-y-3 pt-4 border-t border-[#DFE6DC]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <span>⏳ Waiting For (Menunggu Tindak Lanjut)</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold">
                          {selectedPerson.waitings.length}
                        </span>
                      </h3>
                    </div>

                    {selectedPerson.waitings.length === 0 ? (
                      <p className="text-xs text-[#5B6B60] italic p-3 bg-[#EFF3ED] rounded-2xl border border-[#DFE6DC]">
                        Tidak ada pekerjaan yang sedang ditunggu dari {selectedPerson.name}.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPerson.waitings.map((w) => (
                          <div
                            key={w.id}
                            className="p-3.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-2xl space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-[#19241C]">{w.title}</p>
                              {w.subtype && (
                                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                                  {w.subtype}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#92400E] font-mono font-medium">
                              <span>Menunggu sejak: {w.waiting_since || 'Hari ini'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-xs text-[#5B6B60] space-y-2">
                  <div className="text-3xl">👈</div>
                  <p>Pilih salah satu kontak di sebelah kiri untuk melihat detail Questions dan Waitings miliknya.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Tambah / Edit Person */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-[#19241C]">
                {editingPerson ? 'Edit Data Orang' : 'Tambah Orang Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Peran / Jabatan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Atasan, Vendor, Tim IT, Klien"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
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
