'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import PersonSelect, { type PersonOption } from '@/components/PersonSelect';
import {
  getMeetingDetail,
  getMeetingFormData,
  updateMeeting,
  deleteMeeting,
  createInlineMeetingItem,
  toggleMeetingItemStatus,
  type MeetingDetail,
} from '@/lib/meetings/actions';

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

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Master Data for Edit
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; area_id: string }[]>([]);
  const [people, setPeople] = useState<PersonOption[]>([]);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editAttendeeIds, setEditAttendeeIds] = useState<string[]>([]);
  const [editAgenda, setEditAgenda] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editConclusion, setEditConclusion] = useState('');

  // Inline Item Creator (+Action / +Waiting / +Resource)
  const [activeItemType, setActiveItemType] = useState<'action' | 'waiting' | 'resource' | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemSubtype, setItemSubtype] = useState('');
  const [itemPersonId, setItemPersonId] = useState('');
  const [itemDueDate, setItemDueDate] = useState('');
  const [itemBody, setItemBody] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [detail, formData] = await Promise.all([
        getMeetingDetail(id),
        getMeetingFormData(),
      ]);

      if (!detail) {
        alert('Catatan meeting tidak ditemukan.');
        router.push('/meetings');
        return;
      }

      setMeeting(detail);
      setAreas(formData.areas);
      setProjects(formData.projects);
      setPeople(formData.people);

      // Populate edit state
      setEditTitle(detail.title);
      setEditDate(detail.meeting_date);
      setEditTarget(
        detail.project_id ? `proj:${detail.project_id}` : detail.area_id ? `area:${detail.area_id}` : ''
      );
      setEditAttendeeIds(detail.attendees.map((a) => a.id));
      setEditAgenda(detail.agenda || '');
      setEditNotes(detail.notes || '');
      setEditConclusion(detail.conclusion || '');
    } catch (err) {
      console.error('Gagal memuat detail meeting:', err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle Done for derived items
  const handleToggleItem = async (itemId: string, currentStatus: 'open' | 'done') => {
    if (!meeting) return;

    // Optimistic UI update
    const updatedStatus = currentStatus === 'open' ? 'done' : 'open';
    setMeeting({
      ...meeting,
      derivedItems: meeting.derivedItems.map((it) =>
        it.id === itemId ? { ...it, status: updatedStatus } : it
      ),
    });

    try {
      await toggleMeetingItemStatus(itemId, currentStatus, meeting.id);
    } catch (err) {
      alert(`Gagal memperbarui status: ${err instanceof Error ? err.message : 'Error'}`);
      await loadData();
    }
  };

  // Submit Edit Meeting
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editTarget || savingEdit || !meeting) return;

    setSavingEdit(true);
    try {
      const area_id = editTarget.startsWith('area:') ? editTarget.replace('area:', '') : null;
      const project_id = editTarget.startsWith('proj:') ? editTarget.replace('proj:', '') : null;

      await updateMeeting(meeting.id, {
        title: editTitle.trim(),
        meeting_date: editDate,
        area_id,
        project_id,
        attendee_ids: editAttendeeIds,
        agenda: editAgenda.trim() || undefined,
        notes: editNotes.trim() || undefined,
        conclusion: editConclusion.trim() || undefined,
      });

      setIsEditing(false);
      await loadData();
    } catch (err) {
      alert(`Gagal memperbarui meeting: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // Hapus Meeting
  const handleDeleteMeeting = async () => {
    if (!meeting) return;
    if (!confirm(`Hapus catatan meeting "${meeting.title}"?`)) return;

    try {
      await deleteMeeting(meeting.id);
      router.push('/meetings');
    } catch (err) {
      alert(`Gagal menghapus meeting: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Open inline item creator
  const openItemCreator = (type: 'action' | 'waiting' | 'resource') => {
    setActiveItemType(type);
    setItemTitle('');
    setItemSubtype(SUBTYPES_BY_TYPE[type][0].key);
    setItemPersonId('');
    setItemDueDate('');
    setItemBody('');
  };

  // Submit new inline item directly
  const handleCreateInlineItem = async () => {
    if (!itemTitle.trim() || !activeItemType || !meeting) return;

    if ((activeItemType === 'waiting' || itemSubtype === 'question') && !itemPersonId) {
      alert('Orang (Person) wajib dipilih untuk item Waiting atau Pertanyaan.');
      return;
    }

    setAddingItem(true);
    try {
      await createInlineMeetingItem({
        meeting_id: meeting.id,
        title: itemTitle.trim(),
        type: activeItemType,
        subtype: itemSubtype,
        area_id: meeting.area_id,
        project_id: meeting.project_id,
        person_id: itemPersonId || undefined,
        due_date: itemDueDate || undefined,
        body: itemBody.trim() || undefined,
      });

      setActiveItemType(null);
      await loadData();
    } catch (err) {
      alert(`Gagal membuat item: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setAddingItem(false);
    }
  };

  if (loading || !meeting) {
    return (
      <AppShell maxContentWidth="max-w-4xl">
        <div className="p-6 text-center text-xs text-[#5B6B60]">
          Memuat catatan meeting...
        </div>
      </AppShell>
    );
  }

  const meetingDateObj = new Date(meeting.meeting_date);

  return (
    <AppShell maxContentWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DFE6DC]">
          <Link
            href="/meetings"
            className="text-xs text-[#5B6B60] hover:text-[#19241C] flex items-center gap-1 font-medium transition-colors"
          >
            <span>←</span>
            <span>Semua Catatan Meeting</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#DFE6DC] text-xs font-bold text-[#19241C] hover:bg-[#F6F8F5] transition-colors flex items-center gap-1"
            >
              <span>{isEditing ? '✕ Batal Edit' : '✏️ Edit Meeting'}</span>
            </button>
            <button
              onClick={handleDeleteMeeting}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#DFE6DC] text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              🗑️ Hapus
            </button>
          </div>
        </div>

        {/* Mode Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="p-6 bg-white border border-[#DFE6DC] rounded-3xl space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#19241C]">Edit Catatan Meeting</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#19241C] mb-1">Judul Meeting</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#19241C] mb-1">Tanggal</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1">Konteks PARA</label>
              <select
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C]"
              >
                <optgroup label="── Area ──">
                  {areas.map((a) => (
                    <option key={`area:${a.id}`} value={`area:${a.id}`}>
                      📁 {a.name}
                    </option>
                  ))}
                </optgroup>
                {projects.length > 0 && (
                  <optgroup label="── Project ──">
                    {projects.map((p) => (
                      <option key={`proj:${p.id}`} value={`proj:${p.id}`}>
                        🎯 {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1">Agenda</label>
              <textarea
                rows={2}
                value={editAgenda}
                onChange={(e) => setEditAgenda(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1">Catatan Diskusi</label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#19241C] mb-1">Kesimpulan</label>
              <textarea
                rows={2}
                value={editConclusion}
                onChange={(e) => setEditConclusion(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-xl text-xs text-[#19241C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[#EFF3ED] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-[#162B20] text-white font-bold text-xs"
              >
                {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        ) : (
          /* Mode View Meeting Note */
          <div className="p-6 sm:p-8 bg-white border border-[#DFE6DC] rounded-3xl space-y-6 shadow-sm">
            {/* Header Details */}
            <div className="space-y-3 pb-6 border-b border-[#EFF3ED]">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#162B20] text-white font-bold font-mono">
                  📅 {meetingDateObj.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>

                {meeting.project_name ? (
                  <span className="px-2.5 py-1 rounded-lg bg-[#EFF3ED] text-[#162B20] border border-[#DFE6DC] font-semibold">
                    🎯 {meeting.project_name}
                  </span>
                ) : meeting.area_name ? (
                  <span className="px-2.5 py-1 rounded-lg bg-[#EFF3ED] text-[#162B20] border border-[#DFE6DC] font-semibold">
                    📁 {meeting.area_name}
                  </span>
                ) : null}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#19241C]">
                {meeting.title}
              </h1>

              {/* Attendees Pills */}
              {meeting.attendees.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-[#8A978E] uppercase tracking-wider">
                    Peserta:
                  </span>
                  {meeting.attendees.map((att) => (
                    <span
                      key={att.id}
                      className="px-2.5 py-1 rounded-lg bg-[#EFF3ED] text-[#19241C] text-xs font-medium border border-[#DFE6DC] flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#2A5C43]" />
                      <span>{att.name}</span>
                      {att.role && <span className="text-[#8A978E]">({att.role})</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Agenda */}
            {meeting.agenda && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B6B60]">
                  Agenda Pembahasan
                </h3>
                <div className="p-4 bg-[#EFF3ED]/50 border border-[#DFE6DC] rounded-2xl text-xs text-[#19241C] whitespace-pre-wrap leading-relaxed">
                  {meeting.agenda}
                </div>
              </div>
            )}

            {/* Notes */}
            {meeting.notes && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B6B60]">
                  Catatan Diskusi
                </h3>
                <div className="p-4 bg-[#EFF3ED]/30 border border-[#DFE6DC] rounded-2xl text-xs text-[#19241C] whitespace-pre-wrap leading-relaxed">
                  {meeting.notes}
                </div>
              </div>
            )}

            {/* Conclusion */}
            {meeting.conclusion && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A5C43]">
                  Kesimpulan & Keputusan Akhir
                </h3>
                <div className="p-4 bg-[#EBF4EE] border border-[#CBE0D1] rounded-2xl text-xs font-medium text-[#1E3B2B] whitespace-pre-wrap leading-relaxed">
                  {meeting.conclusion}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section: Output Item yang Lahir dari Meeting Ini (PRD 5.4) */}
        <div className="p-6 bg-white border border-[#DFE6DC] rounded-3xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFF3ED]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <h2 className="text-sm font-bold text-[#19241C]">
                  Output Item yang Lahir dari Meeting Ini
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EFF3ED] text-[#19241C]">
                  {meeting.derivedItems.length}
                </span>
              </div>
              <p className="text-[11px] text-[#8A978E] mt-0.5">
                Semua item di bawah otomatis tersambung dengan meeting ini dan berstatus Open.
              </p>
            </div>

            {/* Tombol Tambah Cepat Output */}
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

          {/* Inline Creator Form (if opened) */}
          {activeItemType && (
            <div className="p-4 rounded-2xl bg-[#F6F8F5] border-2 border-[#162B20] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#162B20]">
                  Tambah {activeItemType.toUpperCase()} Baru
                </span>
                <button
                  type="button"
                  onClick={() => setActiveItemType(null)}
                  className="text-xs text-[#8A978E] hover:text-[#19241C]"
                >
                  ✕ Batal
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SUBTYPES_BY_TYPE[activeItemType].map((sub) => (
                  <button
                    key={sub.key}
                    type="button"
                    onClick={() => setItemSubtype(sub.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      itemSubtype === sub.key
                        ? 'bg-[#162B20] text-white'
                        : 'bg-white text-[#5B6B60] border border-[#DFE6DC]'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Judul item tugas baru..."
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#DFE6DC] rounded-xl text-xs text-[#19241C] focus:outline-none"
              />

              {(activeItemType === 'waiting' || itemSubtype === 'question') && (
                <PersonSelect
                  people={people}
                  selectedPersonId={itemPersonId}
                  onSelectPerson={setItemPersonId}
                  required={true}
                  label="Penanggung Jawab (Wajib)"
                  onPersonCreated={(p) => setPeople((prev) => [...prev, p])}
                />
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCreateInlineItem}
                  disabled={addingItem || !itemTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#162B20] text-white font-bold text-xs hover:bg-[#1E3B2B] transition-colors disabled:opacity-50"
                >
                  {addingItem ? 'Menambahkan...' : 'Tambah ke Meeting'}
                </button>
              </div>
            </div>
          )}

          {/* List of Derived Items */}
          {meeting.derivedItems.length === 0 ? (
            <div className="p-8 text-center bg-[#EFF3ED]/40 rounded-2xl text-xs text-[#8A978E] italic">
              Belum ada item tugas yang lahir dari meeting ini. Tambahkan sekarang lewat tombol di atas.
            </div>
          ) : (
            <div className="space-y-2.5">
              {meeting.derivedItems.map((item) => {
                const isDone = item.status === 'done';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-[#F6F8F5] border-[#DFE6DC] opacity-60'
                        : 'bg-[#EFF3ED]/60 hover:bg-[#EFF3ED] border-[#DFE6DC]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id, item.status)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          isDone
                            ? 'bg-[#1E3B2B] border-[#1E3B2B] text-white text-[10px]'
                            : 'border-[#8BA888] bg-white hover:border-[#2A5C43]'
                        }`}
                      >
                        {isDone && '✓'}
                      </button>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                              item.type === 'action'
                                ? 'bg-[#EBF4EE] text-[#1E3B2B] border border-[#CBE0D1]'
                                : item.type === 'waiting'
                                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                                : 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
                            }`}
                          >
                            {item.type}
                          </span>

                          {item.subtype && (
                            <span className="px-1.5 py-0.5 rounded bg-white text-[#5B6B60] text-[9px] font-mono border border-[#DFE6DC]">
                              {item.subtype}
                            </span>
                          )}

                          {item.person_name && (
                            <span className="text-[10px] text-[#5B6B60] font-mono">
                              👤 {item.person_name}
                            </span>
                          )}

                          {item.due_date && (
                            <span className="text-[10px] text-[#8A978E] font-mono">
                              📅 {item.due_date}
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-xs font-semibold truncate ${
                            isDone ? 'line-through text-[#8A978E]' : 'text-[#19241C]'
                          }`}
                        >
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/items"
                      className="text-[10px] font-bold text-[#5B6B60] hover:text-[#19241C] shrink-0"
                    >
                      Buka di Open Items →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
