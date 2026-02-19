import { useState, useEffect } from "react";
import { getSetsForExercise } from "../services/workouts";
import type SetModel from "../db/models/Set";

/**
 * Fetch and cache past sets for a given exercise.
 */
export function useExerciseHistory(exerciseId: string | null) {
  const [sets, setSets] = useState<SetModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
      setSets([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSetsForExercise(exerciseId).then((data) => {
      if (!cancelled) {
        setSets(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  // Get the best set (highest 1RM)
  const bestSet = sets.reduce<SetModel | null>((best, set) => {
    if (!best || (set.calculated1RM || 0) > (best.calculated1RM || 0)) {
      return set;
    }
    return best;
  }, null);

  // Get the most recent sets (last workout)
  const recentSets = sets.slice(0, 10);

  return {
    sets,
    bestSet,
    recentSets,
    loading,
  };
}
