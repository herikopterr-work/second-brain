import { createClient } from '@/lib/supabase/client';
import { getPendingItems, deletePendingItem, getPendingCount, type PendingItem } from './db';

export const SYNC_EVENT_NAME = 'second_brain_sync_updated';

export function notifySyncUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
  }
}

let isSyncing = false;

export async function syncPendingItems(): Promise<{ success: number; failed: number }> {
  if (typeof window === 'undefined') return { success: 0, failed: 0 };
  if (!navigator.onLine) return { success: 0, failed: 0 };
  if (isSyncing) return { success: 0, failed: 0 };

  isSyncing = true;
  notifySyncUpdate();

  let success = 0;
  let failed = 0;

  try {
    const pendingItems = await getPendingItems();
    if (pendingItems.length === 0) {
      isSyncing = false;
      notifySyncUpdate();
      return { success: 0, failed: 0 };
    }

    const supabase = createClient();

    for (const item of pendingItems) {
      try {
        const { error } = await supabase.from('items').upsert(
          {
            id: item.id,
            title: item.title,
            body: item.body || null,
            type: 'inbox',
            status: 'open',
            created_at: item.created_at,
          },
          { onConflict: 'id' }
        );

        if (error) {
          failed++;
          console.error('Gagal sinkronisasi item:', item.id, error);
        } else {
          await deletePendingItem(item.id);
          success++;
        }
      } catch (err) {
        failed++;
        console.error('Error jaringan saat sinkronisasi:', err);
      }
    }
  } catch (err) {
    console.error('Gagal mengakses IndexedDB saat sinkronisasi:', err);
  } finally {
    isSyncing = false;
    notifySyncUpdate();
  }

  return { success, failed };
}

export function isCurrentlySyncing(): boolean {
  return isSyncing;
}

// Inisialisasi listener global otomatis untuk sinkronisasi
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingItems();
  });

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      syncPendingItems();
    }
  });
}
