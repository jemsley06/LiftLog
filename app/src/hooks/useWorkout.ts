import { useState, useEffect, useCallback } from "react";
import { useWorkoutContext } from "../providers/WorkoutProvider";
import { observeWorkoutSets, getWorkoutSets } from "../services/workouts";
import type SetModel from "../db/models/Set";

/**
 * Hook for managing the active workout session.
 * Wraps WorkoutProvider context with observable sets.
 */
export function useWorkout() {
  const context = useWorkoutContext();
  const [sets, setSets] = useState<SetModel[]>([]);

  useEffect(() => {
    if (!context.activeWorkout) {
      setSets([]);
      return;
    }

    const subscription = observeWorkoutSets(context.activeWorkout.id).subscribe(
      (observedSets) => {
        setSets(observedSets as SetModel[]);
      }
    );

    return () => subscription.unsubscribe();
  }, [context.activeWorkout?.id]);

  // Group sets by exercise
  const exerciseSets = sets.reduce<Record<string, SetModel[]>>((acc, set) => {
    const key = set.exerciseId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(set);
    return acc;
  }, {});

  return {
    ...context,
    sets,
    exerciseSets,
  };
}
