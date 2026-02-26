import { supabase } from "./supabase";
import { database } from "../db";
import { calculateIntensityScore } from "../utils/calculations";

/**
 * Called after logging a set during an active party.
 * Calculates the intensity score client-side and pushes the
 * score delta to the party_members table in Supabase.
 */
export async function scoreSetForParty(
  exerciseId: string,
  calculated1rm: number,
  userId: string,
  partyId: string
) {
  // Find user's best 1RM for this exercise from local DB
  const setsCol = database.get("sets");
  const allSets = await setsCol.query(
    (s: any) => s.exercise_id === exerciseId && s.calculated_1rm !== null
  );

  let best1rm = calculated1rm;
  for (const s of allSets) {
    if ((s as any).calculated_1rm > best1rm) {
      best1rm = (s as any).calculated_1rm;
    }
  }

  const intensityScore = calculateIntensityScore(calculated1rm, best1rm);

  // Get current score from Supabase and update with delta
  const { data: member, error: fetchError } = await supabase
    .from("party_members")
    .select("score")
    .eq("party_id", partyId)
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch party member score:", fetchError);
    return;
  }

  const newTotal = (member?.score || 0) + intensityScore;
  const { error: updateError } = await supabase
    .from("party_members")
    .update({ score: newTotal })
    .eq("party_id", partyId)
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update party score:", updateError);
  }

  return { intensityScore, newTotal };
}
