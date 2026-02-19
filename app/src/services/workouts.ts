import { Q } from "@nozbe/watermelondb";
import { database, Workout, SetModel } from "../db";
import { calculate1RM } from "../utils/calculations";

const workoutsCollection = database.get<Workout>("workouts");
const setsCollection = database.get<SetModel>("sets");

export async function createWorkout(userId: string, name?: string) {
  return database.write(async () => {
    const workout = await workoutsCollection.create((w: any) => {
      w.userId = userId;
      w.name = name || null;
      w.startedAt = new Date();
      w.completedAt = null;
      w.notes = null;
    });
    return workout;
  });
}

export async function completeWorkout(workoutId: string, notes?: string) {
  return database.write(async () => {
    const workout = await workoutsCollection.find(workoutId);
    await workout.update((w: any) => {
      w.completedAt = new Date();
      if (notes) w.notes = notes;
    });
    return workout;
  });
}

export async function updateWorkoutName(workoutId: string, name: string) {
  return database.write(async () => {
    const workout = await workoutsCollection.find(workoutId);
    await workout.update((w: any) => {
      w.name = name;
    });
    return workout;
  });
}

export async function deleteWorkout(workoutId: string) {
  return database.write(async () => {
    const workout = await workoutsCollection.find(workoutId);
    // Delete all sets first
    const sets = await setsCollection.query(Q.where("workout_id", workoutId)).fetch();
    const batch: any[] = sets.map((s) => s.prepareMarkAsDeleted());
    batch.push(workout.prepareMarkAsDeleted());
    await database.batch(...batch);
  });
}

export async function logSet(
  workoutId: string,
  exerciseId: string,
  setNumber: number,
  weight: number,
  reps: number,
  rpe?: number
) {
  const calculated1rm = calculate1RM(weight, reps);

  return database.write(async () => {
    const set = await setsCollection.create((s: any) => {
      s.workoutId = workoutId;
      s.exerciseId = exerciseId;
      s.setNumber = setNumber;
      s.weight = weight;
      s.reps = reps;
      s.rpe = rpe || null;
      s.calculated1RM = calculated1rm;
    });
    return set;
  });
}

export async function updateSet(
  setId: string,
  weight: number,
  reps: number,
  rpe?: number
) {
  const calculated1rm = calculate1RM(weight, reps);

  return database.write(async () => {
    const set = await setsCollection.find(setId);
    await set.update((s: any) => {
      s.weight = weight;
      s.reps = reps;
      s.rpe = rpe !== undefined ? rpe : s.rpe;
      s.calculated1RM = calculated1rm;
    });
    return set;
  });
}

export async function deleteSet(setId: string) {
  return database.write(async () => {
    const set = await setsCollection.find(setId);
    await set.markAsDeleted();
  });
}

export async function getWorkoutHistory(userId: string) {
  return workoutsCollection
    .query(
      Q.where("user_id", userId),
      Q.sortBy("started_at", Q.desc)
    )
    .fetch();
}

export async function getActiveWorkout(userId: string) {
  const workouts = await workoutsCollection
    .query(
      Q.where("user_id", userId),
      Q.where("completed_at", null),
      Q.sortBy("started_at", Q.desc),
      Q.take(1)
    )
    .fetch();
  return workouts[0] || null;
}

export async function getWorkoutSets(workoutId: string) {
  return setsCollection
    .query(
      Q.where("workout_id", workoutId),
      Q.sortBy("set_number", Q.asc)
    )
    .fetch();
}

export async function getSetsForExercise(exerciseId: string) {
  return setsCollection
    .query(
      Q.where("exercise_id", exerciseId),
      Q.sortBy("created_at", Q.desc)
    )
    .fetch();
}

export function observeWorkoutHistory(userId: string) {
  return workoutsCollection
    .query(
      Q.where("user_id", userId),
      Q.sortBy("started_at", Q.desc)
    )
    .observe();
}

export function observeWorkoutSets(workoutId: string) {
  return setsCollection
    .query(
      Q.where("workout_id", workoutId),
      Q.sortBy("set_number", Q.asc)
    )
    .observe();
}
