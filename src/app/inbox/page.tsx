'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import PersonSelect from '@/components/PersonSelect';
import {
  getInboxData,
  clarifyItem,
  createPersonInline,
  createAreaInline,
  createProjectInline,
  type InboxItem,
  type Area,
  type Project,
  type Person,
} from '@/lib/inbox/actions';

const TYPE_CONFIG = {
  action: {
    label: 'ACTION',
    desc: 'Bola di tangan saya (Saya yang mengerjakan)',
    color: 'emerald',
    subtypes: [
      { key: 'task', label: 'Task (Tugas)' },
      { key: 'commitment', label: 'Commitment (Janji)' },
      { key: 'issue', label: 'Issue (Kendala)' },
      { key: 'question', label: 'Question (Pertanyaan)' },
    ],
  },
  waiting: {
    label: 'WAITING',
    desc: 'Bola di tangan orang lain (Menunggu orang lain)',
    color: 'amber',
    subtypes: [
      { key: 'waiting_for', label: 'Waiting For (Menunggu)' },
      { key: 'blocker', label: 'Blocker (Tersumbat)' },
      { key: 'follow_up', label: 'Follow Up (Perlu Ditagih)' },
    ],
  },
  resource: {
    label: 'RESOURCE',
    desc: 'Tidak ada bola (Referensi / Keputusan masa lalu)',
    color: 'blue',
    subtypes: [
      { key: 'reference', label: 'Reference (Dokumen/Catatan)' },
      { key: 'decision', label: 'Decision (Keputusan)' },
    ],
  },
};

export default function InboxPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);

  // Form State untuk item terdepan yang sedang di-clarify
  const [selectedType, setSelectedType] = useState<'action' | 'waiting' | 'resource' | ''>('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string>(''); // format "area:ID" atau "proj:ID"
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal / Inline Creators
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');

  const [showNewArea, setShowNewArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAreaId, setNewProjectAreaId] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInboxData();
      setItems(data.inboxItems);
      setAreas(data.areas);
      setProjects(data.projects);
      setPeople(data.people);
      setUncategorizedCount(data.uncategorizedCount);

      // Default target ke Uncategorized Area jika ada
      const defaultArea = data.areas.find((a) => a.is_default);
      if (defaultArea) {
        setSelectedTarget(`area:${defaultArea.id}`);
      }
    } catch (err) {
      console.error('Gagal memuat data inbox:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentItem = items[0] || null;
  const nextItem = items[1] || null;

  // Reset form untuk kartu berikutnya
  const resetFormForNextCard = () => {
    setSelectedType('');
    setSelectedSubtype('');
    setSelectedPersonId('');
  };

  // Logika kapan field person wajib muncul
  const isPersonRequired =
    selectedType === 'waiting' || (selectedType === 'action' && selectedSubtype === 'question');

  // Ganti tipe
  const handleTypeSelect = (type: 'action' | 'waiting' | 'resource') => {
    setSelectedType(type);
    // Set default subtipe pertama dari tipe tersebut
    const firstSubtype = TYPE_CONFIG[type].subtypes[0].key;
    setSelectedSubtype(firstSubtype);
  };

  // Validasi tombol simpan
  const isFormValid =
    selectedType !== '' &&
    selectedSubtype !== '' &&
    selectedTarget !== '' &&
    (!isPersonRequired || (isPersonRequired && selectedPersonId !== ''));

  // Simpan Clarify & Auto-Advance ke kartu berikutnya
  const handleClarifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !isFormValid || saving) return;

    setSaving(true);

    try {
      let areaId = '';
      let projectId: string | null = null;

      if (selectedTarget.startsWith('proj:')) {
        projectId = selectedTarget.replace('proj:', '');
        const proj = projects.find((p) => p.id === projectId);
        areaId = proj?.area_id || '';
      } else if (selectedTarget.startsWith('area:')) {
        areaId = selectedTarget.replace('area:', '');
      }

      await clarifyItem({
        itemId: currentItem.id,
        type: selectedType as 'action' | 'waiting' | 'resource',
        subtype: selectedSubtype,
        areaId,
        projectId,
        personId: isPersonRequired ? selectedPersonId : null,
        waitingSince: selectedType === 'waiting' ? new Date().toISOString().split('T')[0] : null,
      });

      // Hapus item terdepan dari antrean lokal seketika (Auto-Advance)
      setItems((prev) => prev.slice(1));
      resetFormForNextCard();
    } catch (err) {
      alert(`Gagal menyimpan clarify: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Handler Inline Tambah Person
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    try {
      const created = await createPersonInline(newPersonName, newPersonRole);
      setPeople((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedPersonId(created.id);
      setNewPersonName('');
      setNewPersonRole('');
      setShowNewPerson(false);
    } catch (err) {
      alert(`Gagal membuat person: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Handler Inline Tambah Area
  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    try {
      const created = await createAreaInline(newAreaName);
      setAreas((prev) => [...prev, created]);
      setSelectedTarget(`area:${created.id}`);
      setNewAreaName('');
      setShowNewArea(false);
    } catch (err) {
      alert(`Gagal membuat area: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Handler Inline Tambah Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectAreaId) return;

    try {
      const created = await createProjectInline(newProjectName, newProjectAreaId);
      setProjects((prev) => [...prev, created]);
      setSelectedTarget(`proj:${created.id}`);
      setNewProjectName('');
      setNewProjectAreaId('');
      setShowNewProject(false);
    } catch (err) {
      alert(`Gagal membuat project: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF3ED] text-[#19241C] flex flex-col">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-start space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#19241C]">Inbox & Clarify</h1>
            <p className="text-xs text-[#5B6B60] mt-0.5">
              Pertanyaan tunggal: <span className="text-[#1E3B2B] font-bold">"Bola ada di tangan siapa?"</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF4EE] text-[#1E3B2B] border border-[#CBE0D1]">
              {items.length} di Antrean
            </span>
          </div>
        </div>

        {/* Peringatan Area Uncategorized > 10 */}
        {uncategorizedCount > 10 && (
          <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs flex items-start gap-2.5 shadow-sm">
            <span className="text-base mt-0.5 shrink-0">⚠️</span>
            <div>
              <p className="font-bold">Area Uncategorized menumpuk ({uncategorizedCount} item)!</p>
              <p className="text-[11px] text-[#92400E]/90 mt-0.5">
                Disarankan untuk mengelompokkan item baru ke dalam Area atau Project spesifik agar tidak kehilangan konteks.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="animate-spin text-3xl">🌀</div>
            <p className="text-xs text-[#5B6B60]">Memuat antrean Inbox...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State: Zero Inbox */
          <div className="my-auto py-16 text-center space-y-6 bg-white border border-[#DFE6DC] rounded-3xl p-8 shadow-sm">
            <div className="text-6xl animate-bounce">🎉</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#19241C] tracking-tight">Inbox Nol (Zero Inbox)!</h2>
              <p className="text-xs text-[#5B6B60] max-w-sm mx-auto">
                Seluruh ide dan catatan baru telah berhasil diklarifikasi dan dipetakan ke tempatnya masing-masing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link
                href="/capture"
                className="px-6 py-3 rounded-2xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-all shadow-sm"
              >
                ⚡ Quick Capture Baru
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-2xl bg-white hover:bg-[#EFF3ED] text-[#19241C] font-semibold text-xs transition-all border border-[#DFE6DC]"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : (
          /* Card Stack Presentation (Fokus Kartu Tunggal) */
          <div className="relative w-full">
            {/* Kartu Berikutnya (Memudar di Belakang) */}
            {nextItem && (
              <div
                aria-hidden="true"
                className="absolute top-4 left-0 right-0 h-full bg-white/70 border border-[#DFE6DC] rounded-3xl p-6 transform scale-[0.96] -translate-y-2 opacity-50 blur-[0.5px] pointer-events-none select-none z-0 shadow-sm"
              >
                <div className="h-4 w-24 bg-[#EFF3ED] rounded mb-4" />
                <div className="text-[#5B6B60] text-sm line-clamp-2">{nextItem.title}</div>
              </div>
            )}

            {/* Kartu Utama Aktif di Depan */}
            <div className="relative z-10 bg-white border border-[#DFE6DC] rounded-3xl p-6 sm:p-7 shadow-md space-y-6">
              {/* Header Kartu: Judul Item */}
              <div className="space-y-1.5 pb-4 border-b border-[#DFE6DC]">
                <div className="flex items-center justify-between text-[11px] text-[#5B6B60] font-mono font-medium">
                  <span>Item #1 dari {items.length}</span>
                  <span>{new Date(currentItem.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h2 className="text-lg font-bold text-[#19241C] leading-snug whitespace-pre-wrap">
                  {currentItem.title}
                </h2>
                {currentItem.body && (
                  <p className="text-xs text-[#5B6B60] mt-1 whitespace-pre-wrap">{currentItem.body}</p>
                )}
              </div>

              {/* Form Clarify Berjenjang */}
              <form onSubmit={handleClarifySubmit} className="space-y-5">
                {/* 1. Pemilih Tipe */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B60]">
                    1. Tipe Item <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['action', 'waiting', 'resource'] as const).map((type) => {
                      const isSelected = selectedType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTypeSelect(type)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? type === 'action'
                                ? 'bg-[#EBF4EE] border-emerald-600 text-[#1E3B2B] ring-2 ring-emerald-500/30 shadow-sm font-bold'
                                : type === 'waiting'
                                ? 'bg-[#FEF3C7] border-amber-600 text-[#92400E] ring-2 ring-amber-500/30 shadow-sm font-bold'
                                : 'bg-[#E0F2FE] border-blue-600 text-[#0369A1] ring-2 ring-blue-500/30 shadow-sm font-bold'
                              : 'bg-[#EFF3ED] border-[#DFE6DC] text-[#5B6B60] hover:border-[#CBD5E1] hover:text-[#19241C]'
                          }`}
                        >
                          <span className="font-bold text-xs">{TYPE_CONFIG[type].label}</span>
                          <span className="text-[10px] opacity-80 hidden sm:inline">
                            {type === 'action' ? 'Saya' : type === 'waiting' ? 'Orang Lain' : 'Arsip'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedType && (
                    <p className="text-[11px] text-[#5B6B60] italic px-1">
                      {TYPE_CONFIG[selectedType].desc}
                    </p>
                  )}
                </div>

                {/* 2. Pemilih Sub-Tipe (Dinamis sesuai tipe) */}
                {selectedType && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B60]">
                      2. Sub-Tipe <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TYPE_CONFIG[selectedType].subtypes.map((sub) => (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={() => setSelectedSubtype(sub.key)}
                          className={`px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                            selectedSubtype === sub.key
                              ? 'bg-[#162B20] border-[#162B20] text-white shadow-sm'
                              : 'bg-[#EFF3ED] border-[#DFE6DC] text-[#5B6B60] hover:border-[#CBD5E1] hover:text-[#19241C]'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Pemilih Project / Area (Wajib) */}
                {selectedType && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B60]">
                        3. Project / Area <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewArea(true)}
                          className="text-[11px] font-bold text-[#1E3B2B] hover:underline"
                        >
                          + Area
                        </button>
                        <span className="text-[#CBD5E1]">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (areas.length > 0) setNewProjectAreaId(areas[0].id);
                            setShowNewProject(true);
                          }}
                          className="text-[11px] font-bold text-[#1E3B2B] hover:underline"
                        >
                          + Project
                        </button>
                      </div>
                    </div>

                    <select
                      value={selectedTarget}
                      onChange={(e) => setSelectedTarget(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20] focus:ring-1 focus:ring-[#162B20] shadow-sm font-medium"
                    >
                      <optgroup label="── Area Langsung ──">
                        {areas.map((a) => (
                          <option key={`area:${a.id}`} value={`area:${a.id}`}>
                            📁 {a.name} {a.is_default ? '(Default)' : ''}
                          </option>
                        ))}
                      </optgroup>

                      {projects.length > 0 && (
                        <optgroup label="── Projects (PARA) ──">
                          {projects.map((p) => {
                            const parentArea = areas.find((a) => a.id === p.area_id);
                            return (
                              <option key={`proj:${p.id}`} value={`proj:${p.id}`}>
                                🎯 {p.name} ({parentArea?.name || 'Area'})
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                  </div>
                )}

                {/* 4. Pemilih Person (Wajib jika Waiting atau Question) */}
                {isPersonRequired && (
                  <div className="space-y-2 animate-fade-in p-4 rounded-2xl bg-[#FEF3C7]/40 border border-[#FDE68A]">
                    <PersonSelect
                      people={people}
                      selectedPersonId={selectedPersonId}
                      onSelectPerson={setSelectedPersonId}
                      required={true}
                      onPersonCreated={(newP) => {
                        setPeople((prev) => [...prev, newP as Person].sort((a, b) => a.name.localeCompare(b.name)));
                      }}
                      label="4. Terkait Siapa (Person)"
                    />
                    {selectedType === 'waiting' && (
                      <p className="text-[11px] text-[#92400E] font-medium mt-1">
                        📅 Tanggal <code>waiting_since</code> otomatis diisi hari ini ({new Date().toISOString().split('T')[0]}).
                      </p>
                    )}
                  </div>
                )}

                {/* Tombol Simpan & Auto-Advance */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || saving}
                    className="w-full py-4 px-6 rounded-2xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin">🌀</span>
                        <span>Menyimpan & Memajukan...</span>
                      </>
                    ) : (
                      <>
                        <span>Simpan & Lanjutkan</span>
                        <span className="text-base">➔</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Tambah Person Baru */}
        {showNewPerson && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-[#19241C]">Tambah Orang Baru</h3>
              <form onSubmit={handleCreatePerson} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Nama</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Budi Santoso"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Role / Jabatan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Atasan, Vendor, Tim IT"
                    value={newPersonRole}
                    onChange={(e) => setNewPersonRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPerson(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#DFE6DC] hover:bg-[#EFF3ED] text-[#5B6B60] text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white text-xs font-semibold shadow-sm"
                  >
                    Simpan Orang
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Tambah Area Baru */}
        {showNewArea && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-[#19241C]">Tambah Area Baru</h3>
              <form onSubmit={handleCreateArea} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Nama Area</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Finansial, Kesehatan, Operasional"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewArea(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#DFE6DC] hover:bg-[#EFF3ED] text-[#5B6B60] text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white text-xs font-semibold shadow-sm"
                  >
                    Simpan Area
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Tambah Project Baru */}
        {showNewProject && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#DFE6DC] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-[#19241C]">Tambah Project Baru</h3>
              <form onSubmit={handleCreateProject} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Nama Project</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Rilis Web v1.0"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B6B60] mb-1">Induk Area</label>
                  <select
                    value={newProjectAreaId}
                    onChange={(e) => setNewProjectAreaId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white border border-[#DFE6DC] hover:bg-[#EFF3ED] text-[#5B6B60] text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white text-xs font-semibold shadow-sm"
                  >
                    Simpan Project
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
