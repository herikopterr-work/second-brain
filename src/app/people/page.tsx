'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Master Data People</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Daftar orang yang terhubung dengan pertanyaan (Question) dan tindak lanjut (Waiting).
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950"
          >
            <span>+ Tambah Orang</span>
          </button>
        </div>

        {/* Content Layout: Master List & Detail Panel */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-400">Memuat data People...</div>
        ) : people.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 space-y-3">
            <p>Belum ada daftar orang yang tersimpan.</p>
            <p className="text-neutral-400">
              Anda bisa menambahkannya lewat tombol di atas atau langsung dari dropdown pemilih di form Inbox.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daftar People (Kolom Kiri) */}
            <div className="md:col-span-1 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
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
                          ? 'bg-neutral-900 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-xl'
                          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-xs text-neutral-100">{p.name}</h3>
                          {p.role && <p className="text-[11px] text-neutral-400 mt-0.5">{p.role}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleOpenEdit(p, e)}
                            className="text-neutral-500 hover:text-neutral-200 p-1 text-[11px]"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => handleDelete(p, e)}
                            className="text-neutral-500 hover:text-rose-400 p-1 text-[11px]"
                            title="Hapus"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Badges Items */}
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        {countQ > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {countQ} Question
                          </span>
                        )}
                        {countW > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {countW} Waiting
                          </span>
                        )}
                        {countQ === 0 && countW === 0 && (
                          <span className="text-neutral-600">Tidak ada item aktif</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel Detail Item Terhubung (PRD 5.3) */}
            <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
              {selectedPerson ? (
                <div className="space-y-6">
                  {/* Header Detail */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        <div>
                          <h2 className="text-lg font-bold text-neutral-100">{selectedPerson.name}</h2>
                          {selectedPerson.role && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-800 text-neutral-300">
                              {selectedPerson.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(selectedPerson)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
                    >
                      Edit Kontak
                    </button>
                  </div>

                  {/* Section 1: Questions terkait orang ini */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <span>❓ Question (Pertanyaan Aktif)</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-[10px]">
                          {selectedPerson.questions.length}
                        </span>
                      </h3>
                    </div>

                    {selectedPerson.questions.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic p-3 bg-neutral-950/40 rounded-xl border border-neutral-800/40">
                        Tidak ada pertanyaan aktif yang menunggu untuk ditanyakan kepada {selectedPerson.name}.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPerson.questions.map((q) => (
                          <div
                            key={q.id}
                            className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1 text-xs"
                          >
                            <p className="font-semibold text-neutral-200">{q.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                              <span>Dibuat: {new Date(q.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Waiting terkait orang ini */}
                  <div className="space-y-3 pt-4 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <span>⏳ Waiting For (Menunggu Tindak Lanjut)</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-[10px]">
                          {selectedPerson.waitings.length}
                        </span>
                      </h3>
                    </div>

                    {selectedPerson.waitings.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic p-3 bg-neutral-950/40 rounded-xl border border-neutral-800/40">
                        Tidak ada pekerjaan yang sedang ditunggu dari {selectedPerson.name}.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPerson.waitings.map((w) => (
                          <div
                            key={w.id}
                            className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-neutral-200">{w.title}</p>
                              {w.subtype && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {w.subtype}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-amber-400/80 font-mono">
                              <span>Menunggu sejak: {w.waiting_since || 'Hari ini'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-xs text-neutral-500 space-y-2">
                  <div className="text-3xl">👈</div>
                  <p>Pilih salah satu kontak di sebelah kiri untuk melihat detail Questions dan Waitings miliknya.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Tambah / Edit Person */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-neutral-100">
                {editingPerson ? 'Edit Data Orang' : 'Tambah Orang Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Peran / Jabatan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Atasan, Vendor, Tim IT, Klien"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
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
