import { useEffect, useCallback } from "react";
import { useProjectStore } from "./projectStore";

/**
 * Ensures the project list is loaded and provides the current project.
 * Pages call useProjectContext() to get the active project + helpers.
 */
export function useProjectContext() {
  const {
    projects,
    current,
    entries,
    loading,
    error,
    loadProjects,
    createProject,
    selectProject,
    updateProject,
    deleteProject,
    loadEntries,
    saveEntry,
    appendEntry,
    getEntriesByType,
  } = useProjectStore();

  useEffect(() => {
    if (projects.length === 0 && !loading) {
      loadProjects();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ensureProject = useCallback(
    async (topic: string): Promise<string> => {
      if (current) return current.id;
      const project = await createProject(`Documentary: ${topic}`, topic);
      return project.id;
    },
    [current, createProject]
  );

  return {
    projects,
    current,
    entries,
    loading,
    error,
    loadProjects,
    createProject,
    selectProject,
    updateProject,
    deleteProject,
    loadEntries,
    saveEntry,
    appendEntry,
    getEntriesByType,
    ensureProject,
  };
}
