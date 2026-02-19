import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ExerciseSummary {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  total_sets: number;
  total_reps: number;
  total_volume: number; // weight * reps summed across all sets
  best_set: {
    weight: number;
    reps: number;
    rpe: number | null;
    calculated_1rm: number | null;
  };
  estimated_1rm: number | null;
  previous_best_1rm: number | null;
  one_rm_change: number | null; // difference from previous workout's best 1RM
  one_rm_change_pct: number | null; // percentage change
  previous_volume: number | null;
  volume_change: number | null;
  volume_change_pct: number | null;
}

interface WorkoutSummary {
  workout_id: string;
  workout_name: string | null;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
  total_exercises: number;
  total_sets: number;
  total_reps: number;
  total_volume: number;
  exercises: ExerciseSummary[];
}

serve(async (req) => {
  try {
    const { workout_id } = await req.json();

    if (!workout_id) {
      return new Response(
        JSON.stringify({ error: "workout_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the workout
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("id, user_id, name, started_at, completed_at, notes")
      .eq("id", workout_id)
      .single();

    if (workoutError || !workout) {
      return new Response(
        JSON.stringify({ error: "Workout not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all sets for this workout with exercise info
    const { data: sets, error: setsError } = await supabase
      .from("sets")
      .select("id, exercise_id, set_number, weight, reps, rpe, calculated_1rm, exercises(name, muscle_group)")
      .eq("workout_id", workout_id)
      .is("deleted_at", null)
      .order("exercise_id")
      .order("set_number");

    if (setsError) {
      return new Response(
        JSON.stringify({ error: setsError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!sets || sets.length === 0) {
      return new Response(
        JSON.stringify({
          ...workout,
          total_exercises: 0,
          total_sets: 0,
          total_reps: 0,
          total_volume: 0,
          exercises: [],
          message: "No sets found for this workout",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the user's previous workouts (before this one) for comparison
    const { data: previousWorkouts } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", workout.user_id)
      .is("deleted_at", null)
      .lt("started_at", workout.started_at)
      .order("started_at", { ascending: false });

    const previousWorkoutIds = (previousWorkouts || []).map((w) => w.id);

    // Group sets by exercise
    const exerciseGroups = new Map<
      string,
      {
        name: string;
        muscle_group: string;
        sets: typeof sets;
      }
    >();

    for (const set of sets) {
      const exerciseId = set.exercise_id;
      if (!exerciseGroups.has(exerciseId)) {
        const exercise = set.exercises as any;
        exerciseGroups.set(exerciseId, {
          name: exercise?.name || "Unknown",
          muscle_group: exercise?.muscle_group || "unknown",
          sets: [],
        });
      }
      exerciseGroups.get(exerciseId)!.sets.push(set);
    }

    // For each exercise, compute summary and compare to previous workout
    const exerciseSummaries: ExerciseSummary[] = [];

    for (const [exerciseId, group] of exerciseGroups) {
      const totalSets = group.sets.length;
      const totalReps = group.sets.reduce((sum, s) => sum + s.reps, 0);
      const totalVolume = group.sets.reduce(
        (sum, s) => sum + s.weight * s.reps,
        0
      );

      // Find the best set (highest calculated_1rm, or highest weight * reps if no 1RM)
      let bestSet = group.sets[0];
      for (const s of group.sets) {
        if (s.calculated_1rm && bestSet.calculated_1rm) {
          if (s.calculated_1rm > bestSet.calculated_1rm) {
            bestSet = s;
          }
        } else if (s.weight * s.reps > bestSet.weight * bestSet.reps) {
          bestSet = s;
        }
      }

      const estimated1rm = bestSet.calculated_1rm || null;

      // Get previous workout's data for this exercise
      let previous_best_1rm: number | null = null;
      let previous_volume: number | null = null;

      if (previousWorkoutIds.length > 0) {
        // Find the most recent previous workout that included this exercise
        const { data: prevSets } = await supabase
          .from("sets")
          .select("weight, reps, calculated_1rm, workout_id")
          .eq("exercise_id", exerciseId)
          .in("workout_id", previousWorkoutIds)
          .is("deleted_at", null)
          .order("calculated_1rm", { ascending: false });

        if (prevSets && prevSets.length > 0) {
          // Find the most recent workout that had this exercise
          const mostRecentWorkoutId = prevSets[0].workout_id;
          const mostRecentPrevSets = prevSets.filter(
            (s) => s.workout_id === mostRecentWorkoutId
          );

          // Best 1RM from previous
          const prevBest1rm = mostRecentPrevSets.reduce(
            (max, s) => Math.max(max, s.calculated_1rm || 0),
            0
          );
          if (prevBest1rm > 0) {
            previous_best_1rm = prevBest1rm;
          }

          // Previous volume
          previous_volume = mostRecentPrevSets.reduce(
            (sum, s) => sum + s.weight * s.reps,
            0
          );
        }
      }

      // Calculate changes
      let one_rm_change: number | null = null;
      let one_rm_change_pct: number | null = null;
      if (estimated1rm !== null && previous_best_1rm !== null) {
        one_rm_change = estimated1rm - previous_best_1rm;
        one_rm_change_pct =
          previous_best_1rm > 0
            ? ((estimated1rm - previous_best_1rm) / previous_best_1rm) * 100
            : null;
      }

      let volume_change: number | null = null;
      let volume_change_pct: number | null = null;
      if (previous_volume !== null) {
        volume_change = totalVolume - previous_volume;
        volume_change_pct =
          previous_volume > 0
            ? ((totalVolume - previous_volume) / previous_volume) * 100
            : null;
      }

      exerciseSummaries.push({
        exercise_id: exerciseId,
        exercise_name: group.name,
        muscle_group: group.muscle_group,
        total_sets: totalSets,
        total_reps: totalReps,
        total_volume: totalVolume,
        best_set: {
          weight: bestSet.weight,
          reps: bestSet.reps,
          rpe: bestSet.rpe,
          calculated_1rm: bestSet.calculated_1rm,
        },
        estimated_1rm: estimated1rm,
        previous_best_1rm,
        one_rm_change,
        one_rm_change_pct: one_rm_change_pct
          ? Math.round(one_rm_change_pct * 100) / 100
          : null,
        previous_volume,
        volume_change,
        volume_change_pct: volume_change_pct
          ? Math.round(volume_change_pct * 100) / 100
          : null,
      });
    }

    // Compute workout-level totals
    const totalExercises = exerciseSummaries.length;
    const totalSets = exerciseSummaries.reduce((sum, e) => sum + e.total_sets, 0);
    const totalReps = exerciseSummaries.reduce((sum, e) => sum + e.total_reps, 0);
    const totalVolume = exerciseSummaries.reduce(
      (sum, e) => sum + e.total_volume,
      0
    );

    // Calculate duration
    let durationMinutes: number | null = null;
    if (workout.completed_at && workout.started_at) {
      const start = new Date(workout.started_at).getTime();
      const end = new Date(workout.completed_at).getTime();
      durationMinutes = Math.round((end - start) / 60000);
    }

    const summary: WorkoutSummary = {
      workout_id: workout.id,
      workout_name: workout.name,
      started_at: workout.started_at,
      completed_at: workout.completed_at,
      duration_minutes: durationMinutes,
      total_exercises: totalExercises,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume: totalVolume,
      exercises: exerciseSummaries,
    };

    return new Response(JSON.stringify(summary), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
