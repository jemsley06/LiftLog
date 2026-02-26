import { database } from "../db";
import { calculate1RM } from "../utils/calculations";

interface WorkoutRecord {
  id: string;
  user_id: string;
  name: string | null;
  started_at: number;
  completed_at: number | null;
  notes: string | null;
  [key: string]: any;
}

interface SetRecord {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  calculated_1rm: number | null;
  [key: string]: any;
}

const workoutsCol = database.get<WorkoutRecord>("workouts");
const setsCol = database.get<SetRecord>("sets");

export async function createWorkout(userId: string, name?: string) {
  return workoutsCol.create({
    user_id: userId,
    name: name || null,
    started_at: Date.now(),
    completed_at: null,
    notes: null,
  } as any);
}

export async function completeWorkout(workoutId: string, notes?: string) {
  return workoutsCol.update(workoutId, {
    completed_at: Date.now(),
    ...(notes ? { notes } : {}),
  });
}

export async function updateWorkoutName(workoutId: string, name: string) {
  return workoutsCol.update(workoutId, { name });
}

export async function deleteWorkout(workoutId: string) {
  const workoutSets = await setsCol.query((s) => s.workout_id === workoutId);
  for (const s of workoutSets) {
    await setsCol.remove(s.id);
  }
  await workoutsCol.remove(workoutId);
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
  return setsCol.create({
    workout_id: workoutId,
    exercise_id: exerciseId,
    set_number: setNumber,
    weight,
    reps,
    rpe: rpe || null,
    calculated_1rm: calculated1rm,
  } as any);
}

export async function updateSet(
  setId: string,
  weight: number,
  reps: number,
  rpe?: number
) {
  const calculated1rm = calculate1RM(weight, reps);
  return setsCol.update(setId, {
    weight,
    reps,
    ...(rpe !== undefined ? { rpe } : {}),
    calculated_1rm: calculated1rm,
  });
}

export async function deleteSet(setId: string) {
  return setsCol.remove(setId);
}

export async function getWorkoutHistory(userId: string) {
  const all = await workoutsCol.query((w) => w.user_id === userId);
  return all.sort((a, b) => b.started_at - a.started_at);
}

export async function getActiveWorkout(userId: string) {
  const all = await workoutsCol.query(
    (w) => w.user_id === userId && w.completed_at === null
  );
  return all.sort((a, b) => b.started_at - a.started_at)[0] || null;
}

export async function getWorkoutSets(workoutId: string) {
  const all = await setsCol.query((s) => s.workout_id === workoutId);
  return all.sort((a, b) => a.set_number - b.set_number);
}

export async function getSetsForExercise(exerciseId: string) {
  const all = await setsCol.query((s) => s.exercise_id === exerciseId);
  return all.sort((a, b) => b.created_at - a.created_at);
}
