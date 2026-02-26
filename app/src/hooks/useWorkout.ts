import { useState, useEffect, useCallback } from "react";
import { useWorkoutContext } from "../providers/WorkoutProvider";
import { getWorkoutSets } from "../services/workouts";
import { scoreSetForParty } from "../services/partyScoring";
import { useAuth } from "../providers/AuthProvider";
import { calculate1RM } from "../utils/calculations";

interface SetData {
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

/**
 * Hook for managing the active workout session.
 * Polls for sets when a workout is active.
 */
export function useWorkout() {
  const context = useWorkoutContext();
  const { user } = useAuth();
  const [sets, setSets] = useState<SetData[]>([]);

  const refreshSets = useCallback(async () => {
    if (!context.activeWorkout) {
      setSets([]);
      return;
    }
    const data = await getWorkoutSets(context.activeWorkout.id);
    setSets(data as SetData[]);
  }, [context.activeWorkout?.id]);

  useEffect(() => {
    refreshSets();
  }, [refreshSets]);

  // Group sets by exercise
  const exerciseSets = sets.reduce<Record<string, SetData[]>>((acc, set) => {
    const key = set.exercise_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(set);
    return acc;
  }, {});

  // Wrap addSet to auto-refresh and score for party
  const addSet = async (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    rpe?: number
  ) => {
    const result = await context.addSet(exerciseId, setNumber, weight, reps, rpe);
    await refreshSets();

    // If in a party, score this set
    if (context.activePartyId && user) {
      const calculated1rm = calculate1RM(weight, reps);
      scoreSetForParty(
        exerciseId,
        calculated1rm,
        user.id,
        context.activePartyId
      ).catch((err) => console.error("Party scoring failed:", err));
    }

    return result;
  };

  const removeSet = async (setId: string) => {
    await context.removeSet(setId);
    await refreshSets();
  };

  return {
    ...context,
    addSet,
    removeSet,
    sets,
    exerciseSets,
  };
}
