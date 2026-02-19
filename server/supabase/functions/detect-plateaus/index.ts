import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface PlateauResult {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  sessions_analyzed: number;
  best_1rm_values: number[];
  is_plateaued: boolean;
  current_best_1rm: number;
  suggested_weight_increase: number;
}

serve(async (req) => {
  try {
    const { user_id, sessions = 3 } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the user's recent workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select("id, started_at")
      .eq("user_id", user_id)
      .is("deleted_at", null)
      .not("completed_at", "is", null)
      .order("started_at", { ascending: false });

    if (workoutsError) {
      return new Response(
        JSON.stringify({ error: workoutsError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!workouts || workouts.length === 0) {
      return new Response(
        JSON.stringify({ plateaus: [], message: "No completed workouts found" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const workoutIds = workouts.map((w) => w.id);

    // Get all sets from these workouts with exercise info
    const { data: sets, error: setsError } = await supabase
      .from("sets")
      .select("id, workout_id, exercise_id, weight, reps, calculated_1rm, exercises(name, muscle_group)")
      .in("workout_id", workoutIds)
      .is("deleted_at", null)
      .not("calculated_1rm", "is", null);

    if (setsError) {
      return new Response(
        JSON.stringify({ error: setsError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!sets || sets.length === 0) {
      return new Response(
        JSON.stringify({ plateaus: [], message: "No sets with calculated 1RM found" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Build a map of workout_id -> workout index (chronological order, most recent = 0)
    const workoutIndexMap = new Map<string, number>();
    workouts.forEach((w, i) => {
      workoutIndexMap.set(w.id, i);
    });

    // Group sets by exercise, then by workout session
    const exerciseMap = new Map<
      string,
      {
        name: string;
        muscle_group: string;
        sessionBests: Map<number, number>; // workoutIndex -> best 1RM in that session
      }
    >();

    for (const set of sets) {
      const exerciseId = set.exercise_id;
      const workoutIndex = workoutIndexMap.get(set.workout_id);
      if (workoutIndex === undefined) continue;

      if (!exerciseMap.has(exerciseId)) {
        const exercise = set.exercises as any;
        exerciseMap.set(exerciseId, {
          name: exercise?.name || "Unknown",
          muscle_group: exercise?.muscle_group || "unknown",
          sessionBests: new Map(),
        });
      }

      const entry = exerciseMap.get(exerciseId)!;
      const currentBest = entry.sessionBests.get(workoutIndex) || 0;
      if (set.calculated_1rm > currentBest) {
        entry.sessionBests.set(workoutIndex, set.calculated_1rm);
      }
    }

    // Analyze each exercise for plateaus
    const plateaus: PlateauResult[] = [];

    for (const [exerciseId, entry] of exerciseMap) {
      // Get the best 1RM values for the most recent N sessions (in chronological order)
      const sortedSessionIndices = Array.from(entry.sessionBests.keys())
        .sort((a, b) => a - b) // ascending by index (0 = most recent)
        .slice(0, sessions);

      if (sortedSessionIndices.length < sessions) {
        // Not enough sessions to determine a plateau
        continue;
      }

      // Get 1RM values in chronological order (reverse the indices since 0 = most recent)
      const best1rmValues = sortedSessionIndices
        .reverse()
        .map((idx) => entry.sessionBests.get(idx)!);

      // Check for plateau: no increase in best 1RM across the last N sessions
      // A plateau is when the max 1RM hasn't increased from the first to the last session
      const firstSessionBest = best1rmValues[0];
      const lastSessionBest = best1rmValues[best1rmValues.length - 1];
      const maxAcrossSessions = Math.max(...best1rmValues);
      const isPlateaued = lastSessionBest <= firstSessionBest;

      if (isPlateaued) {
        // Suggest a small weight increase (2.5% of current best, rounded to nearest 2.5 lbs/kg)
        const currentBest = maxAcrossSessions;
        const rawIncrease = currentBest * 0.025;
        const suggestedIncrease = Math.max(2.5, Math.round(rawIncrease / 2.5) * 2.5);

        plateaus.push({
          exercise_id: exerciseId,
          exercise_name: entry.name,
          muscle_group: entry.muscle_group,
          sessions_analyzed: sessions,
          best_1rm_values: best1rmValues,
          is_plateaued: true,
          current_best_1rm: currentBest,
          suggested_weight_increase: suggestedIncrease,
        });
      }
    }

    // Sort plateaus by muscle group for organized output
    plateaus.sort((a, b) => a.muscle_group.localeCompare(b.muscle_group));

    return new Response(
      JSON.stringify({
        user_id,
        sessions_checked: sessions,
        total_exercises_analyzed: exerciseMap.size,
        plateaus_detected: plateaus.length,
        plateaus,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
