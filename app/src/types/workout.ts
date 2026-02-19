/**
 * Type definitions for workouts, exercises, and sets.
 *
 * These types mirror the Supabase/WatermelonDB schema defined in
 * the database migrations and are used throughout the app for
 * type-safe data handling.
 */

/** Muscle groups available in the exercise library. */
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'legs'
  | 'arms'
  | 'core';

/** Equipment categories for exercises. */
export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight';

/**
 * An exercise in the library (global or user-created).
 *
 * Global exercises have `isCustom = false` and `createdBy = null`.
 * User-created exercises have `isCustom = true` and reference the
 * creating user's profile ID.
 */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  isCustom: boolean;
  createdBy: string | null;
}

/**
 * A single training session.
 *
 * `completedAt` is `null` while the workout is still in progress.
 */
export interface Workout {
  id: string;
  userId: string;
  name: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
}

/**
 * An individual set within a workout, linked to an exercise.
 *
 * `calculated1RM` is computed via the Brzycki formula at creation time.
 * `rpe` (Rate of Perceived Exertion) is optional.
 */
export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  calculated1RM: number;
  createdAt: string;
}

/**
 * An exercise paired with its logged sets, used for display purposes
 * (e.g., showing all sets grouped under their exercise within a workout).
 */
export interface ExerciseLog {
  exercise: Exercise;
  sets: WorkoutSet[];
}

/**
 * A complete workout with all of its exercise logs.
 *
 * Used when rendering a full workout detail view or the post-workout
 * summary screen.
 */
export interface WorkoutWithSets {
  workout: Workout;
  exerciseLogs: ExerciseLog[];
}
