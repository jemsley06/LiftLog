/**
 * All 1RM and strength calculation formulas.
 * Single source of truth — no inline formulas elsewhere in the app.
 */

/**
 * Brzycki 1RM Formula: 1RM = weight × (36 / (37 - reps))
 * Valid for reps <= 36. Returns the weight itself for 1 rep.
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps > 36) return 0; // Brzycki not valid beyond 36 reps
  return Math.round((weight * (36 / (37 - reps))) * 100) / 100;
}

/**
 * Strength % (Set Difficulty): compares a set's 1RM to the user's best 1RM
 * for that exercise. Returns a percentage (0-100+).
 * A value > 100 means a new PR was set.
 */
export function calculateStrengthPercentage(
  set1RM: number,
  best1RM: number
): number {
  if (best1RM <= 0) return 0;
  return Math.round((set1RM / best1RM) * 10000) / 100;
}

/**
 * Plateau Detection: checks if the last N sessions show no increase
 * in best-set 1RM compared to the session before them.
 * @param recentBest1RMs - Array of best 1RM values per session, most recent first
 * @param threshold - Number of sessions with no improvement to flag plateau (default 3)
 * @returns true if exercise is plateaued
 */
export function isPlateaued(
  recentBest1RMs: number[],
  threshold: number = 3
): boolean {
  if (recentBest1RMs.length < threshold + 1) return false;

  const currentBest = Math.max(...recentBest1RMs.slice(0, threshold));
  const previousBest = recentBest1RMs[threshold];

  return currentBest <= previousBest;
}

/**
 * Suggests a weight increase for a plateaued exercise.
 * Standard recommendation: 5 lbs for upper body, 10 lbs for lower body.
 */
export function suggestWeightIncrease(
  currentWeight: number,
  muscleGroup: string
): number {
  const lowerBodyGroups = ["legs", "glutes"];
  const increment = lowerBodyGroups.includes(muscleGroup.toLowerCase())
    ? 10
    : 5;
  return currentWeight + increment;
}

/**
 * Party Scoring: intensity-based scoring for group lifts.
 * Score = (set_1RM / best_1RM) × 100
 */
export function calculateIntensityScore(
  set1RM: number,
  best1RM: number
): number {
  if (best1RM <= 0 || set1RM <= 0) return 0;
  return Math.round((set1RM / best1RM) * 10000) / 100;
}

/**
 * Calculate total party score from individual set scores.
 */
export function calculateTotalPartyScore(setScores: number[]): number {
  return Math.round(setScores.reduce((sum, s) => sum + s, 0) * 100) / 100;
}

/**
 * Calculate volume for a set (weight × reps).
 */
export function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Calculate total volume for multiple sets.
 */
export function calculateTotalVolume(
  sets: Array<{ weight: number; reps: number }>
): number {
  return sets.reduce((total, set) => total + calculateVolume(set.weight, set.reps), 0);
}

/**
 * Calculate percentage change between two values.
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 10000) / 100;
}
