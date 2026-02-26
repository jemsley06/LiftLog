import { useState, useEffect, useCallback } from "react";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../services/templates";
import { useAuth } from "../providers/AuthProvider";

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTemplates(user.id);
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (name: string, exerciseIds: string[]) => {
      if (!user) return;
      await createTemplate(user.id, name, exerciseIds);
      await refresh();
    },
    [user?.id, refresh]
  );

  const update = useCallback(
    async (templateId: string, name: string, exerciseIds: string[]) => {
      await updateTemplate(templateId, name, exerciseIds);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (templateId: string) => {
      await deleteTemplate(templateId);
      await refresh();
    },
    [refresh]
  );

  return {
    templates,
    loading,
    refresh,
    createTemplate: create,
    updateTemplate: update,
    deleteTemplate: remove,
  };
}
