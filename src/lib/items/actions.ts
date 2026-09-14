'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface DetailedItem {
  id: string;
  title: string;
  body: string | null;
  type: 'action' | 'waiting' | 'resource';
  subtype: string | null;
  status: 'open' | 'done';
  area_id: string | null;
  area_name?: string | null;
  project_id: string | null;
  project_name?: string | null;
  person_id: string | null;
  person_name?: string | null;
  person_role?: string | null;
  due_date: string | null;
  waiting_since: string | null;
  answer: string | null;
  created_at: string;
  updated_at: string;
  done_at: string | null;
}

export async function getOpenItemsData() {
  const supabase = await createClient();

  // 1. Ambil seluruh open items (selain inbox)
  const { data: items, error } = await supabase
    .from('items')
    .select(`
      id, title, body, type, subtype, status,
      area_id, project_id, person_id,
      due_date, waiting_since, answer,
      created_at, updated_at, done_at,
      areas(id, name),
      projects(id, name),
      people(id, name, role)
    `)
    .in('type', ['action', 'waiting', 'resource'])
    .eq('status', 'open')
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching open items:', error);
  }

  // 2. Ambil master data untuk filter
  const { data: areas } = await supabase.from('areas').select('id, name, is_default').is('archived_at', null).order('name');
  const { data: projects } = await supabase.from('projects').select('id, name, area_id').eq('status', 'active').is('archived_at', null).order('name');
  const { data: people } = await supabase.from('people').select('id, name, role').order('name');

  // 3. Cek jumlah item di Area Uncategorized (> 10 item)
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

  const formattedItems: DetailedItem[] = (items || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    type: item.type,
    subtype: item.subtype,
    status: item.status,
    area_id: item.area_id,
    area_name: item.areas?.name || null,
    project_id: item.project_id,
    project_name: item.projects?.name || null,
    person_id: item.person_id,
    person_name: item.people?.name || null,
    person_role: item.people?.role || null,
    due_date: item.due_date,
    waiting_since: item.waiting_since,
    answer: item.answer,
    created_at: item.created_at,
    updated_at: item.updated_at,
    done_at: item.done_at,
  }));

  return {
    items: formattedItems,
    areas: areas || [],
    projects: projects || [],
    people: people || [],
    uncategorizedCount,
  };
}

export async function markItemDone(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('items')
    .update({
      status: 'done',
      done_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(`Gagal menandai selesai: ${error.message}`);
  revalidatePath('/items');
  revalidatePath('/');
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('items').delete().eq('id', id);

  if (error) throw new Error(`Gagal menghapus item: ${error.message}`);
  revalidatePath('/items');
}
