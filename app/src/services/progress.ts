import { Q } from "@nozbe/watermelondb";
import { database, SetModel, Workout } from "../db";
import { calculate1RM, percentageChange, isPlateaued } from "../utils/calculations";

const setsCollection = database.get<SetModel>("sets");
const workoutsCollection = database.get<Workout>("workouts");

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

/**
 * Get progress data points for a specific exercise over time.
 */
export async function getExerciseProgress(
  exerciseId: string,
  userId: string
): Promise<ExerciseProgressPoint[]> {
  const userWorkouts = await workoutsCollection
    .query(
      Q.where("user_id", userId),
      Q.where("completed_at", Q.notEq(null)),
      Q.sortBy("started_at", Q.asc)
    )
    .fetch();

  const workoutIds = userWorkouts.map((w) => w.id);
  if (workoutIds.length === 0) return [];

  const sets = await setsCollection
    .query(
      Q.where("exercise_id", exerciseId),
      Q.where("workout_id", Q.oneOf(workoutIds))
    )
    .fetch();

  // Group sets by workout
  const setsByWorkout = new Map<string, SetModel[]>();
  for (const set of sets) {
    const existing = setsByWorkout.get(set.workoutId) || [];
    existing.push(set);
    setsByWorkout.set(set.workoutId, existing);
  }

  // Build progress points per workout
  const points: ExerciseProgressPoint[] = [];
  for (const workout of userWorkouts) {
    const workoutSets = setsByWorkout.get(workout.id);
    if (!workoutSets || workoutSets.length === 0) continue;

    const best = workoutSets.reduce((best, set) => {
      const orm = set.calculated1RM || 0;
      return orm > (best.calculated1RM || 0) ? set : best;
    }, workoutSets[0]);

    points.push({
      date: workout.startedAt,
      best1RM: best.calculated1RM || 0,
      bestWeight: best.weight,
      bestReps: best.reps,
      totalVolume: workoutSets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    });
  }

  return points;
}

/**
 * Get the user's best 1RM for a specific exercise.
 */
export async function getBest1RM(exerciseId: string): Promise<number> {
  const sets = await setsCollection
    .query(
      Q.where("exercise_id", exerciseId),
      Q.sortBy("calculated_1rm", Q.desc),
      Q.take(1)
    )
    .fetch();

  return sets[0]?.calculated1RM || 0;
}

/**
 * Get stats for all exercises in a completed workout.
 */
export async function getWorkoutStats(
  workoutId: string,
  userId: string
): Promise<ExerciseStats[]> {
  const sets = await setsCollection
    .query(Q.where("workout_id", workoutId))
    .fetch();

  // Group by exercise
  const byExercise = new Map<string, SetModel[]>();
  for (const set of sets) {
    const existing = byExercise.get(set.exerciseId) || [];
    existing.push(set);
    byExercise.set(set.exerciseId, existing);
  }

  const stats: ExerciseStats[] = [];
  const exercisesCollection = database.get("exercises");

  for (const [exerciseId, exerciseSets] of byExercise) {
    const exercise = await exercisesCollection.find(exerciseId);

    const currentBest = Math.max(
      ...exerciseSets.map((s) => s.calculated1RM || 0)
    );

    // Get previous workout's best for this exercise
    const previousProgress = await getExerciseProgress(exerciseId, userId);
    const previousBest =
      previousProgress.length >= 2
        ? previousProgress[previousProgress.length - 2].best1RM
        : 0;

    // Check plateau
    const recent1RMs = previousProgress
      .slice(-4)
      .reverse()
      .map((p) => p.best1RM);

    stats.push({
      exerciseId,
      exerciseName: (exercise as any).name,
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
