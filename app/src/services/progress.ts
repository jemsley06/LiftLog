import { database } from "../db";
import { percentageChange, isPlateaued } from "../utils/calculations";

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

interface WorkoutRecord {
  id: string;
  user_id: string;
  started_at: number;
  completed_at: number | null;
  [key: string]: any;
}

const setsCol = database.get<SetRecord>("sets");
const workoutsCol = database.get<WorkoutRecord>("workouts");

export interface ExerciseProgressPoint {
  date: Date;
  best1RM: number;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
}

export interface ExerciseStats {
  exerciseId: string;
  exerciseName: string;
  currentBest1RM: number;
  previousBest1RM: number;
  change1RM: number;
  isPlateaued: boolean;
  totalSets: number;
  totalVolume: number;
}

export async function getExerciseProgress(
  exerciseId: string,
  userId: string
): Promise<ExerciseProgressPoint[]> {
  const userWorkouts = await workoutsCol.query(
    (w) => w.user_id === userId && w.completed_at !== null
  );
  userWorkouts.sort((a, b) => a.started_at - b.started_at);

  const workoutIds = new Set(userWorkouts.map((w) => w.id));
  if (workoutIds.size === 0) return [];

  const allSets = await setsCol.query(
    (s) => s.exercise_id === exerciseId && workoutIds.has(s.workout_id)
  );

  const setsByWorkout = new Map<string, SetRecord[]>();
  for (const set of allSets) {
    const existing = setsByWorkout.get(set.workout_id) || [];
    existing.push(set);
    setsByWorkout.set(set.workout_id, existing);
  }

  const points: ExerciseProgressPoint[] = [];
  for (const workout of userWorkouts) {
    const workoutSets = setsByWorkout.get(workout.id);
    if (!workoutSets || workoutSets.length === 0) continue;

    const best = workoutSets.reduce((best, set) => {
      const orm = set.calculated_1rm || 0;
      return orm > (best.calculated_1rm || 0) ? set : best;
    }, workoutSets[0]);

    points.push({
      date: new Date(workout.started_at),
      best1RM: best.calculated_1rm || 0,
      bestWeight: best.weight,
      bestReps: best.reps,
      totalVolume: workoutSets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    });
  }

  return points;
}

export async function getBest1RM(exerciseId: string): Promise<number> {
  const allSets = await setsCol.query((s) => s.exercise_id === exerciseId);
  if (allSets.length === 0) return 0;
  return Math.max(...allSets.map((s) => s.calculated_1rm || 0));
}

export async function getWorkoutStats(
  workoutId: string,
  userId: string
): Promise<ExerciseStats[]> {
  const allSets = await setsCol.query((s) => s.workout_id === workoutId);
  const exercisesCol = database.get<any>("exercises");

  const byExercise = new Map<string, SetRecord[]>();
  for (const set of allSets) {
    const existing = byExercise.get(set.exercise_id) || [];
    existing.push(set);
    byExercise.set(set.exercise_id, existing);
  }

  const stats: ExerciseStats[] = [];

  for (const [exerciseId, exerciseSets] of byExercise) {
    const exercise = await exercisesCol.find(exerciseId);
    const currentBest = Math.max(
      ...exerciseSets.map((s) => s.calculated_1rm || 0)
    );

    const previousProgress = await getExerciseProgress(exerciseId, userId);
    const previousBest =
      previousProgress.length >= 2
        ? previousProgress[previousProgress.length - 2].best1RM
        : 0;

    const recent1RMs = previousProgress
      .slice(-4)
      .reverse()
      .map((p) => p.best1RM);

    stats.push({
      exerciseId,
      exerciseName: exercise?.name || "Unknown",
      currentBest1RM: currentBest,
      previousBest1RM: previousBest,
      change1RM: percentageChange(previousBest, currentBest),
      isPlateaued: isPlateaued(recent1RMs),
      totalSets: exerciseSets.length,
      totalVolume: exerciseSets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    });
  }

  return stats;
}
