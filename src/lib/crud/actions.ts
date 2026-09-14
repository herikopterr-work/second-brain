'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ==========================================
// 1. AREA ACTIONS
// ==========================================

export interface AreaWithCounts {
  id: string;
  name: string;
  is_default: boolean;
  archived_at: string | null;
  created_at: string;
  project_count: number;
  item_count: number;
}

export async function getAreas(): Promise<AreaWithCounts[]> {
  const supabase = await createClient();

  const { data: areas, error } = await supabase
    .from('areas')
    .select('id, name, is_default, archived_at, created_at')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching areas:', error);
    return [];
  }

  // Ambil hitungan project dan item per area
  const { data: projects } = await supabase.from('projects').select('area_id').is('archived_at', null);
  const { data: items } = await supabase.from('items').select('area_id').is('archived_at', null);

  const projectCounts: Record<string, number> = {};
  const itemCounts: Record<string, number> = {};

  projects?.forEach((p) => {
    projectCounts[p.area_id] = (projectCounts[p.area_id] || 0) + 1;
  });

  items?.forEach((i) => {
    if (i.area_id) {
      itemCounts[i.area_id] = (itemCounts[i.area_id] || 0) + 1;
    }
  });

  return (areas || []).map((a) => ({
    ...a,
    project_count: projectCounts[a.id] || 0,
    item_count: itemCounts[a.id] || 0,
  }));
}

export async function createArea(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('areas')
    .insert({ name: name.trim(), is_default: false })
    .select()
    .single();

  if (error) throw new Error(`Gagal membuat Area: ${error.message}`);
  revalidatePath('/areas');
  revalidatePath('/projects');
  revalidatePath('/inbox');
  return data;
}

export async function updateArea(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('areas')
    .update({ name: name.trim() })
    .eq('id', id);

  if (error) throw new Error(`Gagal memperbarui Area: ${error.message}`);
  revalidatePath('/areas');
  revalidatePath('/projects');
}

export async function deleteArea(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('areas').delete().eq('id', id);

  if (error) throw new Error(`Gagal menghapus Area: ${error.message}`);
  revalidatePath('/areas');
  revalidatePath('/projects');
}

export async function toggleArchiveArea(id: string, archive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('areas')
    .update({ archived_at: archive ? new Date().toISOString() : null })
    .eq('id', id);

  if (error) throw new Error(`Gagal mengubah status arsip Area: ${error.message}`);
  revalidatePath('/areas');
}

// ==========================================
// 2. PROJECT ACTIONS
// ==========================================

export interface ProjectWithDetails {
  id: string;
  name: string;
  area_id: string;
  area_name?: string;
  status: 'active' | 'done' | 'archived';
  archived_at: string | null;
  created_at: string;
  item_count: number;
}

export async function getProjects(): Promise<ProjectWithDetails[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, area_id, status, archived_at, created_at, areas(name)')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  const { data: items } = await supabase.from('items').select('project_id').is('archived_at', null);
  const itemCounts: Record<string, number> = {};
  items?.forEach((i) => {
    if (i.project_id) itemCounts[i.project_id] = (itemCounts[i.project_id] || 0) + 1;
  });

  return (projects || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    area_id: p.area_id,
    area_name: p.areas?.name || 'Uncategorized',
    status: p.status,
    archived_at: p.archived_at,
    created_at: p.created_at,
    item_count: itemCounts[p.id] || 0,
  }));
}

export async function createProject(name: string, areaId: string) {
  if (!areaId) throw new Error('Pemilihan Area wajib diisi.');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert({ name: name.trim(), area_id: areaId, status: 'active' })
    .select()
    .single();

  if (error) throw new Error(`Gagal membuat Project: ${error.message}`);
  revalidatePath('/projects');
  revalidatePath('/inbox');
  return data;
}

export async function updateProject(id: string, name: string, areaId: string, status: 'active' | 'done' | 'archived') {
  if (!areaId) throw new Error('Pemilihan Area wajib diisi.');

  const supabase = await createClient();
  const updatePayload: Record<string, unknown> = {
    name: name.trim(),
    area_id: areaId,
    status,
  };

  if (status === 'archived') {
    updatePayload.archived_at = new Date().toISOString();
  } else {
    updatePayload.archived_at = null;
  }

  const { error } = await supabase
    .from('projects')
    .update(updatePayload)
    .eq('id', id);

  if (error) throw new Error(`Gagal memperbarui Project: ${error.message}`);
  revalidatePath('/projects');
  revalidatePath('/inbox');
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) throw new Error(`Gagal menghapus Project: ${error.message}`);
  revalidatePath('/projects');
}

// ==========================================
// 3. PEOPLE ACTIONS & RELATED ITEMS (PRD 5.3)
// ==========================================

export interface PersonItem {
  id: string;
  title: string;
  type: string;
  subtype: string | null;
  status: string;
  waiting_since: string | null;
  created_at: string;
}

export interface PersonWithItems {
  id: string;
  name: string;
  role: string | null;
  created_at: string;
  questions: PersonItem[];
  waitings: PersonItem[];
}

export async function getPeople(): Promise<PersonWithItems[]> {
  const supabase = await createClient();

  const { data: people, error } = await supabase
    .from('people')
    .select('id, name, role, created_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching people:', error);
    return [];
  }

  // Ambil seluruh question dan waiting items yang terhubung ke person_id
  const { data: items } = await supabase
    .from('items')
    .select('id, title, type, subtype, status, waiting_since, created_at, person_id')
    .not('person_id', 'is', null)
    .eq('status', 'open')
    .is('archived_at', null);

  const questionsByPerson: Record<string, PersonItem[]> = {};
  const waitingsByPerson: Record<string, PersonItem[]> = {};

  items?.forEach((i) => {
    if (!i.person_id) return;
    if (i.subtype === 'question') {
      questionsByPerson[i.person_id] = questionsByPerson[i.person_id] || [];
      questionsByPerson[i.person_id].push(i);
    } else if (i.type === 'waiting') {
      waitingsByPerson[i.person_id] = waitingsByPerson[i.person_id] || [];
      waitingsByPerson[i.person_id].push(i);
    }
  });

  return (people || []).map((p) => ({
    ...p,
    questions: questionsByPerson[p.id] || [],
    waitings: waitingsByPerson[p.id] || [],
  }));
}

export async function createPerson(name: string, role?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('people')
    .insert({ name: name.trim(), role: role?.trim() || null })
    .select()
    .single();

  if (error) throw new Error(`Gagal membuat Person: ${error.message}`);
  revalidatePath('/people');
  revalidatePath('/inbox');
  return data;
}

export async function updatePerson(id: string, name: string, role?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('people')
    .update({ name: name.trim(), role: role?.trim() || null })
    .eq('id', id);

  if (error) throw new Error(`Gagal memperbarui Person: ${error.message}`);
  revalidatePath('/people');
}

export async function deletePerson(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('people').delete().eq('id', id);

  if (error) throw new Error(`Gagal menghapus Person: ${error.message}`);
  revalidatePath('/people');
}
