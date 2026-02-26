import { database } from "../db";

interface TemplateRecord {
  id: string;
  user_id: string;
  name: string;
  exercise_ids: string;  // JSON stringified array
  created_at: number;
  updated_at: number;
  [key: string]: any;
}

const templatesCol = database.get<TemplateRecord>("workout_templates");

export async function getTemplates(userId: string) {
  const all = await templatesCol.query((t) => t.user_id === userId);
  return all.sort((a, b) => b.updated_at - a.updated_at).map((t) => ({
    ...t,
    exercise_ids: JSON.parse(t.exercise_ids || "[]") as string[],
  }));
}

export async function getTemplate(templateId: string) {
  const t = await templatesCol.find(templateId);
  if (!t) return null;
  return {
    ...t,
    exercise_ids: JSON.parse(t.exercise_ids || "[]") as string[],
  };
}

export async function createTemplate(
  userId: string,
  name: string,
  exerciseIds: string[]
) {
  return templatesCol.create({
    user_id: userId,
    name,
    exercise_ids: JSON.stringify(exerciseIds),
  } as any);
}

export async function updateTemplate(
  templateId: string,
  name: string,
  exerciseIds: string[]
) {
  return templatesCol.update(templateId, {
    name,
    exercise_ids: JSON.stringify(exerciseIds),
  });
}

export async function deleteTemplate(templateId: string) {
  return templatesCol.remove(templateId);
}
