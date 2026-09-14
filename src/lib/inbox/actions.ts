'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface InboxItem {
  id: string;
  title: string;
  body: string | null;
  type: string;
  created_at: string;
}

export interface Area {
  id: string;
  name: string;
  is_default: boolean;
}

export interface Project {
  id: string;
  name: string;
  area_id: string;
  status: string;
}

export interface Person {
  id: string;
  name: string;
  role: string | null;
}

export interface ClarifyPayload {
  itemId: string;
  type: 'action' | 'waiting' | 'resource';
  subtype: string;
  areaId: string;
  projectId?: string | null;
  personId?: string | null;
  waitingSince?: string | null;
}

export async function getInboxData() {
  const supabase = await createClient();

  // 1. Ambil seluruh item inbox aktif
  const { data: inboxItems, error: itemsError } = await supabase
    .from('items')
    .select('id, title, body, type, created_at')
    .eq('type', 'inbox')
    .eq('status', 'open')
    .is('archived_at', null)
    .order('created_at', { ascending: true });

  if (itemsError) {
    console.error('Error fetching inbox items:', itemsError);
  }

  // 2. Ambil master data Areas
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, is_default')
    .is('archived_at', null)
    .order('name', { ascending: true });

  // 3. Ambil master data Projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, area_id, status')
    .eq('status', 'active')
    .is('archived_at', null)
    .order('name', { ascending: true });

  // 4. Ambil master data People
  const { data: people } = await supabase
    .from('people')
    .select('id, name, role')
    .order('name', { ascending: true });

  // 5. Cek jumlah item di Area Uncategorized untuk trigger peringatan (> 10 item)
  let uncategorizedCount = 0;
  const uncategorizedArea = areas?.find((a) => a.is_default);
  if (uncategorizedArea) {
    const { count } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('area_id', uncategorizedArea.id)
      .eq('status', 'open')
      .is('archived_at', null);

    uncategorizedCount = count || 0;
  }

  return {
    inboxItems: (inboxItems as InboxItem[]) || [],
    areas: (areas as Area[]) || [],
    projects: (projects as Project[]) || [],
    people: (people as Person[]) || [],
    uncategorizedCount,
  };
}

export async function clarifyItem(payload: ClarifyPayload) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    type: payload.type,
    subtype: payload.subtype,
    area_id: payload.areaId,
    project_id: payload.projectId || null,
    person_id: payload.personId || null,
    waiting_since: payload.type === 'waiting' ? (payload.waitingSince || new Date().toISOString().split('T')[0]) : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('items')
    .update(updateData)
    .eq('id', payload.itemId);

  if (error) {
    throw new Error(`Gagal clarify item: ${error.message}`);
  }

  revalidatePath('/inbox');
  revalidatePath('/');
  return { success: true };
}

export async function createPersonInline(name: string, role?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('people')
    .insert({ name: name.trim(), role: role?.trim() || null })
    .select('id, name, role')
    .single();

  if (error) {
    throw new Error(`Gagal membuat person: ${error.message}`);
  }

  return data as Person;
}

export async function createAreaInline(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('areas')
    .insert({ name: name.trim(), is_default: false })
    .select('id, name, is_default')
    .single();

  if (error) {
    throw new Error(`Gagal membuat area: ${error.message}`);
  }

  return data as Area;
}

export async function createProjectInline(name: string, areaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert({ name: name.trim(), area_id: areaId, status: 'active' })
    .select('id, name, area_id, status')
    .single();

  if (error) {
    throw new Error(`Gagal membuat project: ${error.message}`);
  }

  return data as Project;
}
