'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface MeetingAttendee {
  id: string;
  name: string;
  role: string | null;
}

export interface MeetingListItem {
  id: string;
  title: string;
  meeting_date: string;
  area_id: string | null;
  project_id: string | null;
  area_name: string | null;
  project_name: string | null;
  agenda: string | null;
  notes: string | null;
  conclusion: string | null;
  attendees: MeetingAttendee[];
  itemCounts: {
    total: number;
    action: number;
    waiting: number;
    resource: number;
  };
}

export interface AttendeeQuestion {
  id: string;
  title: string;
  body: string | null;
  person_id: string;
  person_name: string;
  created_at: string;
  waiting_since: string | null;
}

export interface MeetingDetailItem {
  id: string;
  title: string;
  body: string | null;
  type: 'action' | 'waiting' | 'resource';
  subtype: string | null;
  status: 'open' | 'done';
  person_id: string | null;
  person_name: string | null;
  due_date: string | null;
  waiting_since: string | null;
  created_at: string;
}

export interface MeetingDetail {
  id: string;
  title: string;
  meeting_date: string;
  area_id: string | null;
  project_id: string | null;
  area_name: string | null;
  project_name: string | null;
  agenda: string | null;
  notes: string | null;
  conclusion: string | null;
  attendees: MeetingAttendee[];
  derivedItems: MeetingDetailItem[];
}

// 1. Ambil daftar meeting dengan filter
export async function getMeetings(filter: 'all' | 'today' | 'this_week' = 'all'): Promise<MeetingListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from('meetings')
    .select(`
      id, title, meeting_date, area_id, project_id, agenda, notes, conclusion,
      areas(id, name),
      projects(id, name),
      meeting_attendees(
        people(id, name, role)
      ),
      items(id, type)
    `)
    .order('meeting_date', { ascending: false })
    .order('created_at', { ascending: false });

  const todayStr = new Date().toISOString().split('T')[0];

  if (filter === 'today') {
    query = query.eq('meeting_date', todayStr);
  } else if (filter === 'this_week') {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    query = query
      .gte('meeting_date', startOfWeek.toISOString().split('T')[0])
      .lte('meeting_date', endOfWeek.toISOString().split('T')[0]);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }

  return (data || []).map((m: Record<string, unknown>) => {
    const area = m.areas as unknown as { id: string; name: string } | null;
    const project = m.projects as unknown as { id: string; name: string } | null;
    const maList = (m.meeting_attendees as unknown as Array<{ people: { id: string; name: string; role: string | null } | null }>) || [];
    const rawItems = (m.items as unknown as Array<{ id: string; type: string }>) || [];

    const attendees: MeetingAttendee[] = maList
      .filter((ma) => ma.people)
      .map((ma) => ({
        id: ma.people!.id,
        name: ma.people!.name,
        role: ma.people!.role,
      }));

    let action = 0;
    let waiting = 0;
    let resource = 0;

    rawItems.forEach((it) => {
      if (it.type === 'action') action++;
      else if (it.type === 'waiting') waiting++;
      else if (it.type === 'resource') resource++;
    });

    return {
      id: m.id as string,
      title: m.title as string,
      meeting_date: m.meeting_date as string,
      area_id: (m.area_id as string) || null,
      project_id: (m.project_id as string) || null,
      area_name: area?.name || null,
      project_name: project?.name || null,
      agenda: (m.agenda as string) || null,
      notes: (m.notes as string) || null,
      conclusion: (m.conclusion as string) || null,
      attendees,
      itemCounts: {
        total: rawItems.length,
        action,
        waiting,
        resource,
      },
    };
  });
}

// 2. Ambil master data untuk form meeting
export async function getMeetingFormData() {
  const supabase = await createClient();

  const [areasRes, projectsRes, peopleRes] = await Promise.all([
    supabase.from('areas').select('id, name, is_default').is('archived_at', null).order('name'),
    supabase.from('projects').select('id, name, area_id, status').is('archived_at', null).order('name'),
    supabase.from('people').select('id, name, role').order('name'),
  ]);

  return {
    areas: areasRes.data || [],
    projects: projectsRes.data || [],
    people: peopleRes.data || [],
  };
}

// 3. Ambil daftar question terbuka milik peserta untuk bahan agenda
export async function getQuestionsForAttendees(personIds: string[]): Promise<AttendeeQuestion[]> {
  if (!personIds || personIds.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('items')
    .select(`
      id, title, body, person_id, created_at, waiting_since,
      people(id, name)
    `)
    .eq('status', 'open')
    .eq('subtype', 'question')
    .in('person_id', personIds)
    .is('archived_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching questions for attendees:', error);
    return [];
  }

  return (data || []).map((it: Record<string, unknown>) => {
    const person = it.people as { id: string; name: string } | null;
    return {
      id: it.id as string,
      title: it.title as string,
      body: (it.body as string) || null,
      person_id: it.person_id as string,
      person_name: person?.name || 'Kontak',
      created_at: it.created_at as string,
      waiting_since: (it.waiting_since as string) || null,
    };
  });
}

// 4. Buat meeting baru beserta relasi attendees
export async function createMeeting(data: {
  title: string;
  meeting_date: string;
  area_id?: string | null;
  project_id?: string | null;
  attendee_ids: string[];
  agenda?: string;
  notes?: string;
  conclusion?: string;
}) {
  const supabase = await createClient();

  if (!data.title?.trim()) {
    throw new Error('Judul meeting wajib diisi.');
  }

  if (!data.area_id && !data.project_id) {
    throw new Error('Pilih Area atau Project terkait.');
  }

  // Insert meeting record
  const { data: newMeeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      title: data.title.trim(),
      meeting_date: data.meeting_date,
      area_id: data.area_id || null,
      project_id: data.project_id || null,
      agenda: data.agenda?.trim() || null,
      notes: data.notes?.trim() || null,
      conclusion: data.conclusion?.trim() || null,
    })
    .select('id')
    .single();

  if (meetingError || !newMeeting) {
    throw new Error(`Gagal membuat meeting: ${meetingError?.message || 'Error tidak diketahui'}`);
  }

  // Insert attendees if provided
  if (data.attendee_ids && data.attendee_ids.length > 0) {
    const attendeesRows = data.attendee_ids.map((pId) => ({
      meeting_id: newMeeting.id,
      person_id: pId,
    }));

    const { error: attError } = await supabase
      .from('meeting_attendees')
      .insert(attendeesRows);

    if (attError) {
      console.error('Error inserting meeting attendees:', attError);
    }
  }

  revalidatePath('/meetings');
  revalidatePath('/');
  return newMeeting.id;
}

// 5. Ambil detail lengkap meeting
export async function getMeetingDetail(id: string): Promise<MeetingDetail | null> {
  const supabase = await createClient();

  const { data: m, error } = await supabase
    .from('meetings')
    .select(`
      id, title, meeting_date, area_id, project_id, agenda, notes, conclusion,
      areas(id, name),
      projects(id, name),
      meeting_attendees(
        people(id, name, role)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !m) {
    console.error('Error fetching meeting detail:', error);
    return null;
  }

  // Ambil item yang lahir dari meeting ini
  const { data: itemsData } = await supabase
    .from('items')
    .select(`
      id, title, body, type, subtype, status, person_id, due_date, waiting_since, created_at,
      people(name)
    `)
    .eq('source_meeting_id', id)
    .is('archived_at', null)
    .order('created_at', { ascending: true });

  const area = m.areas as unknown as { id: string; name: string } | null;
  const project = m.projects as unknown as { id: string; name: string } | null;
  const maList = (m.meeting_attendees as unknown as Array<{ people: { id: string; name: string; role: string | null } | null }>) || [];

  const attendees: MeetingAttendee[] = maList
    .filter((ma) => ma.people)
    .map((ma) => ({
      id: ma.people!.id,
      name: ma.people!.name,
      role: ma.people!.role,
    }));

  const derivedItems: MeetingDetailItem[] = (itemsData || []).map((it: Record<string, unknown>) => {
    const person = it.people as { name: string } | null;
    return {
      id: it.id as string,
      title: it.title as string,
      body: (it.body as string) || null,
      type: it.type as 'action' | 'waiting' | 'resource',
      subtype: (it.subtype as string) || null,
      status: it.status as 'open' | 'done',
      person_id: (it.person_id as string) || null,
      person_name: person?.name || null,
      due_date: (it.due_date as string) || null,
      waiting_since: (it.waiting_since as string) || null,
      created_at: it.created_at as string,
    };
  });

  return {
    id: m.id as string,
    title: m.title as string,
    meeting_date: m.meeting_date as string,
    area_id: (m.area_id as string) || null,
    project_id: (m.project_id as string) || null,
    area_name: area?.name || null,
    project_name: project?.name || null,
    agenda: (m.agenda as string) || null,
    notes: (m.notes as string) || null,
    conclusion: (m.conclusion as string) || null,
    attendees,
    derivedItems,
  };
}

// 6. Update catatan meeting
export async function updateMeeting(
  id: string,
  data: {
    title: string;
    meeting_date: string;
    area_id?: string | null;
    project_id?: string | null;
    attendee_ids: string[];
    agenda?: string;
    notes?: string;
    conclusion?: string;
  }
) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from('meetings')
    .update({
      title: data.title.trim(),
      meeting_date: data.meeting_date,
      area_id: data.area_id || null,
      project_id: data.project_id || null,
      agenda: data.agenda?.trim() || null,
      notes: data.notes?.trim() || null,
      conclusion: data.conclusion?.trim() || null,
    })
    .eq('id', id);

  if (updateError) {
    throw new Error(`Gagal memperbarui meeting: ${updateError.message}`);
  }

  // Sync attendees
  await supabase.from('meeting_attendees').delete().eq('meeting_id', id);

  if (data.attendee_ids && data.attendee_ids.length > 0) {
    const attendeesRows = data.attendee_ids.map((pId) => ({
      meeting_id: id,
      person_id: pId,
    }));
    await supabase.from('meeting_attendees').insert(attendeesRows);
  }

  revalidatePath(`/meetings/${id}`);
  revalidatePath('/meetings');
  revalidatePath('/');
}

// 7. Hapus meeting
export async function deleteMeeting(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('meetings').delete().eq('id', id);
  if (error) {
    throw new Error(`Gagal menghapus meeting: ${error.message}`);
  }

  revalidatePath('/meetings');
  revalidatePath('/');
}

// 8. Buat Open Item inline langsung dari meeting (PRD 5.4)
export async function createInlineMeetingItem(data: {
  meeting_id: string;
  title: string;
  type: 'action' | 'waiting' | 'resource';
  subtype: string;
  area_id?: string | null;
  project_id?: string | null;
  person_id?: string | null;
  due_date?: string | null;
  body?: string | null;
}) {
  const supabase = await createClient();

  if (!data.title?.trim()) {
    throw new Error('Judul item wajib diisi.');
  }

  // Validasi aturan PRD: jika waiting atau question, person_id wajib
  if ((data.type === 'waiting' || data.subtype === 'question') && !data.person_id) {
    throw new Error('Penanggung jawab (Orang) wajib dipilih untuk item Waiting atau Pertanyaan.');
  }

  // Tipe WAITING otomatis mengisi waiting_since dengan tanggal hari ini
  const waitingSince = data.type === 'waiting' ? new Date().toISOString().split('T')[0] : null;

  const { data: newItem, error } = await supabase
    .from('items')
    .insert({
      title: data.title.trim(),
      body: data.body?.trim() || null,
      type: data.type,
      subtype: data.subtype || null,
      status: 'open', // Langsung open, tidak melalui inbox
      area_id: data.area_id || null,
      project_id: data.project_id || null,
      person_id: data.person_id || null,
      source_meeting_id: data.meeting_id,
      due_date: data.due_date || null,
      waiting_since: waitingSince,
    })
    .select('id, title, type, subtype')
    .single();

  if (error || !newItem) {
    throw new Error(`Gagal membuat item: ${error?.message || 'Error tidak diketahui'}`);
  }

  revalidatePath(`/meetings/${data.meeting_id}`);
  revalidatePath('/items');
  revalidatePath('/');
  return newItem;
}

// 9. Tandai pertanyaan peserta terjawab (PRD 5.6)
export async function markQuestionAnswered(questionId: string, answer?: string) {
  const supabase = await createClient();

  const updatePayload: { status: string; done_at: string; updated_at: string; answer?: string } = {
    status: 'done',
    done_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (answer?.trim()) {
    updatePayload.answer = answer.trim();
  }

  const { error } = await supabase
    .from('items')
    .update(updatePayload)
    .eq('id', questionId);

  if (error) {
    throw new Error(`Gagal menandai pertanyaan terjawab: ${error.message}`);
  }

  revalidatePath('/meetings');
  revalidatePath('/items');
  revalidatePath('/');
}

// 10. Toggle status item meeting
export async function toggleMeetingItemStatus(itemId: string, currentStatus: 'open' | 'done', meetingId?: string) {
  const supabase = await createClient();

  const newStatus = currentStatus === 'open' ? 'done' : 'open';
  const { error } = await supabase
    .from('items')
    .update({
      status: newStatus,
      done_at: newStatus === 'done' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  if (error) {
    throw new Error(`Gagal memperbarui status item: ${error.message}`);
  }

  if (meetingId) {
    revalidatePath(`/meetings/${meetingId}`);
  }
  revalidatePath('/items');
  revalidatePath('/');
}
