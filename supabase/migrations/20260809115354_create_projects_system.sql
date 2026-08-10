/*
# Create Talib AI Studio project system (single-tenant, no auth)

1. New Tables
- `projects`: top-level documentary projects with topic, status, progress
- `project_entries`: per-module outputs (script, scenes, images, voice, video, thumbnail, seo, logs, history) stored as JSONB
2. Security
- Single-tenant app with no sign-in screen. RLS enabled, anon+authenticated CRUD allowed (intentionally shared data).
3. Notes
- `project_entries.data` is JSONB so each module can store its own structured output without schema churn.
- `project_entries.entry_type` distinguishes content kind: script, scenes, image_search, selected_images, voice, video, thumbnail, seo, log, upload_history.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Draft',
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS project_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  entry_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_entries" ON project_entries;
CREATE POLICY "anon_select_entries" ON project_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_entries" ON project_entries;
CREATE POLICY "anon_insert_entries" ON project_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_entries" ON project_entries;
CREATE POLICY "anon_update_entries" ON project_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_entries" ON project_entries;
CREATE POLICY "anon_delete_entries" ON project_entries FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_project_entries_project_id ON project_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_entries_type ON project_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);
