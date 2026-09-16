-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Skema database lengkap Second Brain PKM sesuai PRD Bagian 4
--              Mencakup user_id, RLS, constraint integritas, dan Top 5 snapshot
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('active', 'done', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_type AS ENUM ('inbox', 'action', 'waiting', 'resource');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_subtype AS ENUM (
        'task', 'commitment', 'issue', 'question',
        'waiting_for', 'blocker', 'follow_up',
        'reference', 'decision'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('open', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_relation_type AS ENUM ('derived_from', 'related_to');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- 3.1 Tabel: areas
CREATE TABLE IF NOT EXISTS areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Tabel: projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    status project_status NOT NULL DEFAULT 'active',
    archived_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Tabel: people
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    name TEXT NOT NULL,
    role TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 Tabel: meetings
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    meeting_date DATE NOT NULL,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    agenda TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    conclusion TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_meeting_parent CHECK (area_id IS NOT NULL OR project_id IS NOT NULL)
);

-- 3.5 Tabel: meeting_attendees
CREATE TABLE IF NOT EXISTS meeting_attendees (
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    user_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (meeting_id, person_id)
);

-- 3.6 Tabel: items
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    body TEXT DEFAULT NULL,
    type item_type NOT NULL DEFAULT 'inbox',
    subtype item_subtype DEFAULT NULL,
    status item_status NOT NULL DEFAULT 'open',
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    source_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    due_date DATE DEFAULT NULL,
    waiting_since DATE DEFAULT NULL,
    answer TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    done_at TIMESTAMPTZ DEFAULT NULL,
    archived_at TIMESTAMPTZ DEFAULT NULL,
    -- Constraints PRD & Panduan Implementasi
    CONSTRAINT must_have_context CHECK (type = 'inbox' OR area_id IS NOT NULL),
    CONSTRAINT person_required CHECK (
        ((type = 'waiting' OR subtype = 'question') AND person_id IS NOT NULL)
        OR (type != 'waiting' AND subtype IS DISTINCT FROM 'question')
    )
);

-- 3.7 Tabel: item_relations
CREATE TABLE IF NOT EXISTS item_relations (
    from_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    to_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    relation_type item_relation_type NOT NULL,
    user_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (from_item_id, to_item_id, relation_type),
    CONSTRAINT check_no_self_relation CHECK (from_item_id <> to_item_id)
);

-- 3.8 Tabel: daily_snapshots (Top 5: Today's Winning)
CREATE TABLE IF NOT EXISTS daily_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    date DATE NOT NULL UNIQUE,
    item_ids UUID[] NOT NULL DEFAULT '{}',
    completed_item_ids UUID[] NOT NULL DEFAULT '{}',
    morning_review_completed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_max_top_items CHECK (cardinality(item_ids) <= 5)
);

-- 4. TRIGGERS & FUNCTIONS

-- 4.1 Update updated_at otomatis pada tabel items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_items_updated_at ON items;
CREATE TRIGGER trg_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Mencegah penghapusan Area default (Uncategorized)
CREATE OR REPLACE FUNCTION prevent_default_area_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_default = true THEN
        RAISE EXCEPTION 'Area default "Uncategorized" tidak dapat dihapus.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_default_area ON areas;
CREATE TRIGGER trg_protect_default_area
    BEFORE DELETE ON areas
    FOR EACH ROW
    EXECUTE FUNCTION prevent_default_area_deletion();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy Single-User: Mengizinkan akses pemilik berdasar user_id
DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY['areas', 'projects', 'people', 'meetings', 'meeting_attendees', 'items', 'item_relations', 'daily_snapshots'];
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

-- 6. SEED DATA AWAL
-- Inisialisasi Area default "Uncategorized"
INSERT INTO areas (name, is_default)
SELECT 'Uncategorized', true
WHERE NOT EXISTS (
    SELECT 1 FROM areas WHERE name = 'Uncategorized' AND is_default = true
);
