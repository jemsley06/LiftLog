import { database } from "../db";
import { DEFAULT_EXERCISES } from "../constants/exercises";

interface ExerciseRecord {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  is_custom: boolean;
  created_by: string | null;
  [key: string]: any;
}

const exercisesCol = database.get<ExerciseRecord>("exercises");

export async function getAllExercises() {
  return exercisesCol.query();
}

export async function getExercisesByMuscleGroup(muscleGroup: string) {
  return exercisesCol.query((e) => e.muscle_group === muscleGroup);
}

export async function searchExercises(query: string) {
  const lowerQuery = query.toLowerCase();
  return exercisesCol.query((e) =>
    e.name.toLowerCase().includes(lowerQuery)
  );
}

export async function createCustomExercise(
  name: string,
  muscleGroup: string,
  equipment: string,
  userId: string
) {
  return exercisesCol.create({
    name,
    muscle_group: muscleGroup,
    equipment,
    is_custom: true,
    created_by: userId,
  } as any);
}

export async function deleteCustomExercise(exerciseId: string) {
  const exercise = await exercisesCol.find(exerciseId);
  if (exercise && exercise.is_custom) {
    await exercisesCol.remove(exerciseId);
  }
}

/**
 * Seed the local database with default exercises if they don't already exist.
 */
export async function seedDefaultExercises() {
  const count = await exercisesCol.count();
  if (count > 0) return;

  await exercisesCol.batchCreate(
    DEFAULT_EXERCISES.map((ex) => ({
      name: ex.name,
      muscle_group: ex.muscleGroup,
      equipment: ex.equipment,
      is_custom: false,
      created_by: null,
    })) as any[]
  );
}
