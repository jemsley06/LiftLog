import { Q } from "@nozbe/watermelondb";
import { database, Exercise } from "../db";
import { DEFAULT_EXERCISES } from "../constants/exercises";

const exercisesCollection = database.get<Exercise>("exercises");

export async function getAllExercises() {
  return exercisesCollection.query().fetch();
}

export async function getExercisesByMuscleGroup(muscleGroup: string) {
  return exercisesCollection
    .query(Q.where("muscle_group", muscleGroup))
    .fetch();
}

export async function searchExercises(query: string) {
  const lowerQuery = query.toLowerCase();
  const all = await exercisesCollection.query().fetch();
  return all.filter((e) => e.name.toLowerCase().includes(lowerQuery));
}

export async function createCustomExercise(
  name: string,
  muscleGroup: string,
  equipment: string,
  userId: string
) {
  return database.write(async () => {
    return exercisesCollection.create((e: any) => {
      e.name = name;
      e.muscleGroup = muscleGroup;
      e.equipment = equipment;
      e.isCustom = true;
      e.createdBy = userId;
    });
  });
}

export async function deleteCustomExercise(exerciseId: string) {
  return database.write(async () => {
    const exercise = await exercisesCollection.find(exerciseId);
    if (exercise.isCustom) {
      await exercise.markAsDeleted();
    }
  });
}

/**
 * Seed the local database with default exercises if they don't already exist.
 */
export async function seedDefaultExercises() {
  const existing = await exercisesCollection.query().fetchCount();
  if (existing > 0) return; // Already seeded

  await database.write(async () => {
    const batch = DEFAULT_EXERCISES.map((ex) =>
      exercisesCollection.prepareCreate((e: any) => {
        e.name = ex.name;
        e.muscleGroup = ex.muscleGroup;
        e.equipment = ex.equipment;
        e.isCustom = false;
        e.createdBy = null;
      })
    );
    await database.batch(...batch);
  });
}

export function observeExercises() {
  return exercisesCollection.query().observe();
}

export function observeExercisesByMuscleGroup(muscleGroup: string) {
  return exercisesCollection
    .query(Q.where("muscle_group", muscleGroup))
    .observe();
}
