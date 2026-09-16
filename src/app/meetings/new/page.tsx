'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import PersonSelect, { type PersonOption } from '@/components/PersonSelect';
import {
  getMeetingFormData,
  getQuestionsForAttendees,
  createMeeting,
  createInlineMeetingItem,
  markQuestionAnswered,
  type AttendeeQuestion,
} from '@/lib/meetings/actions';
import { createPerson } from '@/lib/crud/actions';

interface StagedItem {
  tempId: string;
  title: string;
  type: 'action' | 'waiting' | 'resource';
  subtype: string;
  person_id?: string;
  person_name?: string;
  due_date?: string;
  body?: string;
}

const SUBTYPES_BY_TYPE = {
  action: [
    { key: 'task', label: 'Task' },
    { key: 'commitment', label: 'Commitment' },
    { key: 'issue', label: 'Issue' },
    { key: 'question', label: 'Question' },
  ],
  waiting: [
    { key: 'waiting_for', label: 'Waiting For' },
    { key: 'blocker', label: 'Blocker' },
    { key: 'follow_up', label: 'Follow Up' },
  ],
  resource: [
    { key: 'reference', label: 'Reference' },
    { key: 'decision', label: 'Decision' },
  ],
};

export default function NewMeetingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Master Data
  const [areas, setAreas] = useState<{ id: string; name: string; is_default: boolean }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; area_id: string }[]>([]);
  const [people, setPeople] = useState<PersonOption[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetContext, setTargetContext] = useState<string>(''); // 'area:ID' or 'proj:ID'
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [conclusion, setConclusion] = useState('');

  // Attendee Questions (PRD 5.4)
  const [attendeeQuestions, setAttendeeQuestions] = useState<AttendeeQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Inline New Person for attendees
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeRole, setNewAttendeeRole] = useState('');

  // Inline Item Creator (+Action / +Waiting / +Resource)
  const [activeItemType, setActiveItemType] = useState<'action' | 'waiting' | 'resource' | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtype, setItemSubtype] = useState('');
  const [itemPersonId, setItemPersonId] = useState('');
  const [itemDueDate, setItemDueDate] = useState('');
  const [itemBody, setItemBody] = useState('');
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);

  // Load master data
  const loadFormData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMeetingFormData();
      setAreas(data.areas);
      setProjects(data.projects);
      setPeople(data.people);

      // Default target ke Area pertama jika ada
      if (data.areas.length > 0) {
        const defaultArea = data.areas.find((a) => a.is_default) || data.areas[0];
        setTargetContext(`area:${defaultArea.id}`);
      }
    } catch (err) {
      console.error('Gagal memuat data form meeting:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  // Muat pertanyaan terbuka milik attendees (PRD 5.4)
  useEffect(() => {
    let isCancelled = false;
    async function fetchQuestions() {
      if (selectedAttendeeIds.length === 0) {
        setAttendeeQuestions([]);
        return;
      }
      try {
        setLoadingQuestions(true);
        const questions = await getQuestionsForAttendees(selectedAttendeeIds);
        if (!isCancelled) {
          setAttendeeQuestions(questions);
        }
      } catch (err) {
        console.error('Gagal memuat pertanyaan peserta:', err);
      } finally {
        if (!isCancelled) setLoadingQuestions(false);
      }
    }
    fetchQuestions();
    return () => {
      isCancelled = true;
    };
  }, [selectedAttendeeIds]);

  // Toggle attendee selection
  const toggleAttendee = (pId: string) => {
    setSelectedAttendeeIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  // Inline add new person into master and attendees
  const handleAddNewPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendeeName.trim()) return;

    try {
      const newPerson = await createPerson(newAttendeeName.trim(), newAttendeeRole.trim() || undefined);
      setPeople((prev) => [...prev, newPerson]);
      setSelectedAttendeeIds((prev) => [...prev, newPerson.id]);
      setNewAttendeeName('');
      setNewAttendeeRole('');
      setShowAddAttendee(false);
    } catch (err) {
      alert(`Gagal menambah kontak: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Handle Mark Question Answered
  const handleAnswerQuestion = async (qId: string) => {
    const ans = prompt('Catat jawaban singkat (opsional):');
    try {
      await markQuestionAnswered(qId, ans || undefined);
      setAttendeeQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch (err) {
      alert(`Gagal menandai terjawab: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Open inline item creator for specific type
  const openItemCreator = (type: 'action' | 'waiting' | 'resource') => {
    setActiveItemType(type);
    setItemTitle('');
    setItemSubtype(SUBTYPES_BY_TYPE[type][0].key);
    setItemPersonId('');
    setItemDueDate('');
    setItemBody('');
  };

  // Stage inline item
  const handleAddStagedItem = () => {
    if (!itemTitle.trim() || !activeItemType) return;

    if ((activeItemType === 'waiting' || itemSubtype === 'question') && !itemPersonId) {
      alert('Orang (Person) wajib dipilih untuk item Waiting atau Pertanyaan.');
      return;
    }

    const personObj = people.find((p) => p.id === itemPersonId);

    const newItem: StagedItem = {
      tempId: Math.random().toString(),
      title: itemTitle.trim(),
      type: activeItemType,
      subtype: itemSubtype,
      person_id: itemPersonId || undefined,
      person_name: personObj?.name,
      due_date: itemDueDate || undefined,
      body: itemBody.trim() || undefined,
    };

    setStagedItems((prev) => [...prev, newItem]);
    setActiveItemType(null);
  };

  // Remove staged item
  const handleRemoveStagedItem = (tempId: string) => {
    setStagedItems((prev) => prev.filter((it) => it.tempId !== tempId));
  };

  // Submit seluruh meeting dan output item-nya
  const handleSubmitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul meeting wajib diisi.');
      return;
    }

    if (!targetContext) {
      alert('Pilih Area atau Project terkait.');
      return;
    }

    setSaving(true);
    try {
      const area_id = targetContext.startsWith('area:') ? targetContext.replace('area:', '') : null;
      const project_id = targetContext.startsWith('proj:') ? targetContext.replace('proj:', '') : null;

      // 1. Buat record meeting
      const newMeetingId = await createMeeting({
        title: title.trim(),
        meeting_date: meetingDate,
        area_id,
        project_id,
        attendee_ids: selectedAttendeeIds,
        agenda: agenda.trim() || undefined,
        notes: notes.trim() || undefined,
        conclusion: conclusion.trim() || undefined,
      });

      // 2. Buat output item langsung (PRD 5.4: Langsung Open, warisi Area/Project)
      for (const item of stagedItems) {
        await createInlineMeetingItem({
          meeting_id: newMeetingId,
          title: item.title,
          type: item.type,
          subtype: item.subtype,
          area_id,
          project_id,
          person_id: item.person_id,
          due_date: item.due_date,
          body: item.body,
        });
      }

      router.push(`/meetings/${newMeetingId}`);
    } catch (err) {
      alert(`Gagal menyimpan meeting: ${err instanceof Error ? err.message : 'Error'}`);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell maxContentWidth="max-w-4xl">
        <div className="p-6 text-center text-xs text-[#5B6B60]">
          Memuat formulir meeting...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell maxContentWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-[#DFE6DC]">
          <div className="flex items-center gap-2">
            <Link
              href="/meetings"
              className="text-xs text-[#5B6B60] hover:text-[#19241C] flex items-center gap-1 font-medium transition-colors"
            >
              <span>←</span>
              <span>Daftar Meeting</span>
            </Link>
            <span className="text-[#CBD5C8]">/</span>
            <span className="text-xs font-bold text-[#19241C]">Catat Baru</span>
          </div>

          <button
            onClick={handleSubmitMeeting}
            disabled={saving || !title.trim()}
            className="px-4 py-2 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>💾</span>
            <span>{saving ? 'Menyimpan...' : 'Simpan Catatan Meeting'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmitMeeting} className="space-y-6">
          {/* Section 1: Data Pokok Meeting */}
          <div className="p-6 bg-white border border-[#DFE6DC] rounded-3xl space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B6B60]">
              1. Informasi Pokok Meeting
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Judul Meeting */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#19241C] mb-1.5">
                  Judul Meeting <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Sync Roadmap Q4 & Review SLA..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#162B20]"
                />
              </div>

              {/* Tanggal Meeting */}
              <div>
                <label className="block text-xs font-bold text-[#19241C] mb-1.5">
                  Tanggal Meeting <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] font-mono focus:outline-none focus:border-[#162B20]"
                />
              </div>
            </div>

            {/* Konteks PARA (Area / Project) */}
            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1.5">
                Konteks Terkait (Area atau Project) <span className="text-red-600">*</span>
              </label>
              <select
                value={targetContext}
                onChange={(e) => setTargetContext(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] focus:outline-none focus:border-[#162B20]"
              >
                <optgroup label="── Pilih Area ──">
                  {areas.map((a) => (
                    <option key={`area:${a.id}`} value={`area:${a.id}`}>
                      📁 {a.name} {a.is_default ? '(Default)' : ''}
                    </option>
                  ))}
                </optgroup>
                {projects.length > 0 && (
                  <optgroup label="── Pilih Project ──">
                    {projects.map((p) => (
                      <option key={`proj:${p.id}`} value={`proj:${p.id}`}>
                        🎯 {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="text-[11px] text-[#8A978E] mt-1">
                Semua item tugas yang lahir dari meeting ini akan otomatis mewarisi konteks ini.
              </p>
            </div>
          </div>

          {/* Section 2: Attendees & Automatic Agenda Questions */}
          <div className="p-6 bg-white border border-[#DFE6DC] rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B6B60]">
                  2. Peserta Meeting (Attendees)
                </h2>
                <p className="text-[11px] text-[#8A978E] mt-0.5">
                  Pertanyaan terbuka yang Anda miliki untuk peserta akan otomatis ditarik sebagai agenda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAttendee((v) => !v)}
                className="px-2.5 py-1 rounded-lg bg-[#EFF3ED] hover:bg-[#DFE6DC] text-[11px] font-bold text-[#19241C] transition-colors"
              >
                + Orang Baru
              </button>
            </div>

            {/* Inline Add Person Form */}
            {showAddAttendee && (
              <div className="p-3.5 bg-[#EFF3ED] border border-[#DFE6DC] rounded-2xl flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Nama Lengkap..."
                  value={newAttendeeName}
                  onChange={(e) => setNewAttendeeName(e.target.value)}
                  className="w-full sm:w-1/2 px-3 py-1.5 bg-white border border-[#DFE6DC] rounded-xl text-xs text-[#19241C]"
                />
                <input
                  type="text"
                  placeholder="Jabatan / Peran (opsional)..."
                  value={newAttendeeRole}
                  onChange={(e) => setNewAttendeeRole(e.target.value)}
                  className="w-full sm:w-1/3 px-3 py-1.5 bg-white border border-[#DFE6DC] rounded-xl text-xs text-[#19241C]"
                />
                <button
                  type="button"
                  onClick={handleAddNewPerson}
                  className="w-full sm:w-auto px-3 py-1.5 bg-[#162B20] text-white font-bold text-xs rounded-xl"
                >
                  Tambah
                </button>
              </div>
            )}

            {/* People Multi-select Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {people.map((p) => {
                const isSelected = selectedAttendeeIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleAttendee(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#162B20] text-white border-[#162B20] shadow-xs'
                        : 'bg-[#EFF3ED] text-[#5B6B60] border-[#DFE6DC] hover:border-[#CBD5C8]'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{p.name}</span>
                    {p.role && <span className="opacity-70 text-[10px]">({p.role})</span>}
                  </button>
                );
              })}
            </div>

            {/* Bahan Agenda Otomatis (PRD 5.4) */}
            {selectedAttendeeIds.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FEF3C7]/40 border border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#92400E]">
                    <span>💡</span>
                    <span>Bahan Agenda: Pertanyaan yang Menunggu Terjawab</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#92400E]">
                    {attendeeQuestions.length} Menunggu
                  </span>
                </div>

                {loadingQuestions ? (
                  <p className="text-[11px] text-[#92400E]">Mencari pertanyaan peserta...</p>
                ) : attendeeQuestions.length === 0 ? (
                  <p className="text-[11px] text-[#5B6B60] italic">
                    Tidak ada pertanyaan terbuka untuk peserta yang Anda pilih saat ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendeeQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Untuk: {q.person_name}
                            </span>
                            <span className="text-xs font-semibold text-[#19241C] truncate">
                              {q.title}
                            </span>
                          </div>
                          {q.body && (
                            <p className="text-[11px] text-[#5B6B60] truncate">{q.body}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAnswerQuestion(q.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#EFF3ED] hover:bg-[#E2E8E3] text-[#19241C] text-[11px] font-bold transition-colors shrink-0"
                        >
                          ✓ Tandai Terjawab
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Catatan Meeting */}
          <div className="p-6 bg-white border border-[#DFE6DC] rounded-3xl space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B6B60]">
              3. Catatan Diskusi & Kesimpulan
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1">Agenda Utama</label>
              <textarea
                rows={2}
                placeholder="Pokok bahasan yang akan didiskusikan..."
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#162B20]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1">Catatan Diskusi</label>
              <textarea
                rows={4}
                placeholder="Poin-poin penting, argumen, atau data yang dibahas selama meeting..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#162B20]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1">Kesimpulan Akhir</label>
              <textarea
                rows={2}
                placeholder="Keputusan bulat atau intisari rapat..."
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#162B20]"
              />
            </div>
          </div>

          {/* Section 4: Output Item Langsung (PRD 5.4) */}
          <div className="p-6 bg-white border border-[#DFE6DC] rounded-3xl space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#5B6B60]">
                  4. Output Item Langsung (+Action / +Waiting / +Resource)
                </h2>
                <p className="text-[11px] text-[#8A978E] mt-0.5">
                  Item langsung berstatus Open tanpa melalui Inbox, dan otomatis menempel ke meeting ini.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openItemCreator('action')}
                  className="px-3 py-1.5 rounded-xl bg-[#EBF4EE] hover:bg-[#D1E7DD] text-[#1E3B2B] text-xs font-bold border border-[#CBE0D1] transition-colors"
                >
                  + Action
                </button>
                <button
                  type="button"
                  onClick={() => openItemCreator('waiting')}
                  className="px-3 py-1.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-xs font-bold border border-[#FDE68A] transition-colors"
                >
                  + Waiting
                </button>
                <button
                  type="button"
                  onClick={() => openItemCreator('resource')}
                  className="px-3 py-1.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] text-xs font-bold border border-[#BAE6FD] transition-colors"
                >
                  + Resource
                </button>
              </div>
            </div>

            {/* Inline Mini-Form Item Creator */}
            {activeItemType && (
              <div className="p-4 rounded-2xl bg-[#F6F8F5] border-2 border-[#162B20] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#162B20]">
                      Tambah {activeItemType.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#8A978E]">
                      (Akan langsung berstatus Open)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveItemType(null)}
                    className="text-xs text-[#8A978E] hover:text-[#19241C]"
                  >
                    ✕ Batal
                  </button>
                </div>

                {/* Subtype Selector Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {SUBTYPES_BY_TYPE[activeItemType].map((sub) => (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() => setItemSubtype(sub.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        itemSubtype === sub.key
                          ? 'bg-[#162B20] text-white shadow-xs'
                          : 'bg-white text-[#5B6B60] border border-[#DFE6DC]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Item Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Ketik judul item pekerjaan..."
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] placeholder-[#9CA3AF] focus:outline-none focus:border-[#162B20]"
                  />
                </div>

                {/* Person Select (Wajib untuk Waiting atau Question) */}
                {(activeItemType === 'waiting' || itemSubtype === 'question') && (
                  <div>
                    <PersonSelect
                      people={people}
                      selectedPersonId={itemPersonId}
                      onSelectPerson={setItemPersonId}
                      required={true}
                      label="Penanggung Jawab (Wajib)"
                      onPersonCreated={(p) => setPeople((prev) => [...prev, p])}
                    />
                  </div>
                )}

                {/* Due Date & Body */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#5B6B60] mb-1">
                      Target Selesai (Due Date - Opsional)
                    </label>
                    <input
                      type="date"
                      value={itemDueDate}
                      onChange={(e) => setItemDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#5B6B60] mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Detail ringkas..."
                      value={itemBody}
                      onChange={(e) => setItemBody(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddStagedItem}
                    disabled={!itemTitle.trim()}
                    className="px-4 py-2 rounded-xl bg-[#162B20] text-white font-bold text-xs hover:bg-[#1E3B2B] transition-colors disabled:opacity-50"
                  >
                    + Masukkan ke Output Meeting
                  </button>
                </div>
              </div>
            )}

            {/* Staged Items List */}
            {stagedItems.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#EFF3ED] text-center text-xs text-[#8A978E] italic">
                Belum ada item output yang ditambahkan. Gunakan tombol +Action / +Waiting / +Resource di atas.
              </div>
            ) : (
              <div className="space-y-2">
                {stagedItems.map((it) => (
                  <div
                    key={it.tempId}
                    className="p-3 bg-[#EFF3ED] border border-[#DFE6DC] rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                          it.type === 'action'
                            ? 'bg-[#EBF4EE] text-[#1E3B2B] border border-[#CBE0D1]'
                            : it.type === 'waiting'
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            : 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
                        }`}
                      >
                        {it.type}
                      </span>
                      <span className="text-xs font-semibold text-[#19241C] truncate">
                        {it.title}
                      </span>
                      {it.person_name && (
                        <span className="text-[10px] text-[#5B6B60] font-mono">
                          👤 {it.person_name}
                        </span>
                      )}
                      {it.due_date && (
                        <span className="text-[10px] text-[#8A978E] font-mono">
                          📅 {it.due_date}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStagedItem(it.tempId)}
                      className="text-[#8A978E] hover:text-red-600 text-xs px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/meetings"
              className="px-4 py-2.5 rounded-xl bg-white border border-[#DFE6DC] text-[#5B6B60] hover:text-[#19241C] text-xs font-semibold transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#162B20] hover:bg-[#1E3B2B] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <span>💾</span>
              <span>
                {saving
                  ? 'Menyimpan...'
                  : `Simpan Catatan & ${stagedItems.length} Output Item`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
