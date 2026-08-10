import { create } from "zustand";
import { supabase } from "./supabaseClient";
import type { Project, ProjectEntry, EntryType } from "./types";

interface ProjectStore {
  projects: Project[];
  current: Project | null;
  entries: ProjectEntry[];
  loading: boolean;
  error: string | null;

  loadProjects: () => Promise<void>;
  createProject: (title: string, topic: string) => Promise<Project>;
  selectProject: (id: string) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  loadEntries: (projectId: string) => Promise<void>;
  saveEntry: (projectId: string, type: EntryType, data: Record<string, unknown>) => Promise<void>;
  appendEntry: (projectId: string, type: EntryType, data: Record<string, unknown>) => Promise<void>;
  getEntriesByType: (type: EntryType) => ProjectEntry[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  current: null,
  entries: [],
  loading: false,
  error: null,

  loadProjects: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) { set({ loading: false, error: error.message }); return; }
    set({ projects: data as Project[], loading: false });
  },

  createProject: async (title, topic) => {
    const { data, error } = await supabase
      .from("projects")
      .insert({ title, topic, status: "Draft", progress: 0 })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const project = data as Project;
    set({ current: project, projects: [project, ...get().projects] });
    return project;
  },

  selectProject: async (id) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    set({ current: data as Project });
    await get().loadEntries(id);
  },

  updateProject: async (id, patch) => {
    const { error } = await supabase
      .from("projects")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    const current = get().current;
    if (current?.id === id) set({ current: { ...current, ...patch } });
    set({
      projects: get().projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set({
      projects: get().projects.filter((p) => p.id !== id),
      current: get().current?.id === id ? null : get().current,
    });
  },

  loadEntries: async (projectId) => {
    const { data, error } = await supabase
      .from("project_entries")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) { set({ error: error.message }); return; }
    set({ entries: data as ProjectEntry[] });
  },

  saveEntry: async (projectId, type, entryData) => {
    // Upsert: replace the latest entry of this type for this project
    const existing = get().entries.filter((e) => e.entry_type === type);
    if (existing.length > 0) {
      const latest = existing[existing.length - 1];
      const { error } = await supabase
        .from("project_entries")
        .update({ data: entryData })
        .eq("id", latest.id);
      if (error) throw new Error(error.message);
      set({
        entries: get().entries.map((e) =>
          e.id === latest.id ? { ...e, data: entryData } : e
        ),
      });
    } else {
      const { data, error } = await supabase
        .from("project_entries")
        .insert({ project_id: projectId, entry_type: type, data: entryData })
        .select()
        .single();
      if (error) throw new Error(error.message);
      set({ entries: [...get().entries, data as ProjectEntry] });
    }
  },

  appendEntry: async (projectId, type, entryData) => {
    const { data, error } = await supabase
      .from("project_entries")
      .insert({ project_id: projectId, entry_type: type, data: entryData })
      .select()
      .single();
    if (error) throw new Error(error.message);
    set({ entries: [...get().entries, data as ProjectEntry] });
  },

  getEntriesByType: (type) => get().entries.filter((e) => e.entry_type === type),
}));
