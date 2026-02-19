/**
 * Party scoring constants and helper functions.
 *
 * Party scoring is intensity-based: each set is scored by comparing
 * its estimated 1RM to the user's all-time best 1RM for that exercise.
 * A user's total party score is the sum of all their individual set
 * scores during the session. The user with the highest total score
 * when the party ends wins.
 *
 * Formula: intensity = (set1RM / best1RM) * 100
 *
 * This means a set that matches the user's PR scores 100, a set at
 * 90% of their best scores 90, and a set that exceeds their best
 * (a new PR) scores above 100.
 */

/**
 * Human-readable description of the intensity scoring formula.
 */
export const INTENSITY_FORMULA =
  'Intensity Score = (set1RM / best1RM) * 100 — measures set difficulty as a percentage of the user\'s all-time best estimated 1RM for the exercise.';

/**
 * Number of consecutive sessions with no improvement in best-set 1RM
 * before an exercise is flagged as plateaued.
 */
export const PLATEAU_THRESHOLD = 3;

/**
 * Calculate the intensity score for a single set.
 *
 * @param set1RM  - The estimated 1RM for this specific set (via Brzycki formula).
 * @param best1RM - The user's all-time best estimated 1RM for the exercise.
 * @returns The intensity score as a percentage. Returns 0 if `best1RM` is 0
 *          to prevent division by zero.
 *
 * @example
 * ```ts
 * // Set that matches the user's PR
 * calculateIntensityScore(225, 225); // => 100
 *
 * // Set at 90% of best
 * calculateIntensityScore(202.5, 225); // => 90
 *
 * // New PR set
 * calculateIntensityScore(235, 225); // => ~104.44
 * ```
 */
export function calculateIntensityScore(set1RM: number, best1RM: number): number {
  if (best1RM === 0) {
    return 0;
  }
  return (set1RM / best1RM) * 100;
}

/**
 * Calculate the total party score from an array of individual set scores.
 *
 * @param setScores - Array of intensity scores for each set logged during the party.
 * @returns The sum of all set scores. Returns 0 for an empty array.
 *
 * @example
 * ```ts
 * calculateTotalPartyScore([95, 100, 88, 102]); // => 385
 * calculateTotalPartyScore([]);                  // => 0
 * ```
 */
export function calculateTotalPartyScore(setScores: number[]): number {
  return setScores.reduce((total, score) => total + score, 0);
}
