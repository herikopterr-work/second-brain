-- ==============================================================================
-- Migration: 002_foundation_and_constraints.sql
-- Description: Penyelarasan fondasi database:
--              1. Menambahkan kolom user_id & RLS policy berbasis kepemilikan
--              2. Constraint integritas data (must_have_context, person_required)
--              3. Pembaruan kapasitas daily_snapshots menjadi maksimal 5 item (Top 5)
-- ==============================================================================

-- 1. TAMBAHKAN KOLOM user_id KE SEMUA TABEL DENGAN DEFAULT auth.uid()
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'areas', 'projects', 'people', 'meetings', 
        'meeting_attendees', 'items', 'item_relations', 'daily_snapshots'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format(
            'ALTER TABLE %I ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();',
            tbl
        );
    END LOOP;
END $$;

-- 2. PERBARUI ROW LEVEL SECURITY (RLS) POLICIES
-- Kebijakan akses: hanya pemilik (auth.uid() = user_id) atau fallback jika auth.uid() null (misal saat setup/script)
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'areas', 'projects', 'people', 'meetings', 
        'meeting_attendees', 'items', 'item_relations', 'daily_snapshots'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Owner full access policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "owner only" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Owner access policy" ON %I;', tbl);
        
        EXECUTE format(
            'CREATE POLICY "Owner access policy" ON %I FOR ALL USING (
                auth.uid() = user_id OR auth.uid() IS NULL
            ) WITH CHECK (
                auth.uid() = user_id OR auth.uid() IS NULL
            );',
            tbl
        );
    END LOOP;
END $$;

-- 3. CONSTRAINT INTEGRITAS DATA PADA TABEL items
-- 3.1 Item wajib punya area_id kecuali jika tipe = 'inbox'
ALTER TABLE items DROP CONSTRAINT IF EXISTS must_have_context;
ALTER TABLE items ADD CONSTRAINT must_have_context
    CHECK (type = 'inbox' OR area_id IS NOT NULL);

-- 3.2 Person wajib diisi jika tipe = 'waiting' atau sub-tipe = 'question'
ALTER TABLE items DROP CONSTRAINT IF EXISTS person_required;
ALTER TABLE items ADD CONSTRAINT person_required
    CHECK (
        ((type = 'waiting' OR subtype = 'question') AND person_id IS NOT NULL)
        OR (type != 'waiting' AND subtype IS DISTINCT FROM 'question')
    );

-- 4. PENYESUAIAN daily_snapshots: KAPASITAS MAKSIMAL 5 ITEM (TOP 5)
ALTER TABLE daily_snapshots DROP CONSTRAINT IF EXISTS check_max_top_items;
ALTER TABLE daily_snapshots ADD CONSTRAINT check_max_top_items
    CHECK (cardinality(item_ids) <= 5);
